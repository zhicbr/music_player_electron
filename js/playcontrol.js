// 新增：播放模式枚举
const PlayMode = {
    SEQUENCE: 'sequence', // 顺序播放
    RANDOM: 'random', // 随机播放
    REPEAT_ONE: 'repeat_one' // 单曲循环
};

let currentPlayMode = PlayMode.SEQUENCE; // 默认顺序播放

// 新增：更新播放/暂停按钮状态的函数
function updatePlayPauseButton() {
    const playPauseIcon = document.getElementById('play-pause').querySelector('i');
    const coverImg = document.getElementById('album-cover');
    if (audio.paused) {
        playPauseIcon.classList.remove('fa-pause');
        playPauseIcon.classList.add('fa-play');
        coverImg.style.animationPlayState = 'paused';
    } else {
        playPauseIcon.classList.remove('fa-play');
        playPauseIcon.classList.add('fa-pause');
        coverImg.style.animationPlayState = 'running';
    }
}

// 修改后的进度更新函数
function updateProgress() {
    if (isAudioLoading || !audio || !audio.duration) return;
    const progress = (audio.currentTime / audio.duration) * 100;
    document.getElementById('progress-bar').value = progress;
    document.getElementById('current-time').textContent = formatDuration(audio.currentTime);

    // 新增：更新歌词显示
    updateLyrics();
}

// 新增：根据播放模式获取下一首歌曲
function getNextTrack() {
    switch (currentPlayMode) {
        case PlayMode.SEQUENCE:
            return (currentTrackIndex + 1) % playlist.length; // 顺序播放
        case PlayMode.RANDOM:
            return Math.floor(Math.random() * playlist.length); // 随机播放
        case PlayMode.REPEAT_ONE:
            return currentTrackIndex; // 单曲循环
    }
}

// 修改：播放结束自动下一首
function handleTrackEnd() {
    currentTrackIndex = getNextTrack(); // 根据播放模式获取下一首
    playTrack(playlist[currentTrackIndex]);
}

// 修改：播放/暂停按钮点击事件
document.getElementById('play-pause').addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        // 确保音频源连接到分析器，不要删
        source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        visualize();
    } else {
        audio.pause();
    }
    // 状态更新由 play/pause 事件监听器处理
});

document.getElementById('prev').addEventListener('click', () => {
    currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    playTrack(playlist[currentTrackIndex]);
});

document.getElementById('next').addEventListener('click', () => {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    playTrack(playlist[currentTrackIndex]);
});

document.getElementById('toggle-list').addEventListener('click', () => {
    const container = document.querySelector('.container');
    const rightContainer = document.getElementById('right-section-container');
    rightContainer.classList.toggle('is-collapsed');
    container.classList.toggle('is-collapsed');
});

// 新增：绑定播放模式按钮点击事件
document.getElementById('play-mode').addEventListener('click', togglePlayMode);

// 初始化播放模式图标
document.getElementById('repeat-icon').classList.add('active'); // 默认顺序播放

// 新增：切换播放模式
function togglePlayMode() {
    const randomIcon = document.getElementById('random-icon');
    const repeatIcon = document.getElementById('repeat-icon');
    const repeatOneIcon = document.getElementById('repeat-one-icon');

    // 切换模式
    switch (currentPlayMode) {
        case PlayMode.SEQUENCE:
            currentPlayMode = PlayMode.RANDOM;
            randomIcon.classList.add('active');
            repeatIcon.classList.remove('active');
            repeatOneIcon.classList.remove('active');
            break;
        case PlayMode.RANDOM:
            currentPlayMode = PlayMode.REPEAT_ONE;
            randomIcon.classList.remove('active');
            repeatIcon.classList.remove('active');
            repeatOneIcon.classList.add('active');
            break;
        case PlayMode.REPEAT_ONE:
            currentPlayMode = PlayMode.SEQUENCE;
            randomIcon.classList.remove('active');
            repeatIcon.classList.add('active');
            repeatOneIcon.classList.remove('active');
            break;
    }
}