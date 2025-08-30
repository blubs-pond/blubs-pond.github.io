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

// ---------------------
// Command Class
// Represents a terminal command, stores its name, description, execution logic, and aliases
// ---------------------
export class Command {
    constructor(name, description, executeFunc, aliases = []) {
        this.name = name;
        this.description = description;
        this.execute = executeFunc;
        this.aliases = aliases;
    }
}

// ---------------------
// Terminal Class
// Handles terminal output rendering and session variables
// ---------------------
export class Terminal {
    constructor(name, containerDiv) {
        this.name = name;
        this.containerDiv = containerDiv;
        this.history = [];
        this.variables = {};
    }

    print(message) {
        this.containerDiv.innerText += message + "\n";
        this.containerDiv.scrollTop = this.containerDiv.scrollHeight;
        this.history.push(message);
        console.log(`[DEBUG][${this.name}] ${message}`);
    }
}

// ---------------------
// VirtualOS Class
// Simulates filesystem, environment variables, aliases, current working directory, and sudo
// ---------------------
export class VirtualOS {
    constructor() {
        this.files = { "/": {} };
        this.cwd = "/";
        this.env = { "HOME": "/home/user" };
        this.aliases = {};
        this.sudoEnabled = true;
    }

    // Environment methods
    setEnv(key, value) { this.env[key] = value; }
    getEnv(key) { return this.env[key]; }

    // Alias methods
    createAlias(alias, command) { this.aliases[alias] = command; }
    resolveAlias(commandName) { return this.aliases[commandName] || commandName; }

    // Sudo simulation
    canSudo() { return this.sudoEnabled; }

    // Filesystem methods
    _resolvePath(path) {
        if (path.startsWith("/")) return path;
        return this.cwd + (this.cwd.endsWith("/") ? "" : "/") + path;
    }

    createFile(path, content = "") {
        path = this._resolvePath(path);
        this.files[path] = content;
    }

    readFile(path) {
        path = this._resolvePath(path);
        return this.files[path] || null;
    }

    deleteFile(path) {
        path = this._resolvePath(path);
        delete this.files[path];
    }

    listFiles(path = null) {
        path = path ? this._resolvePath(path) : this.cwd;
        const list = [];
        for (let f in this.files) {
            if (f.startsWith(path)) {
                let relative = f.replace(path, "");
                if (relative) list.push(relative);
            }
        }
        return list;
    }

    changeDir(path) {
        path = this._resolvePath(path);
        this.cwd = path.endsWith("/") ? path : path + "/";
    }
}

// ---------------------
// TerminalLib Class
// High-level terminal API
// Stores commands as Command objects and executes BASH-style input with piping & redirection
// ---------------------
export class TerminalLib {
    constructor(terminalInstance, vOS) {
        this.term = terminalInstance;
        this.vOS = vOS;
        this.commands = {};
        this._registerDefaultCommands();
    }

    addCommand(command) {
        this.commands[command.name] = command;
        for (let alias of command.aliases) {
            this.commands[alias] = command;
        }
    }

    _registerDefaultCommands() {
        this.addCommand(new Command("pwd","Print current working directory", () => this.term.print(this.vOS.cwd)));
        this.addCommand(new Command("ls","List files in current directory", () => this.term.print(this.vOS.listFiles().join("\n"))));
        this.addCommand(new Command("cd","Change directory", (args)=> {if(args[0]) this.vOS.changeDir(args[0]); this.term.print(`Current directory: ${this.vOS.cwd}`);}));
        this.addCommand(new Command("touch","Create an empty file", (args)=> {if(args[0]) this.vOS.createFile(args[0]); this.term.print(`Created file: ${args[0]}`);}));
        this.addCommand(new Command("cat","Display file contents", (args)=> {if(args[0]) this.term.print(this.vOS.readFile(args[0]) || "File not found");}));
        this.addCommand(new Command("rm","Delete a file", (args)=> {if(args[0]) this.vOS.deleteFile(args[0]); this.term.print(`Deleted: ${args[0]}`);}));
        this.addCommand(new Command("echo","Print text", (args)=> this.term.print(args.join(" "))));
        this.addCommand(new Command("mkdir","Create a directory (simulated)", (args)=> {if(args[0]) this.vOS.createFile(args[0]+"/"); this.term.print(`Directory created: ${args[0]}`)}));
        this.addCommand(new Command("clear","Clear terminal output", ()=> this.term.containerDiv.innerText=""));
        this.addCommand(new Command("help","List available commands and descriptions", ()=> {
            for (let cmdName in this.commands){
                const cmd = this.commands[cmdName];
                this.term.print(`${cmd.name} - ${cmd.description}`);
            }
        }));
    }

