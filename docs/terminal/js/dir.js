import { appendTerminalOutput } from './ui.js';

// === File and Directory Classes ===
class File {
    constructor(name, path, type, content) {
        this.name = name;
        this.path = path;
        this.type = type;
        this.content = content;
    }
}

class Directory {
    constructor(name, path) {
        this.name = name;
        this.path = path;
    }
}

// === File System Initialization ===
const fileSystem = {};

const rootDirectory = new Directory('/', '/');
const sysDirectory = new Directory('C', 'C');
const dataDirectory = new Directory('D', 'D');

fileSystem[rootDirectory.path] = rootDirectory;
fileSystem[sysDirectory.path] = sysDirectory;
fileSystem[dataDirectory.path] = dataDirectory;

const pfDirectory = new Directory('Program Files', 'C/Program Files');
fileSystem[pfDirectory.path] = pfDirectory;

const userDirectory = new Directory('Users', 'C/Users');
fileSystem[userDirectory.path] = userDirectory;

const README = new File('README', 'C/README', 'text', '');
fileSystem[README.path] = README;

const gameDirectory = new Directory('game', 'C/Program Files/game');
fileSystem[gameDirectory.path] = gameDirectory;

const reactorDirectory = new Directory('reactor-ctrl', 'C/Program Files/game/reactor-ctrl');
fileSystem[reactorDirectory.path] = reactorDirectory;

const reactorExecutable = new File('reactor.exe', 'C/Program Files/game/reactor-ctrl/reactorCtrl.html', 'exe', 'reactor');
fileSystem[reactorExecutable.path] = reactorExecutable;

// === Directory Relationships ===
const directoryContents = {
    '/': ['C', 'D'],
    'C': ['Program Files', 'Users', 'README'],
    'C/Program Files': ['game'],
    'C/Program Files/game': ['reactor-ctrl'],
    'C/Program Files/game/reactor-ctrl': ['reactor.exe']
};

// === Current Directory State ===
let currentDir = rootDirectory;

// === Helper Functions ===

// Normalize paths and get a Directory object from fileSystem
function findDirectoryByPath(path) {
    const normalizedPath = path.replace(/\\/g, '/').replace(/\/+/g, '/');
    const cleanPath = normalizedPath.endsWith('/') && normalizedPath.length > 1
        ? normalizedPath.slice(0, -1)
        : normalizedPath;
    const dir = fileSystem[cleanPath];
    return dir instanceof Directory ? dir : null;
}

// Get contents of a directory for `ls`
function getDirectoryContents(dirPath) {
    const contents = directoryContents[dirPath] || [];
    const items = [];

    for (const itemName of contents) {
        const itemPath = dirPath === '/' ? `/${itemName}` : `${dirPath}/${itemName}`;
        const item = fileSystem[itemPath];
        if (item) {
            items.push(item);
        }
    }

    return items;
}

// === Terminal Command Handlers ===

// Handle `cd` command
function handleCdCommand(args) {
    const targetPath = args[0];

    if (!targetPath) {
        appendTerminalOutput(currentDir.path);
        return;
    }

    const trimmedPath = targetPath.trim();

    // Handle ".."
    if (trimmedPath === '..') {
        if (currentDir.path === '/') {
            appendTerminalOutput(currentDir.path);
            return;
        }
        const parentPath = currentDir.path.substring(0, currentDir.path.lastIndexOf('/')) || '/';
        const parentDir = findDirectoryByPath(parentPath);
        if (parentDir) {
            currentDir = parentDir;
            appendTerminalOutput(`Changed directory to ${currentDir.path}`);
        } else {
            appendTerminalOutput(`cd: Error navigating up from ${currentDir.path}`);
        }
        return;
    }

    // Relative or absolute path
    const newPath = trimmedPath.startsWith('/') || /^[a-zA-Z]:?\/.*$/.test(trimmedPath)
        ? trimmedPath
        : `${currentDir.path === '/' ? '' : currentDir.path}/${trimmedPath}`;

    const targetDir = findDirectoryByPath(newPath);

    if (targetDir) {
        currentDir = targetDir;
        appendTerminalOutput(`Changed directory to ${currentDir.path}`);
    } else {
        appendTerminalOutput(`cd: No such file or directory: ${targetPath}`);
    }
}

// Handle `ls` command
function handleLsCommand() {
    const contents = getDirectoryContents(currentDir.path);
    if (contents.length === 0) {
        appendTerminalOutput("Directory is empty.");
        return;
    }
    appendTerminalOutput("Contents of " + currentDir.path + ":");
    for (const item of contents) {
        const type = item instanceof Directory ? 'Directory' : 'File';
        appendTerminalOutput(`- ${item.name} (${type})`);
    }
}

// `dir` is an alias for `ls`
function handleDirCommand() {
    handleLsCommand();
}

// Handle `pwd` command
function handlePwdCommand() {
    appendTerminalOutput(currentDir.path);
}

// === Exports ===
export {
    handleCdCommand,
    handleLsCommand,
    handlePwdCommand,
    handleDirCommand,
    currentDir,
    fileSystem
};
