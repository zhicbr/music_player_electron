// 歌词相关变量
let lyrics = []; // 存储解析后的歌词
let currentLyricIndex = -1; // 当前显示的歌词索引
let lyricsScrollTimeout; // 用于歌词自动滚动的定时器

// 歌词解析函数
function parseLyrics(content) {
    const lines = content.split('\n');
    const regex = /\[(\d{2}):(\d{2}\.\d{2,3})\](.*)/; // 修改正则表达式以匹配2位或3位小数
    const parsed = [];
    let prevTime = null;

    lines.forEach(line => {
        const match = line.match(regex);
        if (match) {
            const minutes = parseInt(match[1], 10);
            const seconds = parseFloat(match[2]);
            const time = minutes * 60 + seconds;
            const text = match[3].trim();

            if (prevTime === time) {
                // 如果时间相同，合并歌词（用于中英文双语歌词）
                parsed[parsed.length - 1].text += '\n' + text;
            } else {
                parsed.push({ time, text });
                prevTime = time;
            }
        }
    });

    return parsed.sort((a, b) => a.time - b.time); // 按时间排序
}
// 歌词更新函数
function updateLyrics() {
    if (!lyrics.length) return; // 如果没有歌词，直接返回
    const currentTime = audio.currentTime;

    // 找到当前应该显示的歌词
    let newIndex = -1;
    for (let i = 0; i < lyrics.length; i++) {
        if (lyrics[i].time > currentTime) break;
        newIndex = i;
    }

    // 如果当前歌词索引发生变化，更新显示
    if (newIndex !== currentLyricIndex) {
        currentLyricIndex = newIndex;
        const lyricsContainer = document.getElementById('lyrics-container');
        const lyricElements = lyricsContainer.querySelectorAll('p');

        // 更新歌词高亮状态
        lyricElements.forEach((p, i) => {
            if (i === currentLyricIndex) {
                p.classList.add('highlight'); // 高亮当前歌词
            } else {
                p.classList.remove('highlight'); // 其他歌词正常显示
            }
        });

        // 自动滚动到当前歌词
        const currentLyricElement = lyricsContainer.querySelector('.highlight');
        if (currentLyricElement) {
            currentLyricElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // 重置自动滚动定时器
    clearTimeout(lyricsScrollTimeout);
    lyricsScrollTimeout = setTimeout(() => {
        const currentLyricElement = document.getElementById('lyrics-container').querySelector('.highlight');
        if (currentLyricElement) {
            currentLyricElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 3000); // 3秒后自动滚动到当前歌词
}
