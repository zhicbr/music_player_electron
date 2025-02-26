//提取除配置文件外的所有文件内容，并将其写入Markdown文件
const fs = require('fs');
const path = require('path');

// 定义要处理的文件列表
const filesToProcess = ['index.html', 'index.js', 'style.css'];
const jsFolderPath = path.join(__dirname, 'js');

// 定义输出的Markdown文件路径
const outputFilePath = path.join(__dirname, 'output.md');

// 创建Markdown文件
function createMarkdownFile() {
    const outputStream = fs.createWriteStream(outputFilePath);

    // 处理每个文件
    filesToProcess.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            outputStream.write(`## ${file}\n\n`);
            outputStream.write(`\`\`\`${path.extname(file).slice(1)}\n`);
            outputStream.write(`${content}\n`);
            outputStream.write('```\n\n');
        } else {
            console.warn(`File ${file} does not exist.`);
        }
    });

    // 处理js文件夹下的所有文件
    if (fs.existsSync(jsFolderPath)) {
        const jsFiles = fs.readdirSync(jsFolderPath);
        jsFiles.forEach(jsFile => {
            const jsFilePath = path.join(jsFolderPath, jsFile);
            const content = fs.readFileSync(jsFilePath, 'utf8');
            outputStream.write(`## js/${jsFile}\n\n`);
            outputStream.write('```js\n');
            outputStream.write(`${content}\n`);
            outputStream.write('```\n\n');
        });
    } else {
        console.warn('js folder does not exist.');
    }

    outputStream.end();
    console.log(`Markdown file created at ${outputFilePath}`);
}

// 执行脚本
createMarkdownFile();