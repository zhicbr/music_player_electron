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
        <div class="track ${playlist.indexOf(track) === currentTrackIndex ? 'playing' : ''}" data-index="${playlist.indexOf(track)}">
            <div class="track-info">
                <span class="title">${track.title}</span>
                <span class="artist">${track.artist}</span>
                <span class="duration">${formatDuration(track.duration)}</span>
            </div>
            <div class="track-actions">
                <button class="edit-button"><i class="fas fa-ellipsis-v"></i></button>
                <div class="edit-menu">
                    <button class="move-up"><i class="fas fa-arrow-up"></i> 上移</button>
                    <button class="move-down"><i class="fas fa-arrow-down"></i> 下移</button>
                    <button class="delete"><i class="fas fa-trash"></i> 删除</button>
                </div>
            </div>
        </div>
    `).join('');

    // 绑定点击事件
    document.querySelectorAll('.track').forEach(item => {
        // 播放歌曲点击事件
        const trackInfo = item.querySelector('.track-info');
        trackInfo.addEventListener('click', () => {
            currentTrackIndex = parseInt(item.dataset.index);
            playTrack(playlist[currentTrackIndex]);
        });
        
        // 编辑按钮点击事件
        const editButton = item.querySelector('.edit-button');
        const editMenu = item.querySelector('.edit-menu');
        
        editButton.addEventListener('click', (e) => {
            e.stopPropagation(); // 防止触发歌曲播放
            // 关闭其他所有打开的菜单
            document.querySelectorAll('.edit-menu.active').forEach(menu => {
                if (menu !== editMenu) {
                    menu.classList.remove('active');
                }
            });
            // 切换当前菜单的显示状态
            editMenu.classList.toggle('active');
        });
        
        // 点击其他区域时关闭菜单
        document.addEventListener('click', (e) => {
            if (!editButton.contains(e.target) && !editMenu.contains(e.target)) {
                editMenu.classList.remove('active');
            }
        });
        
        // 上移按钮点击事件
        const moveUpButton = item.querySelector('.move-up');
        moveUpButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const trackIndex = parseInt(item.dataset.index);
            moveTrackUp(trackIndex);
        });
        
        // 下移按钮点击事件
        const moveDownButton = item.querySelector('.move-down');
        moveDownButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const trackIndex = parseInt(item.dataset.index);
            moveTrackDown(trackIndex);
        });
        
        // 删除按钮点击事件
        const deleteButton = item.querySelector('.delete');
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const trackIndex = parseInt(item.dataset.index);
            deleteTrack(trackIndex);
        });
    });
}

// 上移歌曲
function moveTrackUp(index) {
    if (index <= 0 || index >= playlist.length) return;
    
    // 保存当前播放的歌曲路径
    const currentPlayingPath = playlist[currentTrackIndex]?.path;
    
    // 交换位置
    [playlist[index], playlist[index - 1]] = [playlist[index - 1], playlist[index]];
    
    // 如果当前正在播放的歌曲发生了移动，更新 currentTrackIndex
    if (index === currentTrackIndex) {
        currentTrackIndex--;
    } else if (index - 1 === currentTrackIndex) {
        currentTrackIndex++;
    }
    
    // 保存并重新渲染播放列表
    savePlaylist();
    renderPlaylist();
}

// 下移歌曲
function moveTrackDown(index) {
    if (index < 0 || index >= playlist.length - 1) return;
    
    // 保存当前播放的歌曲路径
    const currentPlayingPath = playlist[currentTrackIndex]?.path;
    
    // 交换位置
    [playlist[index], playlist[index + 1]] = [playlist[index + 1], playlist[index]];
    
    // 如果当前正在播放的歌曲发生了移动，更新 currentTrackIndex
    if (index === currentTrackIndex) {
        currentTrackIndex++;
    } else if (index + 1 === currentTrackIndex) {
        currentTrackIndex--;
    }
    
    // 保存并重新渲染播放列表
    savePlaylist();
    renderPlaylist();
}

// 删除歌曲
function deleteTrack(index) {
    if (index < 0 || index >= playlist.length) return;
    
    // 询问用户是否确认删除
    const confirmDelete = confirm(`确定要从播放列表中删除 "${playlist[index].title}" 吗？`);
    if (!confirmDelete) return;
    
    // 判断是否删除的是当前播放的歌曲
    const isCurrentTrack = index === currentTrackIndex;
    
    // 从播放列表中删除歌曲
    playlist.splice(index, 1);
    
    // 调整 currentTrackIndex
    if (isCurrentTrack) {
        // 如果删除的是当前播放的歌曲，自动播放下一首
        if (playlist.length === 0) {
            // 如果播放列表为空，重置播放器
            currentTrackIndex = 0;
            document.getElementById('now-playing').textContent = '没有可播放的歌曲';
            document.getElementById('album-cover').src = 'default-cover.jpg';
            document.getElementById('progress-bar').value = 0;
            document.getElementById('current-time').textContent = '0:00';
            document.getElementById('duration').textContent = '0:00';
            if (audio) {
                audio.pause();
                updatePlayPauseButton();
            }
        } else {
            // 如果删除的是最后一首歌，播放第一首
            if (currentTrackIndex >= playlist.length) {
                currentTrackIndex = 0;
            }
            // 播放新的当前歌曲
            playTrack(playlist[currentTrackIndex]);
        }
    } else if (index < currentTrackIndex) {
        // 如果删除的歌曲在当前播放歌曲之前，需要调整当前播放索引
        currentTrackIndex--;
    }
    
    // 保存并重新渲染播放列表
    savePlaylist();
    renderPlaylist();
}

// 保存播放列表到存储
function savePlaylist() {
    ipcRenderer.send('save-full-playlist', playlist);
}