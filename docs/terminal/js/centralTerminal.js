// ==========================
// centralTerminal.js
// Core BASH-style Terminal Library with Command Class, Help, Redirection & Piping
// Author: CWP
// Version: 2.0
// Description:
//   Web-based terminal emulator with full BASH-style functionality.
//   Features include:
//     - Command objects with descriptions and aliases
//     - Dynamic help command
//     - Virtual filesystem & environment variables
//     - Sudo simulation
//     - Script engine with @tags
//     - Optional addon executors (games or specialized programs)
//     - Redirection (>, >>) and piping (|)
//
// USAGE & INTEGRATION:
//
// 1. Import the module in your project:
//    import { Terminal, TerminalLib, VirtualOS, CommandHandler, ScriptEngine, GameExecutor } from './centralTerminal.js';
//
// 2. Create a terminal instance (renders output to a DOM element):
//    const termDiv = document.getElementById("terminal-container");
//    const term = new Terminal("MyTerminal", termDiv);
//
// 3. Create a virtual OS instance (handles filesystem, aliases, env variables):
//    const vOS = new VirtualOS();
//
// 4. Initialize the Terminal Library (BASH-style command handler):
//    const lib = new TerminalLib(term, vOS);
//
// 5. Initialize a CommandHandler (for dispatching commands or add-ons):
//    const handler = new CommandHandler(vOS);
//    handler.registerExecutor("terminal", lib);
//
// -----------------------------------------------------------------------------
// CLASS OVERVIEW:
//
// Command:
//   - Represents a single command in the terminal.
//   - new Command(name, description, executeFunc, aliases = [])
//     - name: main command string (e.g., "ls")
//     - description: short description for help
//     - executeFunc: function to execute when called
//     - aliases: array of alternative names
//
// Terminal:
//   - Handles terminal output.
//   - print(message): prints message to the terminal
//
// VirtualOS:
//   - Simulates filesystem, environment variables, sudo, and aliases.
//   - createFile(path, content): creates/overwrites a file
//   - readFile(path): reads file content
//   - deleteFile(path): deletes a file
//   - listFiles(path): lists files in a directory
//   - changeDir(path): changes working directory
//   - setEnv(key, value): set env variable
//   - getEnv(key): get env variable
//   - createAlias(alias, command): create command alias
//   - resolveAlias(commandName): resolve alias to command
//   - canSudo(): check sudo permission
//
// TerminalLib:
//   - Main BASH-style command handler.
//   - addCommand(command): add a new Command object
//   - runCommand(input): execute a command string (supports redirection and piping)
//
// -----------------------------------------------------------------------------
// DEFAULT COMMANDS:
//
//   pwd    - Print current working directory
//   ls     - List files in current directory
//   cd     - Change directory
//   touch  - Create an empty file
//   cat    - Display file contents
//   rm     - Delete a file
//   mkdir  - Create a directory
//   echo   - Print text
//   clear  - Clear terminal output
//   help   - List available commands and descriptions
//
// Aliases can be added using: vOS.createAlias("aliasName", "commandName")
//
// -----------------------------------------------------------------------------
// REDIRECTION & PIPING:
//
// Redirection:
//   >   - overwrite a file with command output
//   >>  - append output to a file
//   Example:
//     echo "Hello World" > file.txt   // overwrite
//     echo "More text" >> file.txt    // append
//     cat file.txt                    // read file content
//
// Piping:
//   - Pass output of one command as input to another:
//     ls | echo
//   - Works for any Command objects in TerminalLib.
//
// -----------------------------------------------------------------------------
// ScriptEngine:
//
//   - Allows running multi-line scripts with optional @tags.
//   - Usage:
//       const script = new ScriptEngine(handler);
//       const lines = [
//           "@ This is a comment",
//           "mkdir projects",
//           "cd projects",
//           "touch file1.txt",
//           "echo Hello World > file1.txt",
//           "cat file1.txt"
//       ];
//       script.runScript(lines);
//   - Lines starting with @ are ignored and act as notes.
//
// -----------------------------------------------------------------------------
// GameExecutor / Add-ons:
//
//   - Optional executor for games or specialized programs.
//   - Example:
//       const game = new GameExecutor({ playerPosition: [0,0] });
//       handler.registerExecutor("game", game);
//       game.runCommand("move", 1, 2);
//       game.runCommand("attack", "enemy");
//
//   - runCommand(cmd, ...args) handles custom game logic.
//
// -----------------------------------------------------------------------------
// Example Usage in HTML:
//
// <div id="terminal-container"></div>
// <input type="text" id="command-input">
//
// <script type="module">
// import { Terminal, TerminalLib, VirtualOS, CommandHandler } from './centralTerminal.js';
// const termDiv = document.getElementById("terminal-container");
// const term = new Terminal("DemoTerminal", termDiv);
// const vOS = new VirtualOS();
// const lib = new TerminalLib(term, vOS);
// const handler = new CommandHandler(vOS);
// handler.registerExecutor("terminal", lib);
// const input = document.getElementByI ("command-input");
// input.addEventListener("keydown", e => {
//     if(e.key === "Enter"){
//         const cmd = input.value.trim();
//         term.print(`$ ${cmd} `);
//         handler.execute(cmd, "terminal");
//         input.value = "";
//     }
// });
// term.print("Welcome! Type 'help' to see commands.");
// </script>
//
// -----------------------------------------------------------------------------
// NOTES & TIPS:
//
// 1. Redirection and piping only work inside TerminalLib.runCommand. Existing commands remain compatible.
// 2. Aliases can help create shortcuts for complex commands.
// 3. ScriptEngine allows multi-line execution and documentation inside scripts.
// 4. GameExecutor or other add-ons can be plugged in via CommandHandler.registerExecutor.
//
// This documentation makes the module plug-and-play while keeping power features accessible for advanced users.
//
// ==========================

