import { appendTerminalOutput, appendTerminalSymbol, appendTerminalHTML } from './ui.js';
import { handleGameReactor } from './cmd.js'; // Import handleGameReactor

class file {
    constructor(name, path, type, content) {
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

//Program file
const pfDirectory = new directory('Program Files', '/C/Program Files');

fileSystem[pfDirectory.path] = pfDirectory;

const gameDirectory = new directory('game', '/C/Program Files/game');
const reactorDirectory = new directory('reactor-ctrl', '/C/Program Files/game/reactor-ctrl');
const reactorExecutable = new file('reactor.exe', '/C/Program Files/game/reactor-ctrl/reactor.exe', 'exe', 'reactor');

fileSystem[gameDirectory.path] = gameDirectory;
fileSystem[reactorDirectory.path] = reactorDirectory;
fileSystem[reactorExecutable.path] = reactorExecutable;









//Users
const userDirectory = new directory('Users', '/C/Users');

fileSystem[userDirectory.path] = userDirectory;

// Blubs
const Blub = new directory('Blub', '/C/Users/Blub');
const Homework = new directory('Homework', '/C/Users/Blub/Homework');
const secret = new file('secret.md', '/C/Users/Blub/Homework/secret.md', 'text', 'DO NOT OPEN 𓆏');
const doNotOpen = new file('DoNotOpen.png', '/C/Users/Blub/Homework/DoNotOpen.png', 'image', 'js/ref/Shiny_scared_blub.png');
const TODO = new file('TODO','/C/Users/Blub/Homework/TODO','text',`
--- TODO ---
Yearly Shower

Years   Status
2020    Done
2021    Done
2022    Done
2023    Pending
2024    Pending
2025    Not Started
`);

fileSystem[Blub.path] = Blub;
fileSystem[Homework.path] = Homework;
fileSystem[secret.path] = secret;
fileSystem[doNotOpen.path] = doNotOpen;
fileSystem[TODO.path] = TODO;


// CWPStudio file
const CWPStudio = new directory('CWPStudio', '/C/Users/CWPStudio');

fileSystem[CWPStudio.path] = CWPStudio;


// ClassyDestroyer file
const ClassyDestroyer = new directory('ClassyDestroyer', '/C/Users/ClassyDestroyer');

fileSystem[ClassyDestroyer.path] = ClassyDestroyer;

const Pictures = new directory('Pictures', '/C/Users/ClassyDestroyer/Pictures');
const MnM = new file('MnM.jpg', '/C/Users/ClassyDestroyer/Pictures/MnM.jpg', 'image', 'js/ref/MnM.jpg');

fileSystem[Pictures.path] = Pictures;
fileSystem[MnM.path] = MnM;

// Minty file
const Minty = new directory('Minty', '/C/Users/Minty');

fileSystem[Minty.path] = Minty;


// Rune file
const Rune = new directory('Rune', '/C/Users/Rune');

fileSystem[Rune.path] = Rune;


// Philo file
const Philo = new directory('Philo', '/C/Users/Philo');

fileSystem[Philo.path] = Philo;









// C/README
const README = new file('README', '/C/README', 'text',  `
------------ Blubs Pond Terminal -------------

--------- About Blubs Pond Terminal ----------
Started on 9 May 2025

Created for twitch.tv/blubbyblubfish
Created by CWP Studio & blubbyblubfish Mods

=============================================

--- Contributors of Blubs Pond & Terminal ---

------------- Main Contributors -------------
Commission Art      - Blubby Blub Fish
Code & Moderating   - ClassyDestroyer
Code & CLI + Game   - CWP Studio
(1st) Fan Art       - Minty

---------- Suggestion Contributors ----------
"awa" button        - Rune
Homework folder     - ClassyDestroyer
bob the frog        - Blubby Blub Fish
Blubs' TODO list    - Philo
Terminal            - CWP Studio
---------------------------------------------
`);

fileSystem[README.path] = README;

//Root C
directoryContents['/C'] = ['Program Files', 'Users', 'README'];

// C/Program Files
directoryContents['/C/Program Files'] = ['game'];

// C/Program Files/game
directoryContents['/C/Program Files/game'] = ['reactor-ctrl'];
directoryContents['/C/Program Files/game/reactor-ctrl'] = ['reactor.exe'];

// C/Users
directoryContents['/C/Users'] = ['Blub','CWPStudio','ClassyDestroyer'];

// C/Users/Blubs
directoryContents['/C/Users/Blub'] = ['Homework'];
directoryContents['/C/Users/Blub/Homework'] = ['secret.md', 'DoNotOpen.png','TODO'];

// C/Users/CWPStudio
// TBA

// C/Users/ClassyDestroyer
directoryContents['/C/Users/ClassyDestroyer'] = ['Pictures'];
directoryContents['/C/Users/ClassyDestroyer/Pictures'] = ['MnM.jpg'];


// D/ Audio
const audioDirectory = new directory('Audio','/D/Audio');
const awaAudio = new file('awa.wav','/D/Audio/awa.wav','audio','../../untitled.wav');

// D/Audio
fileSystem[audioDirectory.path] = audioDirectory;
fileSystem[awaAudio.path] = awaAudio;

directoryContents['/D'] = ['Audio']
directoryContents['/D/Audio'] = ['awa.wav']

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
    if (!args || args.length === 0) {
        currentDir = rootDirectory;
        return;
    }

    const targetDirName = args[0];
    let targetDir;

    if (targetDirName === '..') {
        if (currentDir.path === '/') {
            return;
        }
        const pathParts = currentDir.path.split('/');
        pathParts.pop();
        const parentPath = pathParts.join('/') || '/';
        targetDir = fileSystem[parentPath];
    } else {
        const targetPath = `${currentDir.path === '/' ? '' : currentDir.path}/${targetDirName}`;
        targetDir = fileSystem[targetPath];
    }

    if (targetDir && targetDir instanceof directory) {
        currentDir = targetDir;
    } else {
        appendTerminalOutput(`cd: The system cannot find the path specified: ${targetDirName}`);
    }
}

function handleTreeCommand() {
    appendTerminalOutput(currentDir.path + ':');
    printTree(currentDir.path);
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
