const fs = require('fs');
const path = require('path');

// 定义根目录路径（当前目录的父目录）
const rootDir = path.resolve(__dirname, '..');
// 定义输出的Markdown文件路径
const outputFilePath = path.join(__dirname, 'output.md');

// 需要处理的根目录文件列表
const rootFiles = ['index.html', 'index.js', 'styles.css'];
// 需要处理的文件夹路径
const jsFolderPath = path.join(rootDir, 'js');

// 创建Markdown文件
function createMarkdownFile() {
    const outputStream = fs.createWriteStream(outputFilePath);

    // 处理根目录文件
    rootFiles.forEach(file => {
        const filePath = path.join(rootDir, file);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            outputStream.write(`## ${file}\n\n`);
            outputStream.write(`\`\`\`${path.extname(file).slice(1)}\n`);
            outputStream.write(`${content}\n`);
            outputStream.write('```\n\n');
        } else {
            console.warn(`[WARN] File ${file} not found in root directory`);
        }
    });

    // 处理js文件夹下的所有文件
    if (fs.existsSync(jsFolderPath)) {
        const jsFiles = fs.readdirSync(jsFolderPath)
            .filter(file => fs.statSync(path.join(jsFolderPath, file)).isFile());

        jsFiles.forEach(file => {
            const filePath = path.join(jsFolderPath, file);
            const relativePath = `js/${file}`; // 保持路径显示友好
            const content = fs.readFileSync(filePath, 'utf8');
            
            outputStream.write(`## ${relativePath}\n\n`);
            outputStream.write(`\`\`\`${path.extname(file).slice(1)}\n`);
            outputStream.write(`${content}\n`);
            outputStream.write('```\n\n');
        });
    } else {
        console.warn('[WARN] js folder not found');
    }
}

createMarkdownFile();
