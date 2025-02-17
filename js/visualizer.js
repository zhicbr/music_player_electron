// 音频可视化相关变量
let audioContext;
let analyser;
let source;
let animation;
const BAR_COUNT = 64;

// 初始化音频上下文和分析器
function initAudioContext() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        console.log('音频上下文初始化成功');
    } catch (e) {
        console.error('音频上下文初始化失败:', e);
    }
}

// 创建音频条
function createVisualizerBars() {
    const visualizer = document.getElementById('visualizer');
    for (let i = 0; i < BAR_COUNT; i++) {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.background = `hsl(${(i / BAR_COUNT) * 360}, 70%, 60%)`;
        visualizer.appendChild(bar);
    }
}

// 可视化音频数据
function visualize() {
    const bars = document.querySelectorAll('.bar');
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    function render() {
        animation = requestAnimationFrame(render);
        analyser.getByteFrequencyData(dataArray);

        for (let i = 0; i < BAR_COUNT; i++) {
            const value = dataArray[i];
            const percent = value / 255;
            const height = percent * 300;
            bars[i].style.height = `${height}px`;
        }
    }

    render();
}