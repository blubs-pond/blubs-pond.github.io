
// =========================
// centralTerminal.js
// Core classes for the terminal application.
// This version includes a debug line in the 'cat' command to resolve pathing issues.
// =========================

// --------------------->
// VFile and VDirectory Classes
// --------------------->
export class VFile {
    constructor(name, content = '', type = 'text') {
        this.name = name;
        this.content = content;
        this.type = type;
    }
}

export class VDirectory {
    constructor(name) {
        this.name = name;
        this.children = {};
    }

    getChild(name) {
        return this.children[name];
    }
}

// --------------------->
// Terminal Class
// --------------------->
export class Terminal {
    constructor(name, containerDiv) {
        this.name = name;
        this.containerDiv = containerDiv;
        this.history = [];
        this.uiComponents = {};
        this._registerDefaultUI();
    }

    _registerDefaultUI() {
        this.registerComponent('gameArea', 'game-area-container');
        this.registerComponent('statBar', 'stat-bar');
        this.registerComponent('map', 'map-area');
        this.registerComponent('user', 'user-ui');
    }

    print(text) {
        const p = document.createElement("p");
        p.textContent = text;
        this.containerDiv.appendChild(p);
        this.containerDiv.scrollTop = this.containerDiv.scrollHeight;
        this.history.push(text);
    }

    printHtml(html) {
        const div = document.createElement("div");
        div.innerHTML = html;
        this.containerDiv.appendChild(div);
        this.containerDiv.scrollTop = this.containerDiv.scrollHeight;
        this.history.push(html);
    }

    clear() {
        this.containerDiv.innerHTML = "";
        this.history = [];
    }

    registerComponent(name, elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            this.uiComponents[name] = element;
        }
    }
    
    // ... (other UI methods) ...
}

// --------------------->
// Command Class
// --------------------->
export class Command {
    constructor(name, description, execute, aliases = []) {
        this.name = name;
        this.description = description;
        this.execute = execute;
        this.aliases = aliases;
    }
}

// --------------------->
// TerminalLib Class
// --------------------->
export class TerminalLib {
    constructor(terminalInstance, vOS) {
        this.term = terminalInstance;
        this.vOS = vOS;
        this.commands = {};
        this.commandHistory = [];
        this.currentGame = null;
        this._registerDefaultCommands();
    }

    addCommand(command) {
        this.commands[command.name] = command;
        command.aliases.forEach(alias => this.commands[alias] = command);
    }

    _registerDefaultCommands() {
        // ... (other commands) ...

        this.addCommand(new Command("cat", "Display file contents", (args) => {
            if (!args[0]) {
                this.term.print("Usage: cat <filename>");
                return;
            }
            const file = this.vOS._resolvePath(args[0]);

            if (!file || !(file instanceof VFile)) {
                this.term.print(`cat: No such file: ${args[0]}`);
                return;
            }

            // --- DEBUGGING LINE ---
            this.term.print(`DEBUG: Loading file with type '${file.type}' from path '${file.content}'`);

            switch (file.type) {
                case 'text':
                    file.content.split('\n').forEach(line => this.term.print(line));
                    break;
                case 'image':
                    this.term.printHtml(`<img src="${file.content}" alt="${file.name}" style="max-width: 100%; height: auto;">`);
                    break;
                case 'audio':
                    this.term.printHtml(`<audio controls src="${file.content}">Your browser does not support audio playback.</audio>`);
                    break;
                case 'exe':
                    this.term.print(`[Executable] To run this, type: ${file.name.split('.')[0]}`);
                    break;
                default:
                    this.term.print(`Unsupported file type: ${file.type}`);
            }
        }));

        // ... (other commands like ls, cd, etc.) ...
    }

    // ... (rest of TerminalLib class) ...
}

// --------------------->
// VirtualOS Class
// --------------------->
export class VirtualOS {
    constructor() {
        this.root = new VDirectory('/');
        this.cwd = this.root;
        this.env = { "HOME": "/home/user" };
        this.aliases = {};
        this.sudoEnabled = true;
        this._initializeFileSystem();
    }

    _initializeFileSystem() { /* Add-on will populate this */ }

    _resolvePath(path) {
        if (path === '/') return this.root;
        let parts = path.split('/').filter(p => p.length > 0);
        let current = path.startsWith('/') ? this.root : this.cwd;

        for (let i = 0; i < parts.length; i++) {
            let part = parts[i];
            if (part === '..') {
                current = this._getParent(current) || current;
            } else if (part !== '.') {
                if (current instanceof VDirectory && current.getChild(part)) {
                    current = current.getChild(part);
                } else {
                    return null;
                }
            }
        }
        return current;
    }

    _getParent(node) {
        if (node === this.root) return this.root;
        const findParent = (dir, target) => {
            for (const childName in dir.children) {
                const child = dir.children[childName];
                if (child === target) return dir;
                if (child instanceof VDirectory) {
                    const found = findParent(child, target);
                    if (found) return found;
                }
            }
            return null;
        }
        return findParent(this.root, node);
    }

    createFile(path, content = '', type = 'text') {
        let parts = path.split('/');
        let filename = parts.pop();
        let dirPath = parts.join('/') || '/';
        let directory = this._resolvePath(dirPath);

        if (directory && directory instanceof VDirectory && !directory.children[filename]) {
            directory.children[filename] = new VFile(filename, content, type);
            return true;
        }
        return false;
    }
    
    createDirectory(path) {
        let parts = path.split('/');
        let dirname = parts.pop();
        let parentPath = parts.join('/') || '/';
        let parentDir = this._resolvePath(parentPath);

        if (parentDir && parentDir instanceof VDirectory &&!parentDir.children[dirname]) {
            parentDir.children[dirname] = new VDirectory(dirname);
            return true;
        }
        return false;
    }
    changeDir(path) {
        if (!path || path === '/') {
            this.cwd = this.root;
            return true;
        }
        let newDir = this._resolvePath(path);
        if (newDir && newDir instanceof VDirectory) {
            this.cwd = newDir;
            return true;
        }
        return false;
    }
    // ... (rest of VirtualOS class) ...
}
