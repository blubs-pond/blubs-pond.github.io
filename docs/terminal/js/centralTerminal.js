/**
 * ==========================
 * centralTerminal.js
 * A Modular, BASH-style Terminal Emulator Library for the Web.
 * Author: CWP
 * Version: 2.2
 *
 * Description:
 *   An extensible, web-based terminal emulator. It provides a core set of
 *   BASH-like commands and a modular architecture for adding new functionality
 *   through addons, such as games or specialized tools.
 *
 * Features:
 *   - Core commands (ls, cd, cat, mkdir, etc.)
 *   - A virtual file system with directories and files of different types.
 *   - Command history (recall commands with !)
 *   - Command aliasing.
 *   - A modular addon system for easy extension.
 *
 * ==========================
 *
 * USAGE & INTEGRATION:
 *
 * 1. Import the necessary classes:
 *    import { Terminal, TerminalLib, VirtualOS, Addon, AddonExecutor } from './centralTerminal.js';
 *
 * 2. Initialize the core components:
 *    const termDiv = document.getElementById("terminal-output");
 *    const term = new Terminal("CWP_Terminal", termDiv);
 *    const vOS = new VirtualOS();
 *    const addonExecutor = new AddonExecutor();
 *    const lib = new TerminalLib(term, vOS, addonExecutor);
 *
 * 3. Create and register a custom addon (optional):
 *    class MyGame extends Addon {
 *        onCommand(input) { this.term.print(`My game says: ${input}`); }
 *    }
 *    addonExecutor.registerAddon(new MyGame("mygame"));
 *
 * 4. Hook up the user input:
 *    const inputField = document.getElementById("terminal-input");
 *    inputField.addEventListener("keydown", (e) => {
 *        if (e.key === "Enter") {
 *            const command = inputField.value;
 *            term.print(`> ${command}`);
 *            lib.runCommand(command);
 *            inputField.value = "";
 *        }
 *    });
 *
 * -----------------------------------------------------------------------------
 * CLASS OVERVIEW:
 *
 *   VFile, VDirectory:
 *     - The basic nodes that make up the virtual file system.
 *
 *   Terminal:
 *     - Handles rendering output to the screen and managing UI components.
 *
 *   Command:
 *     - A structure for defining a single terminal command, its description,
 *       aliases, and execution logic.
 *
 *   VirtualOS:
 *     - Simulates the file system, environment variables, and command aliases.
 *
 *   TerminalLib:
 *     - The main command processor. It parses user input, executes commands,
 *       and routes input to an active addon if one is running.
 *
 *   Addon:
 *     - A base class that developers can extend to create new applications
 *       (like games or tools) for the terminal.
 *
 *   AddonExecutor:
 *     - Manages the lifecycle of addons: registering, starting ('run'),
 *       and stopping ('exit').
 *
 * -----------------------------------------------------------------------------
 * DEFAULT COMMANDS:
 *
 *   pwd, ls, cd, cat, touch, rm, mkdir, echo, clear, help, history, date, tree
 *   run <addon-name>   - Starts a registered addon.
 *   exit               - Stops the currently running addon.
 *
 * -----------------------------------------------------------------------------
 * ADDON SYSTEM:
 *
 *   Addons are the primary way to extend the terminal's functionality.
 *
 *   1. Create a class that extends the 'Addon' base class.
 *   2. Implement the onStart, onCommand, and onStop methods for your logic.
 *   3. Register an instance of your class with the AddonExecutor.
 *
 *   Example Addon:
 *
 *   class Greeter extends Addon {
 *     constructor() { super("greeter"); }
 *     onStart(term) { term.print("Greeter addon started! Try saying 'hello'."); }
 *     onCommand(input) {
 *       if (input === 'hello') this.term.print("Hello to you too!");
 *       else this.term.print("I only understand 'hello'.");
 *     }
 *   }
 *   addonExecutor.registerAddon(new Greeter());
 *
 *   // User then types: run greeter
 *
 * ==========================
 */

// --------------------->
// VFile and VDirectory Classes
// These are the basic nodes for the virtual file system.
// --------------------->

/**
 * Represents a file node in the virtual file system.
 */
