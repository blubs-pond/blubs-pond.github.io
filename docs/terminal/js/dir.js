import { appendTerminalOutput } from './ui.js';

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

// Use a single object to represent the file system
const fileSystem = {};

// Define root directories
const rootDirectory = new directory('/', '/');
const sysDirectory = new directory('C', 'C');
const dataDirectory = new directory('D', 'D');

fileSystem[rootDirectory.path] = rootDirectory;
fileSystem[sysDirectory.path] = sysDirectory;
fileSystem[dataDirectory.path] = dataDirectory;

// Define subdirectories and files using their full paths
const pfDirectory = new directory('Program Files', 'C/Program Files');
fileSystem[pfDirectory.path] = pfDirectory;

const userDirectory = new directory('Users', 'C/Users');
fileSystem[userDirectory.path] = userDirectory;

const README = new file('README', 'C/README', 'text', '');
fileSystem[README.path] = README;

const gameDirectory = new directory('game', 'C/Program Files/game');
fileSystem[gameDirectory.path] = gameDirectory;

const reactorDirectory = new directory('reactor-ctrl', 'C/Program Files/game/reactor-ctrl');
fileSystem[reactorDirectory.path] = reactorDirectory;

const reactorExecutable = new file('reactor.exe', 'C/Program Files/game/reactor-ctrl/reactorCtrl.html', 'exe', 'reactor');
fileSystem[reactorExecutable.path] = reactorExecutable;


// Now define the relationships between directories using a structure that allows finding children
const directoryContents = {
    '/': ['C', 'D'],
    'C': ['Program Files', 'Users', 'README'],
    'C/Program Files': ['game'],
    'C/Program Files/game': ['reactor-ctrl'],
    'C/Program Files/game/reactor-ctrl': ['reactor.exe']
};


let currentDir = rootDirectory;


// --- Refactored Functions ---

// Function to get directory contents (for ls command)
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


// Function to find a directory by its path (simplified)
function findDirectoryByPath(path) {
    // Normalize path to handle potential double slashes or backslashes
    const normalizedPath = path.replace(/\\/g, '/').replace(/\/\//g, '/');
    // Handle root path explicitly
    if (normalizedPath === '/') {
        return fileSystem['/'];
    }
     // Remove trailing slash unless it's the root
    const cleanPath = normalizedPath.endsWith('/') && normalizedPath.length > 1 ? normalizedPath.slice(0, -1) : normalizedPath;

    return fileSystem[cleanPath];
}


// Function to handle the 'cd' command
function handleCdCommand(args) {
    const targetPath = args[0];

    if (targetPath === undefined || targetPath.trim() === '') {
        // Handle case with no directory argument (e.g., just 'cd')
        appendTerminalOutput(currentDir.path); // Show current directory
        return;
    }

    const trimmedPath = targetPath.trim(); // Just trim, findDirectoryByPath will normalize

    // Handle navigating up (..)
    if (trimmedPath === '..') {
        if (currentDir.path === '/') {
            // Already at root, do nothing
             appendTerminalOutput(currentDir.path);
            return;
        }
        const parentPath = currentDir.path.substring(0, currentDir.path.lastIndexOf('/')) || '/';
        const parentDir = findDirectoryByPath(parentPath);
        if (parentDir) {
            currentDir = parentDir;
            appendTerminalOutput(`Changed directory to ${currentDir.path}`);
        } else {
             // Should not happen if the structure is correct
            appendTerminalOutput(`cd: Error navigating up from ${currentDir.path}`);
        }
        return;
    }


    // Handle absolute paths or navigating into a subdirectory
    const newPath = trimmedPath.startsWith('/') || /^[a-zA-Z]:?\/.*$/.test(trimmedPath)
        ? trimmedPath // Absolute path
        : `${currentDir.path === '/' ? '' : currentDir.path}/${trimmedPath}`; // Relative path


    const targetDir = findDirectoryByPath(newPath);


    if (targetDir && targetDir instanceof directory) {
        currentDir = targetDir;
        appendTerminalOutput(`Changed directory to ${currentDir.path}`);
    } else {
        appendTerminalOutput(`cd: No such file or directory: ${targetPath}`);
    }
}


// Function to handle the 'ls' command
function handleLsCommand() {
    const contents = getDirectoryContents(currentDir.path);
    if (contents.length === 0) {
        appendTerminalOutput("Directory is empty.");
        return;
    }
    appendTerminalOutput("Contents of " + currentDir.path + ":");
    for (const item of contents) {
        appendTerminalOutput(`- ${item.name} (${item instanceof directory ? 'Directory' : 'File'})`);
    }
}


// Function to handle the 'pwd' command
function handlePwdCommand() {
    appendTerminalOutput(currentDir.path);
}


export {
    handlePwdCommand,
    handleCdCommand,
    handleLsCommand,
    currentDir,
    fileSystem // Export fileSystem if needed elsewhere
};
