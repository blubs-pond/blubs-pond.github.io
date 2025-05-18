import { appendTerminalOutput } from './ui.js';

let currentDir = rootDirectory;

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

// Function to find a directory by its path
function findDirectoryByPath(path, startDir = rootDirectory) {
    if (startDir.path === path) {
        return startDir;
    }
    for (const subDir of startDir.subdirectories) {
        if (subDir instanceof directory) {
            const found = findDirectoryByPath(path, subDir);
            if (found) return found;
        }
    }
    return null;
}

function handlePwdCommand() {
    appendTerminalOutput('YOU DO NOT HAVE PERMISSION TO DO SO YET');
}

function handleCdCommand(dir) {
    dir = dir.trim();
    if (dir.trim() === '/') {
        // Handle root directory
        currentDir = rootDirectory;
        appendTerminalOutput(`Changed directory to ${currentDir.path}`);
    } else if (/^[a-zA-Z]:\//.test(dir.trim())) {
        // Handle absolute paths
        const targetDir = findDirectoryByPath(dir);
        if (targetDir) {
            currentDir = targetDir;
            appendTerminalOutput(`Changed directory to ${currentDir.path}`);
        } else {
            appendTerminalOutput(`cd: No such file or directory: ${dir}`);
        }
    } else if (dir.trim().search(/^\.\./) === 0) {
        let targetDir = currentDir;
        const parts = dir.trim().split('/');
        let newPath = targetDir.path;
        for (const part of parts) {
            if (part === '..') {
                if (newPath !== '/' && newPath.lastIndexOf('/') > 0) {
                    newPath = newPath.substring(0, newPath.lastIndexOf('/'));
                } else if (newPath.lastIndexOf('/') === 0 && newPath.length > 1) {
                    // Handle cases like "C:/" moving to "/"
                    newPath = '/';
                } else {
                    // Already at the root or a drive root
                }
            } else if (part !== '' && part !== '.') {
                // This part handles navigating into a subdirectory after moving up
                const nextDir = targetDir.subdirectories.find(sub => sub instanceof directory && sub.name === part);
                if (nextDir) {
                    targetDir = nextDir;
                    newPath = targetDir.path;
                } else {
                    appendTerminalOutput(`cd: No such file or directory: ${dir}`);
                    return; // Stop processing if a part of the path is invalid
                }

            }
        }
        const finalTargetDir = findDirectoryByPath(newPath);
        if (finalTargetDir) {
            currentDir = finalTargetDir;
            appendTerminalOutput(`Changed directory to ${currentDir.path}`);
        }
    }
};

function handleLsCommand(dir) {
    let output = '';
    for (const subDir of currentDir.subdirectories) {
        output += `<span class="directory">${subDir.name}</span>  `;
    }
    for (const file of currentDir.files) {
        output += `<span class="file">${file.name}</span>  `;
    }
    appendTerminalOutput(output.trim());
}

export {
    handlePwdCommand,
    handleCdCommand,
    handleLsCommand,
    currentDir
}