export class VFile {
    /**
     * @param {string} name - The name of the file (e.g., "readme.txt").
     * @param {string} [content=''] - The content of the file.
     * @param {string} [type='text'] - The type of the file, used by commands like 'cat' to determine how to display it.
     */
    constructor(name, content = '', type = 'text') {
        /** @type {string} The file's name. */
        this.name = name;
        /** @type {string} The file's content. */
        this.content = content;
        /** @type {string} The file's type (e.g., 'text', 'image', 'exe'). */
        this.type = type;
    }
}

/**
 * Represents a directory node in the virtual file system, which can contain files and other directories.
 */
export class VDirectory {
    /**
     * @param {string} name - The name of the directory (e.g., "home").
     */
    constructor(name) {
        /** @type {string} The directory's name. */
        this.name = name;
        /** @type {Object.<string, VFile|VDirectory>} A dictionary of child nodes, with their names as keys. */
        this.children = {};
    }

    /**
     * Retrieves a child node by its name.
     * @param {string} name - The name of the child file or directory.
     * @returns {VFile|VDirectory|undefined} The child node, or undefined if it doesn't exist.
     */
    getChild(name) {
        return this.children[name];
    }
}

// --------------------->
// Terminal Class
// Handles terminal output rendering and management of associated UI components.
// --------------------->
export class Terminal {
    /**
     * @param {string} name - The name of the terminal instance.
     * @param {HTMLElement} containerDiv - The HTML element where the terminal output will be rendered.
     */
    constructor(name, containerDiv) {
        /** @type {string} The terminal's name. */
        this.name = name;
        /** @type {HTMLElement} The container element for terminal output. */
        this.containerDiv = containerDiv;
        /** @type {string[]} A history of all output lines (text or HTML). */
        this.history = [];
        /** @type {Object.<string, HTMLElement>} A dictionary of managed UI components. */
        this.uiComponents = {}; // Manages UI parts like maps or status bars

        // Automatically register the key UI components from the new HTML structure
        this._registerDefaultUI();
    }

    // --- UI Component Management ---

    /**
     * Registers a UI component by its element ID, allowing it to be controlled by the terminal.
     * @param {string} name - The name to refer to the component by (e.g., 'gameArea').
     * @param {string} elementId - The ID of the HTML element.
     */
    registerComponent(name, elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            this.uiComponents[name] = element;
        } else {
            // This can be noisy, so only log if you are debugging UI issues
            console.warn(`UI component with ID '${elementId}' not found.`);
        }
    }

    /**
     * Registers the default set of UI components expected by the terminal.
     * @private
     */
    _registerDefaultUI() {
        this.registerComponent('gameArea', 'game-area-container');
        this.registerComponent('statBar', 'stat-bar');
        this.registerComponent('map', 'map-area');
        this.registerComponent('user', 'user-ui');
    }

    /**
     * Makes a registered UI component visible.
     * @param {string} name - The name of the component to show.
     */
    showComponent(name) {
        if (this.uiComponents[name]) {
            this.uiComponents[name].style.display = 'block'; // Or 'flex', etc., depending on the component
        }
    }

    /**
     * Hides a registered UI component.
     * @param {string} name - The name of the component to hide.
     */
    hideComponent(name) {
        if (this.uiComponents[name]) {
            this.uiComponents[name].style.display = 'none';
        }
    }

    /**
     * Updates the content of a registered UI component.
     * @param {string} name - The name of the component to update.
     * @param {string} content - The content to set (can be plain text or HTML).
     * @param {boolean} [isHtml=false] - If true, the content is set as innerHTML; otherwise, as textContent.
     */
    updateComponent(name, content, isHtml = false) {
        if (this.uiComponents[name]) {
            if (isHtml) {
                this.uiComponents[name].innerHTML = content;
            } else {
                this.uiComponents[name].textContent = content;
            }
        }
    }

    /**
     * Prints a plain text message to the terminal.
     * @param {string} text - The text to print.
     */
    print(text) {
        const p = document.createElement("p");
        p.textContent = text;
        this.containerDiv.appendChild(p);
        this.containerDiv.scrollTop = this.containerDiv.scrollHeight;
        this.history.push(text);
    }

    /**
     * Renders an HTML string in the terminal.
     * @param {string} html - The HTML string to render.
     */
    printHtml(html) {
        const div = document.createElement("div");
        div.innerHTML = html;
        this.containerDiv.appendChild(div);
        this.containerDiv.scrollTop = this.containerDiv.scrollHeight;
        this.history.push(html);
    }

    /**
     * Clears all output from the terminal screen.
     */
    clear() {
        this.containerDiv.innerHTML = "";
        this.history = [];
    }
}


