// 修改后的播放控制函数
async function playTrack(track) {
    // 增加新的请求ID
    const requestId = ++currentPlayRequest;

    // 停止当前播放的音频并解除事件监听
    if (!audio.paused) {
        audio.pause();
        audio.removeEventListener('timeupdate', updateProgress);
        audio.removeEventListener('ended', handleTrackEnd);
        audio.removeEventListener('play', updatePlayPauseButton);
        audio.removeEventListener('pause', updatePlayPauseButton);
    }

    isAudioLoading = true;

    // 立即重置UI状态
    document.getElementById('progress-bar').value = 0;
    document.getElementById('current-time').textContent = '0:00';
    document.getElementById('duration').textContent = '0:00';

    const coverImg = document.getElementById('album-cover');
    const playPauseIcon = document.getElementById('play-pause').querySelector('i');

    // 创建新的音频实例
    const newAudio = new Audio();
    newAudio.preload = 'metadata';

    // 加载元数据
    await new Promise((resolve) => {
        newAudio.src = track.path;
        newAudio.addEventListener('loadedmetadata', () => {
            // 若当前请求非最新，则直接停止该音频并退出
            if (requestId !== currentPlayRequest) {
                newAudio.pause();
                return resolve();
            }
            // 更新持续时间显示
            document.getElementById('duration').textContent = formatDuration(newAudio.duration);
            resolve();
        }, { once: true });
    });

    // 如果请求已过期，则退出
    if (requestId !== currentPlayRequest) {
        isAudioLoading = false;
        return;
    }

    // 替换原有音频元素并清理旧事件监听器
    const oldAudio = audio;
    audio = newAudio;

    if (oldAudio && typeof oldAudio.remove === 'function') {
        oldAudio.removeEventListener('play', updatePlayPauseButton);
        oldAudio.removeEventListener('pause', updatePlayPauseButton);
        oldAudio.remove();
    }

    // 初始化播放状态
    audio.currentTime = 0;
    audio.play();

    // 添加播放/暂停事件监听
    audio.addEventListener('play', updatePlayPauseButton);
    audio.addEventListener('pause', updatePlayPauseButton);

    // 显示专辑封面
    if (track.cover) {
        try {
            const byteCharacters = atob(track.cover.data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: track.cover.format || 'image/jpeg' });
            coverImg.src = URL.createObjectURL(blob);
        } catch (error) {
            coverImg.src = 'default-cover.jpg';
        }
    } else {
        coverImg.src = 'default-cover.jpg';
    }

    document.getElementById('now-playing').textContent = `正在播放：${track.title} - ${track.artist}`;
    document.querySelector('.playing')?.classList.remove('playing');
    document.querySelector(`[data-index="${currentTrackIndex}"]`).classList.add('playing');

    // 开始旋转封面（确保同时添加类和设置动画状态）
    coverImg.classList.add('rotate');

    // 滚动当前歌曲到中央
    const currentTrackElement = document.querySelector(`[data-index="${currentTrackIndex}"]`);
    if (currentTrackElement) {
        currentTrackElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // 保存播放状态
    savePlaybackState();

    // 确保在播放时绑定 timeupdate 事件
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleTrackEnd);
    // 别删
    if (source) {
        source.disconnect();
    }
    // 每次播放时重新连接音频源到分析器
    source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    visualize();

    // 加载歌词
    lyrics = []; // 清空之前的歌词
    currentLyricIndex = -1; // 重置当前歌词索引
    document.getElementById('lyrics-container').textContent = ''; // 清空歌词显示
    try {
        const lrcPath = track.path.replace(/\.[^.]+$/, '.lrc'); // 获取同目录下的 .lrc 文件路径
        const content = await fs.readFile(lrcPath, 'utf-8'); // 读取歌词文件
        lyrics = parseLyrics(content); // 解析歌词

        // 立即显示完整歌词
        const lyricsContainer = document.getElementById('lyrics-container');
        lyricsContainer.innerHTML = ''; // 清空歌词显示

        lyrics.forEach((lyric, i) => {
            const p = document.createElement('p');
            p.textContent = lyric.text;
            lyricsContainer.appendChild(p);
        });
        
        // 初始化歌词点击事件
        setupLyricsClickHandler();
    } catch (error) {
        console.log('未找到歌词文件'); // 如果没有歌词文件，忽略错误
    }

    isAudioLoading = false;
}

