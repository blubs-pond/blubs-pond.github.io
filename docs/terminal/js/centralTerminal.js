
// =========================
// centralTerminal.js
// Core classes for the terminal application.
// This file has been refactored to combine the logic from the old cmd.js, dir.js, and ui.js.
// =========================

// --------------------->
// VFile and VDirectory Classes
// Basic virtual file system nodes
// --------------------->
export class VFile {
    constructor(name, content = '') {
        this.name = name;
        this.content = content;
    }
}

export class VDirectory {
    constructor(name) {
        this.name = name;
        this.children = {}; // Using an object for faster lookups
    }

    getChild(name) {
        return this.children[name];
    }
}

// --------------------->
// Terminal Class
// Handles terminal output rendering and UI components
// --------------------->
export class Terminal {
    constructor(name, containerDiv) {
        this.name = name;
        this.containerDiv = containerDiv; // The main terminal output area (#terminalOutput)
        this.history = [];
        this.uiComponents = {}; // Manages UI parts like maps or status bars

        // Automatically register the key UI components from the new HTML structure
        this._registerDefaultUI();
    }

    _registerDefaultUI() {
        this.registerComponent('gameArea', 'game-area-container');
        this.registerComponent('statBar', 'stat-bar');
        this.registerComponent('map', 'map-area');
        this.registerComponent('user', 'user-ui');
    }

    // Prints plain text to the terminal, safely escaping HTML
    print(text) {
        const p = document.createElement("p"); // Use a <p> tag to match original CSS
        p.textContent = text;
        this.containerDiv.appendChild(p);
        this.containerDiv.scrollTop = this.containerDiv.scrollHeight;
        this.history.push(text);
    }

    // Prints raw HTML to the terminal (use with trusted content)
    printHtml(html) {
        // Create a wrapper for the HTML to ensure consistent styling if needed
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

    // --- UI Component Management ---

    registerComponent(name, elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            this.uiComponents[name] = element;
        } else {
            // This can be noisy, so only log if you are debugging UI issues
            // console.warn(`UI component with ID '${elementId}' not found.`);
        }
    }

    showComponent(name) {
        if (this.uiComponents[name]) {
            this.uiComponents[name].style.display = 'block'; // Or 'flex', etc., depending on the component
        }
    }

    hideComponent(name) {
        if (this.uiComponents[name]) {
            this.uiComponents[name].style.display = 'none';
        }
    }

    updateComponent(name, content, isHtml = false) {
        if (this.uiComponents[name]) {
            if (isHtml) {
                this.uiComponents[name].innerHTML = content;
            } else {
                this.uiComponents[name].textContent = content;
            }
        }
    }
}


// --------------------->
// Command Class
// A simple structure for defining terminal commands
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
// High-level terminal API with BASH-style command execution
// --------------------->
export class TerminalLib {
    constructor(terminalInstance, vOS) {
        this.term = terminalInstance;
        this.vOS = vOS;
        this.commands = {};
        this.commandHistory = []; // From cmd.js
        this.currentGame = null;  // From cmd.js
        this._registerDefaultCommands();
    }

    addCommand(command) {
        this.commands[command.name] = command;
        command.aliases.forEach(alias => this.commands[alias] = command);
    }