// --------------------->
// Command Class
// A structure for defining terminal commands, including their properties and execution logic.
// --------------------->
export class Command {
    /**
     * @param {string} name - The primary name of the command (e.g., "ls").
     * @param {string} description - A brief description shown in the 'help' command.
     * @param {function(string[]): void} execute - The function to run when the command is called. It receives an array of arguments.
     * @param {string[]} [aliases=[]] - An array of alternative names for the command (e.g., ["list"]).
     */
    constructor(name, description, execute, aliases = []) {
        /** @type {string} The command's name. */
        this.name = name;
        /** @type {string} The command's description. */
        this.description = description;
        /** @type {function(string[]): void} The function that executes the command's logic. */
        this.execute = execute;
        /** @type {string[]} The command's aliases. */
        this.aliases = aliases;
    }
}

// --------------------->
// TerminalLib Class
// High-level terminal API with BASH-style command execution.
// --------------------->
export class TerminalLib {
    /**
     * @param {Terminal} terminalInstance - The terminal UI handler.
     * @param {VirtualOS} vOS - The virtual OS for file system and environment access.
     */
    constructor(terminalInstance, vOS) {
        /** @type {Terminal} The terminal instance. */
        this.term = terminalInstance;
        /** @type {VirtualOS} The virtual OS instance. */
        this.vOS = vOS;
        /** @type {Object.<string, Command>} A dictionary of all registered commands. */
        this.commands = {};
        /** @type {string[]} A history of all commands entered by the user. */
        this.commandHistory = [];
        /** @type {string|null} Tracks the name of the currently running game or module. */
        this.currentGame = null;
        this._registerDefaultCommands();
    }

    /**
     * Adds a new command to the library and registers its aliases.
     * @param {Command} command - The Command object to add.
     */
    addCommand(command) {
        this.commands[command.name] = command;
        command.aliases.forEach(alias => this.commands[alias] = command);
    }