    // --- Public method to run a command string ---
    runCommand(input) {
        input = input.trim();
        if (!input) return;

        // Handle sudo
        let sudo = false;
        if(input.startsWith("sudo ")) {
            sudo = true;
            input = input.slice(5).trim();
            if(!this.vOS.canSudo()) {
                this.term.print("sudo: permission denied (simulated)");
                return;
            }
        }

        // --- Handle Piping ---
        let pipeParts = input.split("|").map(p => p.trim());
        if(pipeParts.length > 1){
            let pipeOutput = "";
            for(let i=0; i<pipeParts.length; i++){
                pipeOutput = this._executeCommand(pipeParts[i], pipeOutput);
            }
            return;
        }

        // --- No pipe, execute normally ---
        this._executeCommand(input);
    }

    // --- Helper: executes a single command with optional input data (for piping) ---
    _executeCommand(input, inputData="") {
        // Check for redirection
        let redirect = null;
        let filename = null;
        let match = input.match(/(.*?)(\s*(>|>>)\s*(\S+))$/);
        if(match){
            input = match[1].trim();
            redirect = match[3];
            filename = match[4];
        }

        // Parse command and arguments
        const parts = input.match(/(?:[^\s"]+|"[^"]*")+/g).map(a => a.replace(/"/g,""));
        const cmdName = parts[0];
        const args = parts.slice(1);

        // Add inputData as first argument if piping
        if(inputData !== "") args.unshift(inputData);

        const resolvedCmd = this.vOS.resolveAlias(cmdName);
        const command = this.commands[resolvedCmd];

        let output = "";

        if(command){
            const originalPrint = this.term.print.bind(this.term);
            this.term.print = (msg)=>{
                output += msg + "\n";
                originalPrint(msg);
            };
            command.execute(args);
            this.term.print = originalPrint;
        } else {
            this.term.print(`Command not recognized: ${cmdName}`);
        }

        // Handle redirection
        if(redirect && filename){
            if(redirect === ">") this.vOS.createFile(filename, output);
            if(redirect === ">>"){
                let prev = this.vOS.readFile(filename) || "";
                this.vOS.createFile(filename, prev + output);
            }
        }

        return output.trim();
    }
}

// ---------------------
// CommandHandler
// Routes commands to executors (terminal, game, addons)
// ---------------------
export class CommandHandler {
    constructor(vOS=null){
        this.executors = {};
        this.vOS = vOS;
    }

    registerExecutor(name, executor){ this.executors[name] = executor; }

    execute(commandString, executorName="terminal"){
        const executor = this.executors[executorName];
        if(!executor) return console.warn(`Executor '${executorName}' not found`);
        if(typeof executor.runCommand === "function") executor.runCommand(commandString);
    }
}

// ---------------------
// ScriptEngine
// Runs multi-line scripts with optional @tags
// ---------------------
export class ScriptEngine {
    constructor(commandHandler, defaultExecutor="terminal"){
        this.commandHandler = commandHandler;
        this.defaultExecutor = defaultExecutor;
    }

    runScript(lines=[]){
        for(const line of lines){
            const trimmed = line.trim();
            if(trimmed.startsWith("@")){
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
    constructor(gameState={}){ this.state = gameState; }

    runCommand(cmd, ...args){
        console.log(`[GAME] ${cmd}`, args);
        switch(cmd.toLowerCase()){
            case "move": this.state.playerPosition = args; break;
            case "attack": console.log(`Player attacks ${args[0]}`); break;
            default: console.log(`Unknown game command: ${cmd}`);
        }
    }
}
