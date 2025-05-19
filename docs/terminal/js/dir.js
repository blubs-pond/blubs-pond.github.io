import { appendTerminalOutput, appendTerminalSymbol, appendTerminalHTML } from './ui.js';

class file {
    constructor(name, path, type, content = '') {
        this.name = name;
        this.path = path;
        this.type = type;
        this.content = content;
    }
}

class directory {
    constructor(name, path) {
        this.name = name;
        this.path = path;
    }
}

const fileSystem = {};
const directoryContents = {};

// Create base directories and files
const rootDirectory = new directory('/', '/');
const sysDirectory = new directory('C', '/C');
const dataDirectory = new directory('D', '/D');

fileSystem[rootDirectory.path] = rootDirectory;
fileSystem[sysDirectory.path] = sysDirectory;
fileSystem[dataDirectory.path] = dataDirectory;

directoryContents['/'] = ['C', 'D'];

const pfDirectory = new directory('Program Files', '/C/Program Files');
const userDirectory = new directory('Users', '/C/Users');
const README = new file('README', '/C/README', 'text', 'Welcome to the system.');
const Blub = new directory('Blub','/C/Users/Blub');
const Homework = new directory('Homework','/C/Users/Blub/Homework');
const secret = new file('secret.md','/C/Users/Blub/Homework/secret.md','text','DO NOT OPEN');

fileSystem[pfDirectory.path] = pfDirectory;
fileSystem[userDirectory.path] = userDirectory;
fileSystem[Blub.path] = Blub;
fileSystem[Homework.path] = Homework;
fileSystem[README.path] = README;
fileSystem[secret.path] = secret;

directoryContents['/C'] = ['Program Files', 'Users', 'README'];
directoryContents['/C/Users'] = ['Blub'];
directoryContents['/C/Users/Blub'] = ['Homework'];
directoryContents['/C/Users/Blub/Homework'] = ['secret.md'];

const gameDirectory = new directory('game', '/C/Program Files/game');
const reactorDirectory = new directory('reactor-ctrl', '/C/Program Files/game/reactor-ctrl');
const reactorExecutable = new file('reactor.exe', '/C/Program Files/game/reactor-ctrl/reactor.exe', 'exe', 'reactor');

fileSystem[gameDirectory.path] = gameDirectory;
fileSystem[reactorDirectory.path] = reactorDirectory;
fileSystem[reactorExecutable.path] = reactorExecutable;

directoryContents['/C/Program Files'] = ['game'];
directoryContents['/C/Program Files/game'] = ['reactor-ctrl'];
directoryContents['/C/Program Files/game/reactor-ctrl'] = ['reactor.exe'];

const awaAudio = new file('awa.wav','/D/Audio/awa.wav','audio','../../untitled.wav');
const audioDirectory = new directory('Audio','/D/Audio');

fileSystem[awaAudio.path] = awaAudio;
fileSystem[audioDirectory.path] = audioDirectory;

directoryContents['/D'] = ['Audio']
directoryContents['/D/Audio'] = ['awa.wav']

const exeFile = new file('reactor.exe', '/C/Program Files/reactor.exe', 'exe', 'reactor');
const audioLog = new file('log1.ogg', '/C/logs/log1.ogg', 'audio', 'boot_audio');
const configFile = new file('config.json', '/C/data/config.json', 'data', { power: "ON", temp: 83 });

let currentDir = rootDirectory;

// --- Helpers ---

function normalizePath(path) {
    return path.replace(/\\/g, '/').replace(/\/+/g, '/').replace(/\/$/, '') || '/';
}

function findDirectoryByPath(path) {
    return fileSystem[normalizePath(path)];
}

function getDirectoryContents(dirPath) {
    const contents = directoryContents[dirPath] || [];
    const items = [];

    for (const name of contents) {
        const itemPath = dirPath === '/' ? `/${name}` : `${dirPath}/${name}`;
        const item = fileSystem[itemPath];

        if (item) {
            items.push(item);
        } else {
            appendTerminalOutput(`ls: Warning - Missing reference for ${itemPath}`);
        }
    }

    return items;
}

function resolvePathRelativeToCurrentDir(inputPath) {
    const isAbsolute = inputPath.startsWith('/');
    const parts = normalizePath(inputPath).split('/');
    const baseParts = isAbsolute ? [] : currentDir.path.split('/').filter(Boolean);

    for (const part of parts) {
        if (part === '' || part === '.') continue;
        if (part === '..') {
            baseParts.pop(); // Go up one level
        } else {
            baseParts.push(part);
        }
    }

    return '/' + baseParts.join('/');
}


// --- Command Handlers (Read-Only) ---

function handlePwdCommand() {
    appendTerminalOutput(currentDir.path);
}