    _registerDefaultCommands() {
        this.addCommand(new Command("pwd", "Print current working directory", () => {
            this.term.print(this.vOS._getFullPath(this.vOS.cwd));
        }));

        this.addCommand(new Command("ls", "List files in current directory", (args) => {
            const path = args[0] || '.';
            const files = this.vOS.listFiles(path);
            // Use printHtml to render columns, but could also just be a simple list
            if (files.length > 0) {
                this.term.print(files.join('\n'));
            } else {
                this.term.print("Empty directory.");
            }
        }));

        this.addCommand(new Command("cd", "Change directory", (args) => {
            if (!args[0]) {
                this.term.print("Usage: cd <directory>");
                return;
            }
            if (!this.vOS.changeDir(args[0])) {
                this.term.print(`cd: no such file or directory: ${args[0]}`);
            }
            // No success message for cd is standard
        }));

        this.addCommand(new Command("touch", "Create an empty file", (args) => {
            if (!args[0]) {
                this.term.print("Usage: touch <filename>");
                return;
            }
            if (!this.vOS.createFile(args[0])) {
                this.term.print(`touch: cannot create file: ${args[0]}`);
            }
        }));

        this.addCommand(new Command("cat", "Display file contents", (args) => {
             if (!args[0]) {
                this.term.print("Usage: cat <filename>");
                return;
            }
            const content = this.vOS.readFile(args[0]);
            if (content !== null) {
                // Split content by newlines and print each line separately
                content.split('\n').forEach(line => this.term.print(line));
            } else {
                this.term.print(`cat: no such file: ${args[0]}`);
            }
        }));

        this.addCommand(new Command("rm", "Delete a file", (args) => {
             if (!args[0]) {
                this.term.print("Usage: rm <filename>");
                return;
            }
            if (!this.vOS.deleteFile(args[0])) {
                this.term.print(`rm: cannot remove '${args[0]}': No such file`);
            }
        }));

        this.addCommand(new Command("mkdir", "Create a directory", (args) => {
            if (!args[0]) {
                this.term.print("Usage: mkdir <directory>");
                return;
            }
            if (!this.vOS.createDirectory(args[0])) {
                this.term.print(`mkdir: cannot create directory: ${args[0]}`);
            }
        }));

        this.addCommand(new Command("echo", "Print text", (args) => this.term.print(args.join(" "))));
        this.addCommand(new Command("clear", "Clear terminal output", () => this.term.clear()));
        this.addCommand(new Command("help", "List available commands", () => {
            const allCommands = Object.values(this.commands)
                .filter((val, index, self) => self.findIndex(v => v.name === val.name) === index) // Unique commands
                .sort((a, b) => a.name.localeCompare(b.name));

            const helpText = allCommands
                .map(cmd => `${cmd.name.padEnd(15)} - ${cmd.description}`)
                .join('\n');
            this.term.print(helpText);
        }));

        // --- New commands from cmd.js ---
        this.addCommand(new Command("history", "Show command history. Use !<number> to rerun.", () => {
            this.term.print("Command History:");
            this.commandHistory.forEach((cmd, index) => {
                this.term.print(`${index + 1}: ${cmd}`);
            });
        }));

        this.addCommand(new Command("date", "Displays the current date and time.", () => {
             const now = new Date();
             this.term.print(`${now.toLocaleDateString()} ${now.toLocaleTimeString()}`);
        }, ["time"]));

        this.addCommand(new Command("reactor", "Launches the Reactor Control game.", () => {
            if (this.currentGame === 'reactor') {
                this.term.print("Reactor Control is already running.");
            } else {
                this.term.showComponent('gameArea');
                this.currentGame = 'reactor';
                this.term.print("Launching Reactor Control... Type 'exit' to quit.");
                // TODO: Import and call the actual game start function here
                // Example: r_ctrl.startReactorGame(this.term, this.vOS);
            }
        }, ["reactor-ctrl", "r-ctrl"]));

         this.addCommand(new Command("exit", "Exits the current game or module.", () => {
            if (this.currentGame) {
                this.term.print(`Exited ${this.currentGame}.`);
                this.term.hideComponent('gameArea');
                this.currentGame = null;
            } else {
                this.term.print("No active game to exit.");
            }
        }));

        this.addCommand(new Command("tree", "Display the directory structure as a tree.", (args) => {
            const path = args[0] || '.';
            const startNode = this.vOS._resolvePath(path);

            if (startNode && startNode instanceof VDirectory) {
                this.term.print(this.vOS._getFullPath(startNode)); // Print the full path of the directory
                this._printTreeRecursive(startNode);
            } else {
                this.term.print(`tree: '${path}' is not a directory or does not exist.`);
            }
        }));
        this.addCommand(new Command("open", "Opens a page in the browser", (args) => {
            if (!args[0]) {
                this.term.print("Usage: open <page-name>");
                return;
            }
            const pageName = args[0].replace(/\.txt$/, '');
            const validPages = ['index', 'best-of-blub', 'fan-art', 'commissions'];
            if (validPages.includes(pageName)) {
                this.term.print(`Opening ${pageName}.html...`);
                window.location.href = `${pageName}.html`;
            } else {
                this.term.print(`open: page '${pageName}' not found. Try 'ls pages'.`);
            }
        }));
    }

