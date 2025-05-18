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
    constructor(name, path, files, subdirectories) {
        this.name = name;
        this.path = path;
        this.files = files;
        this.subdirectories = subdirectories;
    }
}

// Dir declaration
const rootDirectory = new directory('/', '/', [], []); // root dir

const sysDirectory = new directory('C:/', 'C:/', [], []); // sys dir

const dataDirectory = new directory('D:/', 'D:/', [], []); // data dir

// added sub dir of root to root
rootDirectory.subdirectories.push(sysDirectory);
rootDirectory.subdirectories.push(dataDirectory);

const pfDirectory = new directory('Program Files', 'C:/Program Files', [], []);
const userDirectory = new directory('Users', 'C:/Users', [], []);

// added sub dir of sys to sys
sysDirectory.subdirectories.push(pfDirectory);
sysDirectory.subdirectories.push(userDirectory);

const README = new file('README', 'C:/README', 'text', '')
sysDirectory.subdirectories.push(README);

const game = new directory('game', 'C:/Program Files/game', [], [])
pfDirectory.subdirectories.push(game);

const reactor = new directory('reactor-ctrl', 'C:/Program Files/game/reactor-ctrl', [], [])
game.subdirectories.push(reactor);

const reactorCtrl = new file('reactor.exe', 'C:/Program Files/game/reactor-ctrl/reactorCtrl.html', 'exe', 'reactor')
reactor.subdirectories.push(reactorCtrl)

let currentDir = rootDirectory;

// Function to find a directory by its path
function findDirectoryByPath(path, startDir = rootDirectory) {
    console.log("Searching for path:", path);
    console.log("Current directory being checked:", startDir.path);

    // Check direct subdirectories first
    for (const subDir of startDir.subdirectories) {
        if (subDir instanceof directory && subDir.path.toLowerCase() === path.toLowerCase()) {
            console.log("Match found in direct subdirectories:", subDir);
            return subDir;
        }
    }

    // If not found in direct subdirectories, proceed with recursive search
    if (startDir.path.toLowerCase() === path.toLowerCase()) {
        console.log("Match found:", startDir);
        return startDir;
    }

    for (const subDir of startDir.subdirectories) {
        if (subDir instanceof directory) {
            const found = findDirectoryByPath(path, subDir);
            if (found) return found;
        }
    }

    console.log("Path not found in this branch.");
    return null;
}

function handlePwdCommand() {
    appendTerminalOutput(currentDir.path);
}

function handleCdCommand(args) { // Accept the args array
    const dir = args[0]; // Get the directory path from the first element

    if (dir === undefined || dir.trim() === '') {
        // Handle case with no directory argument (e.g., just 'cd')
        // Maybe navigate to a default directory or show current directory
        return;
    }

    const trimmedDir = dir.trim().replace(/\\/g, '/'); // Trim and replace backslashes

    // Now use trimmedDir in the rest of your logic
    if (trimmedDir === '/') {
        // Handle root directory
        currentDir = rootDirectory;
        appendTerminalOutput(`Changed directory to ${currentDir.path}`);
    } else if (/^[a-zA-Z]:[\\/]/.test(trimmedDir)) { // Use [\\/] to match both / and \\
        // Handle absolute paths
        const targetDir = findDirectoryByPath(trimmedDir);
        if (targetDir) {
            currentDir = targetDir;
            appendTerminalOutput(`Changed directory to ${currentDir.path}`);
        } else {
            appendTerminalOutput(`cd: No such file or directory: ${trimmedDir}`);
        }
    } else if (trimmedDir.startsWith('..')) { // Use startsWith for clarity
        // Handle navigating up
        let targetDir = currentDir;
        const parts = trimmedDir.split(/[\\/]/); // Split by / or \
        let newPath = targetDir.path;
        for (const part of parts) {
            if (part === '..') {
                if (newPath !== '/' && newPath.lastIndexOf('/') > 0) {
                    newPath = newPath.substring(0, newPath.lastIndexOf('/'));
                } else if (newPath.lastIndexOf('/') === 0 && newPath.length > 1) {
                    // Handle cases like "C:/" moving to "/"
                    newPath = '/';
                }
            } else if (part !== '' && part !== '.') {
                // This part handles navigating into a subdirectory after moving up
                const nextDir = targetDir.subdirectories.find(sub => sub instanceof directory && sub.name === part);
                if (nextDir) {
                    targetDir = nextDir;
                    newPath = targetDir.path;
                } else {
                    appendTerminalOutput(`cd: No such file or directory: ${trimmedDir}`);
                    return; // Stop processing if a part of the path is invalid
                }
            }
        }
        const finalTargetDir = findDirectoryByPath(newPath);
        if (finalTargetDir) {
            currentDir = finalTargetDir;
            appendTerminalOutput(`Changed directory to ${currentDir.path}`);
        } else {
             appendTerminalOutput(`cd: No such file or directory: ${trimmedDir}`);
        }
    } else { // Handle navigating to a subdirectory
        const targetDir = currentDir.subdirectories.find(sub => sub instanceof directory && sub.name === trimmedDir);
        if (targetDir) {
            currentDir = targetDir;
            appendTerminalOutput(`Changed directory to ${currentDir.path}`);
        } else {
            appendTerminalOutput(`cd: No such file or directory: ${trimmedDir}`);
        }
    }
}

function handleLsCommand(dir) {
    // let output = '';
    appendTerminalOutput('sub Directory');
    for (const subDir of currentDir.subdirectories) {
        // output += ` ${subDir.name}`;
        appendTerminalOutput(` ${subDir.name}`);
    }
    appendTerminalOutput('sub file');
    for (const file of currentDir.files) {
        // output += `${file.name}`;
        appendTerminalOutput(` ${file.name}`);
    }
    // appendTerminalOutput(output.trim());
}

export {
    handlePwdCommand,
    handleCdCommand,
    handleLsCommand,
    currentDir
}