function handleLsCommand() {
    const contents = getDirectoryContents(currentDir.path);

    if (contents.length === 0) {
        appendTerminalOutput("Directory is empty.");
        return;
    }

    appendTerminalOutput(`Contents of ${currentDir.path}:`);
    for (const item of contents) {
        const type = item instanceof directory ? "directory" : "file";
        appendTerminalOutput(`- ${item.name} (${type})`);
    }
}

function handleCdCommand(args) {
    const targetPath = args[0];

    if (!targetPath || targetPath.trim() === '') {
        appendTerminalOutput(currentDir.path);
        return;
    }

    const resolvedPath = resolvePathRelativeToCurrentDir(targetPath.trim());

    let targetDir = findDirectoryByPath(resolvedPath);
    if (targetDir) {
        currentDir = targetDir;
        appendTerminalOutput(`Changed directory to ${currentDir.path}`);
    } else {
        appendTerminalOutput(`cd: No such file or directory: ${targetPath}`);
    }
}

function printTree(dirPath, prefix = '') {
    const contents = getDirectoryContents(dirPath);
    if (contents.length === 0) {
        appendTerminalOutput(prefix + '(empty)');
        return;
    }

    contents.forEach((item, index) => {
        const isLast = index === contents.length - 1;
        const connector = isLast ? '└─ ' : '├─ ';

        appendTerminalOutput(prefix + connector + item.name + (item instanceof directory ? '/' : ''));

        if (item instanceof directory) {
            printTree(item.path, prefix + (isLast ? '   ' : '│  '));
        }
    });
}

function handleTreeCommand() {
    appendTerminalOutput(currentDir.path + ':');
    printTree(currentDir.path);
}

function handleCatCommand(args) {
    const filePath = args[0];

    if (typeof filePath !== 'string' || filePath.trim() === '') {
        appendTerminalOutput("Usage: cat <filename>");
        return;
    }

    const resolvedPath = filePath.startsWith('/')
        ? filePath
        : `${currentDir.path === '/' ? '' : currentDir.path}/${filePath}`;

    const file = fileSystem[resolvedPath];

    if (!file || !(file instanceof file.constructor)) {
        appendTerminalOutput(`cat: No such file: ${filePath}`);
        return;
    }

    switch (file.type) {
        case 'text':
            appendTerminalOutput(file.content);
            break;
        case 'image':
        case 'img':
            appendTerminalHTML(`<img src="${file.content}" alt="${file.name}" style="max-width: 100%; height: auto;">`);
            break;
        case 'audio':
            appendTerminalHTML(`<audio controls src="${file.content}">Your browser does not support audio playback.</audio>`);
            break;
        case 'webpage':
        case 'subpage':
            appendTerminalHTML(`<iframe src="${file.content}" style="width: 100%; height: 400px;"></iframe>`);
            break;
        case 'exe':
        case 'switch':
            appendTerminalOutput(`[Executable] To run this, type: ${file.name.split('.')[0]}`);
            break;
        default:
            appendTerminalOutput(`Unsupported file type: ${file.type}`);
    }
}

// --- New Command Handlers ---

function runCommand(args) {
    if (!args?.[0]) {
        appendTerminalOutput("run: No program specified.");
        return;
    }
    const name = args[0];
    const file = getDirectoryContents(currentDir.path)
        .find(item => item.name === name && item.type === 'exe');
    if (!file) {
        appendTerminalOutput(`run: Executable not found: ${name}`);
        return;
    }
    // file.content holds the command to launch, e.g. "reactor"
    appendTerminalOutput(`Launching ${file.name}...`);
    // if you have a game-launcher handler:
    if (file.content === 'reactor') {
        handleGameReactor();
    } else {
        appendTerminalOutput(`run: No handler for ${file.content}`);
    }
}

function playCommand(args) {
    if (!args?.[0]) {
        appendTerminalOutput("play: No audio file specified.");
        return;
    }
    const name = args[0];
    const file = getDirectoryContents(currentDir.path)
        .find(item => item.name === name && item.type === 'audio');
    if (!file) {
        appendTerminalOutput(`play: Audio file not found: ${name}`);
        return;
    }
    appendTerminalOutput(`Playing audio: ${file.name}`);
    
    // (hook in your actual audio-playback code here)
}

function openCommand(args) {
    if (!args?.[0]) {
        appendTerminalOutput("open: No webpage specified.");
        return;
    }
    const name = args[0];
    const file = getDirectoryContents(currentDir.path)
        .find(item => item.name === name && ['webpage','subpage'].includes(item.type));
    if (!file) {
        appendTerminalOutput(`open: Page not found: ${name}`);
        return;
    }
    appendTerminalOutput(`Opening ${file.name}…`);
    appendTerminalOutput(file.content || "(no content)");
}

// --- Exported Functions ---

export {
    handlePwdCommand,
    handleCdCommand,
    handleLsCommand,
    handleCatCommand,
    handleTreeCommand,
    printTree,
    openCommand,
    playCommand,
    runCommand,
    currentDir,
    fileSystem
};
