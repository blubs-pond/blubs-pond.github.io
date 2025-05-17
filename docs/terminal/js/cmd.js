import { appendTerminalOutput } from './ui.js';
// We'll import the Reactor Control main function later
import { startReactorGame, handleUserCommand } from './games/reactor-ctrl/reactorCtrlMain.js';

const commandHistory = []; // Array to store command history
let currentGame = null; // Variable to track the currently active game
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired');
    const terminalInput = document.getElementById('terminal-command-input');
    const terminalOutput = document.getElementById('terminalOutput');

    terminalInput.focus();

    terminalInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();

            const command = terminalInput.value.trim();terminalInput.value = '';

            commandHistory.push(command); // Add the command to history
            if (command) {
                processCommand(command);
            }
        }
    });

    appendTerminalOutput("Welcome to the Blubs-Pond Terminal!");
    appendTerminalOutput("Type 'help' for a list of commands.");
});

function processCommand(command) {
    appendTerminalOutput(`> ${command}`); // Display the command the user entered

    let cmdName;
    let args = [];

    const trimmedCommand = command.trim();

    if (trimmedCommand.startsWith('!')) {
        const historyIndex = parseInt(trimmedCommand.substring(1), 10) - 1;
        if (!isNaN(historyIndex) && historyIndex >= 0 && historyIndex < commandHistory.length) {
            const commandToRun = commandHistory[historyIndex];
            // Remove the recursive call and just set cmdName and args here
            const parts = commandToRun.trim().toLowerCase().split(' ');
             // We need to explicitly set cmdName and args for the history command handler
            cmdName = '!';
            args = [historyIndex + 1]; // Pass the original history number as an argument
            appendTerminalOutput(`Running command from history: ${commandToRun}`);
            processCommand(commandToRun); // Recursively call processCommand with the history command
            return; // Stop processing the current command
        } else {
            appendTerminalOutput("Invalid history index.");
            return; // Stop processing if history index is invalid
        }
    } else {
        const parts = trimmedCommand.toLowerCase().split(' ');
        cmdName = parts[0];
        args = parts.slice(1);
    }

    const commandMap = {
        'reactor-ctrl': handleGameReactor,
        'r-ctrl': handleGameReactor, // Alias
        'reactor': handleGameReactor, //Alias
        'date': getDateTime, 
        'time': getDateTime, //Alias
        'ls': dirHandlerCmd,
        'cd': dirHandlerCmd, //Alias
        'pwd': dirHandlerCmd, //Alias
        'clear': clearTerminal,
        'cls': clearTerminal, //Alias
        'echo': echoCommand,
        'cat': catCommand,
        'history': historyCommand,
        '!': historyCommand,
        'help': handleCmdHelpCommand,
        'h': handleCmdHelpCommand, // Alias
        '?':handleCmdHelpCommand, //Alias
        // Add other commands and their aliases here
    };

    const handler = commandMap[cmdName];

    if (handler && currentGame === null) {
        handler(args);
    } else {
        switch (currentGame) {
            case 'reactor':
                handleGameReactor(args);
                break;
            default: // aka null
                appendTerminalOutput(`Unknown command: ${cmdName}`);
                appendTerminalOutput("Type 'help' for a list of commands.");
                break;
        }
    }
}

function handleGameReactor(args) {
    if (currentGame === 'reactor' && (arg === 'reactor-ctrl' || 'r-ctrl' || 'reactor')) {
        appendTerminalOutput("Reactor Control is already running.");
    } else if (currentGame === 'reactor' && (arg !== 'reactor-ctrl' || 'r-ctrl' || 'reactor')) {// If a game is active, send the command to the game's processor
        if (command.toLowerCase() === 'exit') {
            currentGame = null; // Exit the game
            appendTerminalOutput("Exited Reactor Control.");
            appendTerminalOutput("Type 'help' for a list of commands.");
        } else {
            // Placeholder: Call the actual Reactor Control command processor here
            // appendTerminalOutput("Reactor Control command received: " + command); // Temporary message
            handleUserCommand(command); // This will be the actual call
        }
    } else {
        currentGame = 'reactor';
        appendTerminalOutput("Launching Reactor Control...");
        // Placeholder: Call the actual Reactor Control game start function here
        // appendTerminalOutput("Reactor Control launched."); // Temporary message
        startReactorGame(); // This will be the actual call
    }
}

function handleCmdHelpCommand() {
    const commandMap = {
        'reactor-ctrl': 'Launches the Reactor Control game.',
        'date': 'Displays the current date and time.', 
        'clear': 'Clears the terminal output.',
        'echo': 'Echoes the provided arguments.',
        'history': 'Shows the command history. You can also re-run a command by typing \'!\' followed by the history number.',
        'help': 'Displays a list of available commands.',
    };
    appendTerminalOutput("Available commands:");
    Object.keys(commandMap).forEach(command => {
        appendTerminalOutput(`- ${command}: ${commandMap[command]}`);
    });
}

function getDateTime() {
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();
    appendTerminalOutput(`Date: ${date}`);
    appendTerminalOutput(`Time: ${time}`);
}

function clearTerminal() {
    const terminalOutput = document.getElementById('terminalOutput');
    terminalOutput.innerHTML = '';
}

function dirHandlerCmd() {
    appendTerminalOutput('YOU DO NOT HAVE PERMISION TO DO SO YET');
}

function echoCommand(args) {
    appendTerminalOutput(args.join(' '));
}

function catCommand(args) {
    appendTerminalOutput('YOU DO NOT HAVE PERMISION TO DO SO YET')
}

function historyCommand(args) {
    if (args && args.length > 0 && !isNaN(args[0])) {
        const index = parseInt(args[0], 10) - 1;
        if (index >= 0 && index < commandHistory.length) {
            const commandToRun = commandHistory[index];
            appendTerminalOutput(`Running command from history: ${commandToRun}`);
            processCommand(commandToRun); // Re-process the command from history
            return; // Exit the function after processing the history command
        } else {
            appendTerminalOutput("Invalid history index.");
            return; // Exit the function if the index is invalid
        }
    }
    appendTerminalOutput("Command History:");
    commandHistory.forEach((cmd, index) => {
        appendTerminalOutput(`${index + 1}: ${cmd}`);
    });
}
export { commandHistory, currentGame, processCommand, handleGameReactor, handleCmdHelpCommand, getDateTime, clearTerminal, dirHandlerCmd, echoCommand, catCommand, historyCommand };