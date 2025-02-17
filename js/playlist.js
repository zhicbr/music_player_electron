let playlist = [];

// 渲染播放列表
function renderPlaylist() {
    const list = document.getElementById('playlist');
    list.innerHTML = playlist.map((track, index) => `
        <div class="track ${index === currentTrackIndex ? 'playing' : ''}" data-index="${index}">
            <span class="title">${track.title}</span>
            <span class="artist">${track.artist}</span>
            <span class="duration">${formatDuration(track.duration)}</span>
        </div>
    `).join('');

    document.querySelectorAll('.track').forEach(item => {
        item.addEventListener('click', () => {
            currentTrackIndex = parseInt(item.dataset.index);
            playTrack(playlist[currentTrackIndex]);
        });
    });
}