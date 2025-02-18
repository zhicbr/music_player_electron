document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    // 搜索功能
    function searchMusic(query) {
        renderPlaylist(query); // 调用 renderPlaylist 并传入搜索关键词
    }

    // 监听搜索按钮点击事件
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        searchMusic(query);
    });

    // 监听输入框回车事件
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            searchMusic(query);
        }
    });

    // 监听输入框清空事件
    searchInput.addEventListener('input', () => {
        if (searchInput.value.trim() === '') {
            renderPlaylist(); // 清空搜索框时重新渲染完整播放列表
        }
    });
});