// --------------------->
// VFile and VDirectory Classes
// Basic virtual file system nodes
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
// Handles terminal output rendering and UI components
// --------------------->
export class Terminal {
    constructor(name, containerDiv) {
        this.name = name;
        this.containerDiv = containerDiv;
        this.history = [];
        this.uiComponents = {}; // Manages UI parts like maps or status bars

        // Automatically register the key UI components from the new HTML structure
        this._registerDefaultUI();
    }

    // --- UI Component Management ---

    registerComponent(name, elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            this.uiComponents[name] = element;
        } else {
            // This can be noisy, so only log if you are debugging UI issues
            console.warn(`UI component with ID '${elementId}' not found.`);
        }
    }

    _registerDefaultUI() {
        this.registerComponent('gameArea', 'game-area-container');
        this.registerComponent('statBar', 'stat-bar');
        this.registerComponent('map', 'map-area');
        this.registerComponent('user', 'user-ui');
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
        this.commandHistory = [];
        this.currentGame = null;
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
            const file = this.vOS._resolvePath(args[0]);

            if (!file || !(file instanceof VFile)) {
                this.term.print(`cat: No such file: ${args[0]}`);
                return;
            }

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

        if (parentDir && parentDir instanceof VDirectory && !parentDir.children[dirname]) {
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

// ---------------------
// CommandHandler
// Routes commands to executors (terminal, game, addons)
// ---------------------
export class CommandHandler {
    constructor(vOS = null) {
        this.executors = {};
        this.vOS = vOS;



    }

    registerExecutor(name, executor) { this.executors[name] = executor; }

    execute(commandString, executorName = "terminal") {
        const executor = this.executors[executorName];
        if (!executor) return console.warn(`Executor '${executorName}' not found`);
        if (typeof executor.runCommand === "function") executor.runCommand(commandString);
    }
}

// ---------------------
// ScriptEngine
// Runs multi-line scripts with optional @tags
// ---------------------
export class ScriptEngine {
    constructor(commandHandler, defaultExecutor = "terminal") {
        this.commandHandler = commandHandler;
        this.defaultExecutor = defaultExecutor;



    }

    runScript(lines = []) {
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("@")) {
                console.log(`[TAG] ${trimmed}`);
                continue;
            }
            this.commandHandler.execute(trimmed, this.defaultExecutor);
        }

    }
}

// ---------------------
// GameExecutor
// Optional executor for specialized programs or games
// ---------------------
export class GameExecutor {
    constructor(gameState = {}) { this.state = gameState; }

    runCommand(cmd, ...args) {
        console.log(`[GAME] ${cmd}`, args);
        switch (cmd.toLowerCase()) {
            case "move": this.state.playerPosition = args; break;
            case "attack": console.log(`Player attacks ${args[0]}`); break;
            default: console.log(`Unknown game command: ${cmd}`);
        }

    }
}