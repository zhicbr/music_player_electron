//提取css文件中的重复声明块
const fs = require('fs');
const path = require('path');

// 定义文件路径
const cssFilePath = path.join(__dirname, '../styles.css');
const outputFilePath = path.join(__dirname, 'styles_same.md');

// 读取CSS文件内容
const cssContent = fs.readFileSync(cssFilePath, 'utf-8');

// 正则表达式匹配CSS声明块
const blockRegex = /([^{]+)\{([^}]+)\}/g;

// 存储所有声明块
const blocks = [];
let match;

// 提取所有声明块
while ((match = blockRegex.exec(cssContent)) !== null) {
    const selector = match[1].trim();
    const content = match[2].trim();
    blocks.push({ selector, content });
}

// 找出同名的声明块
const duplicateBlocks = {};
blocks.forEach(block => {
    if (!duplicateBlocks[block.selector]) {
        duplicateBlocks[block.selector] = [];
    }
    duplicateBlocks[block.selector].push(block);
});

// 过滤出有重复的声明块
const duplicates = Object.entries(duplicateBlocks)
    .filter(([selector, blocks]) => blocks.length > 1)
    .reduce((acc, [selector, blocks]) => {
        acc[selector] = blocks;
        return acc;
    }, {});

// 准备写入的内容
let outputContent = '';

Object.entries(duplicates).forEach(([selector, blocks]) => {
    outputContent += `## Selector: ${selector}\n\n`;
    blocks.forEach((block, index) => {
        outputContent += `### Block ${index + 1}\n\`\`\`css\n${block.selector} {\n${block.content}\n}\n\`\`\`\n\n`;
    });
});

// 写入文件
if (fs.existsSync(outputFilePath)) {
    fs.writeFileSync(outputFilePath, ''); // 清空文件
}
fs.writeFileSync(outputFilePath, outputContent);

console.log(`同名声明块已写入 ${outputFilePath}`);