    /**
     * Registers the default set of commands for the terminal.
     * @private
     */
    _registerDefaultCommands() {
        this.addCommand(new Command("pwd", "Print current working directory", () => {
            this.term.print(this.vOS._getFullPath(this.vOS.cwd));
        }));

        this.addCommand(new Command("ls", "List files in current directory", (args) => {
            const path = args[0] || '.';
            const files = this.vOS.listFiles(path);
            this.term.print(files.length > 0 ? files.join('\n') : "Empty directory.");
        }));

        this.addCommand(new Command("cd", "Change directory", (args) => {
            if (!args[0]) {
                this.term.print("Usage: cd <directory>");
                return;
            }
            if (!this.vOS.changeDir(args[0])) {
                this.term.print(`cd: no such file or directory: ${args[0]}`);
            }
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
            const uniqueCommands = [...new Set(Object.values(this.commands))];
            const sortedCommands = uniqueCommands.sort((a, b) => a.name.localeCompare(b.name));
            const helpText = sortedCommands
                .map(cmd => `${cmd.name.padEnd(15)} - ${cmd.description}`)
                .join('\n');
            this.term.print(helpText);
        }));

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
            if (startNode instanceof VDirectory) {
                this.term.print(this.vOS._getFullPath(startNode));
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
                this.term.print(`open: page '${pageName}' not found.`);
            }
        }));
    }

    /**
     * Parses and executes a command string entered by the user.
     * @param {string} input - The raw command string.
     */
    runCommand(input) {
        input = input.trim();
        if (!input) return;

        if (this.commandHistory[this.commandHistory.length - 1] !== input) {
            this.commandHistory.push(input);
        }

        if (input.startsWith('!')) {
            const historyIndex = parseInt(input.substring(1), 10) - 1;
            const commandToRun = this.commandHistory[historyIndex];
            if (commandToRun) {
                this.term.print(`> ${commandToRun}`);
                this.runCommand(commandToRun);
            } else {
                this.term.print("Invalid history index.");
            }
            return;
        }

        if (this.currentGame) {
            if (input.toLowerCase() === 'exit') {
                this.commands['exit'].execute([]);
            } else {
                // If a game is active, you can pass the command to its handler here
                this.term.print(`[${this.currentGame}]> ${input}`);
            }
            return;
        }

        const parts = input.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
        const cmdName = parts.shift()?.replace(/"/g, '').toLowerCase();
        const args = parts.map(arg => arg.replace(/"/g, ''));

        const resolvedCmdName = this.vOS.resolveAlias(cmdName);
        const command = this.commands[resolvedCmdName];

        if (command) {
            command.execute(args);
        } else {
            this.term.print(`Command not recognized: ${cmdName}`);
        }
    }
    
    /**
     * Recursively prints a directory tree structure.
     * @param {VDirectory} directory - The directory to start printing from.
     * @param {string} [prefix=''] - The indentation prefix for the current line.
     * @private
     */
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
// Simulates a file system, environment variables, aliases, and sudo capabilities.
// --------------------->
export class VirtualOS {
    /**
     * Initializes the VirtualOS, setting up the file system and default state.
     */
    constructor() {
        /** @type {VDirectory} The root directory ('/') of the file system. */
        this.root = new VDirectory('/');
        /** @type {VDirectory} The current working directory. */
        this.cwd = this.root;
        /** @type {Object.<string, string>} A dictionary of environment variables. */
        this.env = { "HOME": "/home/user" };
        /** @type {Object.<string, string>} A dictionary for command aliases. */
        this.aliases = {};
        /** @type {boolean} A flag to simulate sudo privileges. */
        this.sudoEnabled = true;
        this._initializeFileSystem(); // Initialize the default directory structure
    }

    /**
     * Creates the initial directory structure for the virtual file system.
     * @private
     */
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

    /**
     * Resolves a path string to a file or directory object.
     * @param {string} path - The path to resolve (can be relative or absolute).
     * @returns {VFile|VDirectory|null} The corresponding file or directory object, or null if not found.
     * @private
     */
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

    /**
     * Finds the parent directory of a given node in the file system.
     * @param {VFile|VDirectory} node - The starting node.
     * @returns {VDirectory|null} The parent directory, or null if the node is the root.
     * @private
     */
    _getParent(node) {
        if (node === this.root) return null; // Root has no parent
        const findParent = (dir, target) => {
            for (const child of Object.values(dir.children)) {
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

    /**
     * Constructs the full, absolute path for a given directory.
     * @param {VDirectory} directory - The directory to find the path for.
     * @returns {string} The full path string (e.g., "/C/Users").
     * @private
     */
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

    /**
     * Creates a new file with optional content and type.
     * @param {string} path - The full path where the file should be created.
     * @param {string} [content=''] - The initial content of the file.
     * @param {string} [type='text'] - The type of the file (e.g., 'text', 'image').
     * @returns {boolean} True if creation was successful, false otherwise.
     */
    createFile(path, content = '', type = 'text') {
        const parts = path.split('/');
        const filename = parts.pop();
        const dirPath = parts.join('/') || '/';
        const directory = this._resolvePath(dirPath);

        if (directory instanceof VDirectory && !directory.children[filename]) {
            directory.children[filename] = new VFile(filename, content, type);
            return true;
        }
        return false;
    }

    /**
     * Reads the content of a specified file.
     * @param {string} path - The path to the file.
     * @returns {string|null} The content of the file, or null if it's not a file or doesn't exist.
     */
    readFile(path) {
        const file = this._resolvePath(path);
        return (file instanceof VFile) ? file.content : null;
    }

    /**
     * Deletes a file from the virtual file system.
     * @param {string} path - The path to the file to be deleted.
     * @returns {boolean} True if deletion was successful, false otherwise.
     */
    deleteFile(path) {
        const parts = path.split('/');
        const filename = parts.pop();
        const dirPath = parts.join('/');
        const directory = this._resolvePath(dirPath);

        if (directory instanceof VDirectory && directory.getChild(filename) instanceof VFile) {
            delete directory.children[filename];
            return true;
        }
        return false;
    }

    /**
     * Creates a new directory.
     * @param {string} path - The full path where the directory should be created.
     * @returns {boolean} True if creation was successful, false otherwise.
     */
    createDirectory(path) {
        const parts = path.split('/');
        const dirname = parts.pop();
        const parentPath = parts.join('/') || '/';
        const parentDir = this._resolvePath(parentPath);

        if (parentDir instanceof VDirectory && !parentDir.children[dirname]) {
            parentDir.children[dirname] = new VDirectory(dirname);
            return true;
        }
        return false;
    }

    /**
     * Lists the files and subdirectories within a given directory.
     * @param {string} [path='.'] - The path to the directory to list. Defaults to the current directory.
     * @returns {string[]} An array of names. Directories are suffixed with a '/'.
     */
    listFiles(path = '.') {
        const directory = this._resolvePath(path);
        if (directory instanceof VDirectory) {
            return Object.keys(directory.children).map(key => {
                return directory.children[key] instanceof VDirectory ? `${key}/` : key;
            });
        }
        return [];
    }

    /**
     * Changes the current working directory.
     * @param {string} path - The path to the new directory.
     * @returns {boolean} True if the directory change was successful, false otherwise.
     */
    changeDir(path) {
        if (!path || path === '/') {
            this.cwd = this.root;
            return true;
        }
        const newDir = this._resolvePath(path);
        if (newDir instanceof VDirectory) {
            this.cwd = newDir;
            return true;
        }
        return false;
    }

    /**
     * Sets an environment variable.
     * @param {string} key - The variable's name.
     * @param {string} value - The variable's value.
     */
    setEnv(key, value) { this.env[key] = value; }

    /**
     * Gets an environment variable.
     * @param {string} key - The variable's name.
     * @returns {string|undefined} The value of the variable, or undefined if not set.
     */
    getEnv(key) { return this.env[key]; }

    /**
     * Creates a shortcut for a command.
     * @param {string} alias - The name of the alias.
     * @param {string} command - The command string the alias should execute.
     */
    createAlias(alias, command) { this.aliases[alias] = command; }

    /**
     * Resolves an alias to its original command string.
     * @param {string} commandName - The alias to resolve.
     * @returns {string} The original command, or the input if it's not an alias.
     */
    resolveAlias(commandName) { return this.aliases[commandName] || commandName; }

    /**
     * Checks if sudo privileges are enabled.
     * @returns {boolean} The current state of sudo privileges.
     */
    canSudo() { return this.sudoEnabled; }
}

// ---------------------
// CommandHandler
// Routes commands to registered executors (e.g., terminal, addons).
// ---------------------
export class CommandHandler {
    /**
     * @param {VirtualOS} [vOS=null] - An instance of the virtual OS.
     */
    constructor(vOS = null) {
        this.executors = {};
        this.vOS = vOS;
    }

    /**
     * Registers an executor that can handle a set of commands.
     * @param {string} name - The name to register the executor under (e.g., "terminal").
     * @param {object} executor - The executor object, which must have a `runCommand` method.
     */
    registerExecutor(name, executor) {
        this.executors[name] = executor;
    }

    /**
     * Executes a command string by passing it to the specified executor.
     * @param {string} commandString - The command to execute.
     * @param {string} [executorName="terminal"] - The name of the executor to use.
     */
    execute(commandString, executorName = "terminal") {
        const executor = this.executors[executorName];
        if (!executor) {
            console.warn(`Executor '${executorName}' not found`);
            return;
        }
        if (typeof executor.runCommand === "function") {
            executor.runCommand(commandString);
        }
    }
}

// ---------------------
// ScriptEngine
// Runs multi-line scripts, treating lines starting with '@' as comments.
// ---------------------
/**
 * A class for executing scripts, which are arrays of command strings.
 * It's useful for automating sequences of commands.
 */
export class ScriptEngine {
    /**
     * @param {CommandHandler} commandHandler - An instance of the CommandHandler to execute commands.
     * @param {string} [defaultExecutor="terminal"] - The name of the default executor for the script's commands.
     */
    constructor(commandHandler, defaultExecutor = "terminal") {
        this.commandHandler = commandHandler;
        this.defaultExecutor = defaultExecutor;
    }

    /**
     * Executes a script line by line.
     * Lines starting with '@' are ignored as comments.
     * @param {string[]} [lines=[]] - An array of command strings to be executed.
     */
    runScript(lines = []) {
        for (const line of lines) {
            const trimmed = line.trim();

            // Lines starting with '@' are treated as comments and are not executed.
            if (trimmed.startsWith("@")) {
                // Optional: log the comment for debugging or verbose mode.
                console.log(`[Script Comment] ${trimmed}`);
                continue;
            }

            // Only execute non-empty lines.
            if (trimmed) {
                this.commandHandler.execute(trimmed, this.defaultExecutor);
            }
        }
    }
}

// --------------------->
// Addon Handling
// Provides a modular way to extend terminal functionality with games, tools, or other applications.
// --------------------->

/**
 * Base class for all terminal addons.
 * Developers should extend this class to create new addons like games or specialized tools.
 * It defines the standard interface for how the terminal interacts with an addon.
 */
export class Addon {
    /**
     * @param {string} name - The unique name of the addon.
     */
    constructor(name) {
        /** @type {string} The name of the addon. */
        this.name = name;
        /** @type {Terminal|null} A reference to the terminal instance. Null until onStart is called. */
        this.term = null;
        /** @type {VirtualOS|null} A reference to the virtual OS instance. Null until onStart is called. */
        this.vOS = null;
    }

    /**
     * Called by the AddonExecutor when the addon is started with the 'run' command.
     * This method should be used for addon initialization.
     * @param {Terminal} term - The terminal instance, for printing output.
     * @param {VirtualOS} vOS - The virtual OS instance, for interacting with the file system.
     */
    onStart(term, vOS) {
        this.term = term;
        this.vOS = vOS;
        this.term.print(`Starting addon: ${this.name}`);
        this.term.print(`Type 'exit' to stop the addon.`);
    }

    /**
     * Called by the AddonExecutor for each command entered while the addon is active.
     * This is the main entry point for addon-specific logic.
     * @param {string} input - The command string entered by the user.
     */
    onCommand(input) {
        // Default behavior: Echo the command and remind the user how to exit.
        this.term.print(`[${this.name}]> ${input}`);
        this.term.print("This addon has no custom commands. Type 'exit' to quit.");
    }

    /**
     * Called by the AddonExecutor when the addon is stopped with the 'exit' command.
     * This method should be used for cleanup.
     */
    onStop() {
        this.term.print(`Stopping addon: ${this.name}`);
    }
}

/**
 * Manages the lifecycle of addons. It handles starting, stopping,
 * and routing commands to the active addon. This acts as the "executor"
 * for any registered addon.
 */
export class AddonExecutor {
    constructor() {
        /**
         * A dictionary of all registered addons, with lowercase names as keys.
         * @type {Object.<string, Addon>}
         */
        this.addons = {};
        /**
         * The currently running addon.
         * @type {Addon|null}
         */
        this.activeAddon = null;
    }

    /**
     * Registers a new addon, making it available to be run from the terminal.
     * @param {Addon} addon - The addon instance to register. The addon's name will be used as its identifier.
     */
    registerAddon(addon) {
        this.addons[addon.name.toLowerCase()] = addon;
    }

    /**
     * Starts an addon by name.
     * @param {string} name - The name of the addon to start.
     * @param {Terminal} term - The terminal instance.
     * @param {VirtualOS} vOS - The virtual OS instance.
     */
    startAddon(name, term, vOS) {
        if (this.activeAddon) {
            term.print("An addon is already running. Please 'exit' first.");
            return;
        }

        const addon = this.addons[name.toLowerCase()];
        if (addon) {
            this.activeAddon = addon;
            addon.onStart(term, vOS);
        } else {
            term.print(`Addon not found: ${name}`);
        }
    }

    /**
     * Stops the currently active addon and releases control back to the main terminal.
     */
    stopAddon() {
        if (this.activeAddon) {
            this.activeAddon.onStop();
            this.activeAddon = null;
        }
    }

    /**
     * Forwards a command entered in the terminal to the currently active addon.
     * @param {string} input - The command string from the terminal.
     */
    handleCommand(input) {
        if (this.activeAddon) {
            // The 'exit' command is handled globally by the terminal library,
            // which will then call stopAddon(). Other commands are passed to the addon.
            this.activeAddon.onCommand(input);
        }
    }
}