// 新增：加载曲目信息但不播放
async function loadTrack(track) {
    // 增加新的请求ID
    const requestId = ++currentPlayRequest;

    // 停止当前播放的音频并解除事件监听
    if (!audio.paused) {
        audio.pause();
        audio.removeEventListener('timeupdate', updateProgress);
        audio.removeEventListener('ended', handleTrackEnd);
        audio.removeEventListener('play', updatePlayPauseButton);
        audio.removeEventListener('pause', updatePlayPauseButton);
    }

    isAudioLoading = true;

    // 立即重置UI状态
    document.getElementById('progress-bar').value = 0;
    document.getElementById('current-time').textContent = '0:00';
    document.getElementById('duration').textContent = '0:00';

    const coverImg = document.getElementById('album-cover');

    // 创建新的音频实例
    const newAudio = new Audio();
    newAudio.preload = 'metadata';

    // 加载元数据
    await new Promise((resolve) => {
        newAudio.src = track.path;
        newAudio.addEventListener('loadedmetadata', () => {
            if (requestId !== currentPlayRequest) {
                newAudio.pause();
                return resolve();
            }
            // 更新持续时间显示
            document.getElementById('duration').textContent = formatDuration(newAudio.duration);
            resolve();
        }, { once: true });
    });

    // 如果请求已过期，则退出
    if (requestId !== currentPlayRequest) {
        isAudioLoading = false;
        return;
    }

    // 替换原有音频元素并清理旧事件监听器
    const oldAudio = audio;
    audio = newAudio;

    if (oldAudio && typeof oldAudio.remove === 'function') {
        oldAudio.removeEventListener('play', updatePlayPauseButton);
        oldAudio.removeEventListener('pause', updatePlayPauseButton);
        oldAudio.remove();
    }

    // 显示专辑封面
    if (track.cover) {
        try {
            const byteCharacters = atob(track.cover.data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: track.cover.format || 'image/jpeg' });
            coverImg.src = URL.createObjectURL(blob);
        } catch (error) {
            coverImg.src = 'default-cover.jpg';
        }
    } else {
        coverImg.src = 'default-cover.jpg';
    }

    document.getElementById('now-playing').textContent = `正在播放：${track.title} - ${track.artist}`;
    document.querySelector('.playing')?.classList.remove('playing');
    document.querySelector(`[data-index="${currentTrackIndex}"]`).classList.add('playing');

    // 确保暂停状态并添加事件监听
    audio.pause();
    audio.addEventListener('play', updatePlayPauseButton);
    audio.addEventListener('pause', updatePlayPauseButton);
    updatePlayPauseButton(); // 初始化按钮状态

    // 新增：加载歌词
    lyrics = []; // 清空之前的歌词
    currentLyricIndex = -1; // 重置当前歌词索引
    document.getElementById('lyrics-container').textContent = ''; // 清空歌词显示
    try {
        const lrcPath = track.path.replace(/\.[^.]+$/, '.lrc'); // 获取同目录下的 .lrc 文件路径
        const content = await fs.readFile(lrcPath, 'utf-8'); // 读取歌词文件
        lyrics = parseLyrics(content); // 解析歌词
        // 立即显示完整歌词
        const lyricsContainer = document.getElementById('lyrics-container');
        lyricsContainer.innerHTML = ''; // 清空歌词显示

        lyrics.forEach((lyric, i) => {
            const p = document.createElement('p');
            p.textContent = lyric.text;
            lyricsContainer.appendChild(p);
        });
    } catch (error) {
        console.log('未找到歌词文件'); // 如果没有歌词文件，忽略错误
    }
    audio.addEventListener('ended', handleTrackEnd);
    isAudioLoading = false;
}