    runCommand(input) {
        input = input.trim();
        if (!input) return;

        if (this.commandHistory[this.commandHistory.length - 1] !== input) {
            this.commandHistory.push(input);
        }

        if (input.startsWith('!')) {
            const historyIndex = parseInt(input.substring(1), 10) - 1;
            if (!isNaN(historyIndex) && historyIndex >= 0 && historyIndex < this.commandHistory.length - 1) {
                const commandToRun = this.commandHistory[historyIndex];
                this.term.print(`> ${commandToRun}`);
                this.runCommand(commandToRun);
                return;
            } else {
                this.term.print("Invalid history index.");
                return;
            }
        }

        if (this.currentGame) {
            if (input.toLowerCase() === 'exit') {
                this.commands['exit'].execute([]);
            } else {
                // TODO: Pass the command to the current game's handler
                this.term.print(`[${this.currentGame}]> ${input}`);
            }
            return;
        }

        const parts = input.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
        const cmdName = parts[0]?.toLowerCase();
        const args = parts.slice(1).map(arg => arg.replace(/^"|"$/g, ''));

        const resolvedCmdName = this.vOS.resolveAlias(cmdName);
        const command = this.commands[resolvedCmdName];

        if (command) {
            command.execute(args);
        } else {
            this.term.print(`Command not recognized: ${cmdName}`);
        }
    }
    _printTreeRecursive(directory, prefix = '') {
        const children = Object.values(directory.children);
        children.forEach((child, index) => {
            const isLast = index === children.length - 1;
            const decorator = isLast ? '└── ' : '├── ';
            const newPrefix = prefix + (isLast ? '    ' : '│   ');
    
            if (child instanceof VDirectory) {
                this.term.print(`${prefix}${decorator}${child.name}/`);
                this._printTreeRecursive(child, newPrefix);
            } else {
                this.term.print(`${prefix}${decorator}${child.name}`);
            }
        });
    }

}

// --------------------->
// VirtualOS Class
// Simulates filesystem, environment variables, aliases, and sudo
// --------------------->
export class VirtualOS {
    constructor() {
        this.root = new VDirectory('/');
        this.cwd = this.root;
        this.env = { "HOME": "/home/user" };
        this.aliases = {};
        this.sudoEnabled = true;
        this._initializeFileSystem(); // Initialize the default directory structure
    }

    _initializeFileSystem() {
        const createDirs = (path) => {
            let current = this.root;
            path.split('/').filter(p => p).forEach(part => {
                if (!current.children[part]) {
                    const newDir = new VDirectory(part);
                    current.children[part] = newDir;
                }
                current = current.children[part];
            });
        };

        createDirs('C/Users');
        createDirs('C/Program Files');
        createDirs('D');

        this.createFile('/readme.txt', 'Welcome to the new terminal! This file system is now managed by VirtualOS.');
        this.createFile('C/Users/guest.txt', 'This is a guest user profile.');
    }

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
                    return null; // Not found
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
                if (child === target) {
                    return dir;
                }
                if (child instanceof VDirectory) {
                    const found = findParent(child, target);
                    if (found) return found;
                }
            }
            return null;
        }
        return findParent(this.root, node);
    }

    _getFullPath(directory) {
        if (directory === this.root) return '/';
        let path = '';
        let current = directory;
        while (current && current !== this.root) {
            path = '/' + current.name + path;
            current = this._getParent(current);
        }
        return path || '/';
    }

    createFile(path, content = '') {
        let parts = path.split('/');
        let filename = parts.pop();
        let dirPath = parts.join('/') || '/';
        let directory = this._resolvePath(dirPath);

        if (directory && directory instanceof VDirectory && !directory.children[filename]) {
            directory.children[filename] = new VFile(filename, content);
            return true;
        }
        return false;
    }

    readFile(path) {
        let file = this._resolvePath(path);
        return (file && file instanceof VFile) ? file.content : null;
    }

    deleteFile(path) {
        let parts = path.split('/');
        let filename = parts.pop();
        let dirPath = parts.join('/');
        let directory = this._resolvePath(dirPath);

        if (directory && directory.getChild(filename) instanceof VFile) {
            delete directory.children[filename];
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

    listFiles(path = '.') {
        let directory = this._resolvePath(path);
        if (directory && directory instanceof VDirectory) {
            return Object.keys(directory.children).map(key => {
                return directory.children[key] instanceof VDirectory ? `${key}/` : key;
            });
        }
        return [];
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

    setEnv(key, value) { this.env[key] = value; }
    getEnv(key) { return this.env[key]; }
    createAlias(alias, command) { this.aliases[alias] = command; }
    resolveAlias(commandName) { return this.aliases[commandName] || commandName; }
    canSudo() { return this.sudoEnabled; }
}
