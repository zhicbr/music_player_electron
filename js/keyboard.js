// 监听键盘事件
document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'Space': // 空格键：暂停/播放
            event.preventDefault(); // 防止默认行为（如页面滚动）
            document.getElementById('play-pause').click(); // 触发播放/暂停按钮的点击事件
            break;

        case 'ArrowUp': // 上键：上一曲
            document.getElementById('prev').click(); // 触发上一曲按钮的点击事件
            break;

        case 'ArrowDown': // 下键：下一曲
            document.getElementById('next').click(); // 触发下一曲按钮的点击事件
            break;

        case 'ArrowLeft': // 左键：后退 5 秒
            if (audio) {
                audio.currentTime = Math.max(0, audio.currentTime - 5); // 后退 5 秒，确保时间不小于 0
                updateProgress(); // 更新进度条显示
            }
            break;

        case 'ArrowRight': // 右键：前进 5 秒
            if (audio) {
                audio.currentTime = Math.min(audio.duration, audio.currentTime + 5); // 前进 5 秒，确保时间不超过总时长
                updateProgress(); // 更新进度条显示
            }
            break;
    }
});