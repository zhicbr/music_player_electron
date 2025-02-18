let playlist = [];

// 渲染播放列表
function renderPlaylist(filter = '') {
    const list = document.getElementById('playlist');

    // 过滤播放列表
    const filteredPlaylist = playlist.filter(track => 
        track.title.toLowerCase().includes(filter.toLowerCase()) || 
        track.artist.toLowerCase().includes(filter.toLowerCase())
    );

    // 渲染过滤后的播放列表
    list.innerHTML = filteredPlaylist.map((track, index) => `
        <div class="track ${index === currentTrackIndex ? 'playing' : ''}" data-index="${playlist.indexOf(track)}">
            <span class="title">${track.title}</span>
            <span class="artist">${track.artist}</span>
            <span class="duration">${formatDuration(track.duration)}</span>
        </div>
    `).join('');

    // 绑定点击事件
    document.querySelectorAll('.track').forEach(item => {
        item.addEventListener('click', () => {
            currentTrackIndex = parseInt(item.dataset.index);
            playTrack(playlist[currentTrackIndex]);
        });
    });
}