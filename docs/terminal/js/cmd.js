import { appendTerminalOutput, appendTerminalSymbol } from './ui.js';
import { startReactorGame, handleUserCommand } from './games/reactor-ctrl/reactorCtrlMain.js';
import {
    handlePwdCommand,
    handleCdCommand,
    handleLsCommand,
    handleCatCommand,
    handleTreeCommand,
    printTree,
    openCommand,
    playCommand,
    runCommand,
    currentDir,
    fileSystem
} from './dir.js';

const commandHistory = [];
let currentGame = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired');
    const terminalInput = document.getElementById('terminal-command-input');
    const terminalOutput = document.getElementById('terminalOutput');

    terminalInput.focus();

    terminalInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            const command = terminalInput.value.trim();
            terminalInput.value = '';
            updatePrompt(); // Display initial prompt

            if (command) {
                commandHistory.push(command);
                processCommand(command);
            }
        }
    });

    appendTerminalOutput("Welcome to the Blubs-Pond Terminal!");
    appendTerminalOutput("Type 'help' for a list of commands.");
    updatePrompt(); // Display initial prompt
});

function updatePrompt() {
    // const terminalSymbol = document.getElementById('terminal-prompt-symbol');
    // terminalSymbol.placeholder = `${currentDir.path}>`; // Update placeholder with current path
    appendTerminalSymbol(`${currentDir.path}>`);
}

function processCommand(command) {
    appendTerminalOutput(`${currentDir.path}> ${command}`);

    const trimmedCommand = command.trim();

    // Handle history shortcut (!number)
    if (trimmedCommand.startsWith('!')) {
        const historyIndex = parseInt(trimmedCommand.substring(1), 10) - 1;
        if (!isNaN(historyIndex) && historyIndex >= 0 && historyIndex < commandHistory.length) {
            const commandToRun = commandHistory[historyIndex];
            appendTerminalOutput(`Running command from history: ${commandToRun}`);
            processCommand(commandToRun);
            return;
        } else {
            appendTerminalOutput("Invalid history index.");
            return;
        }
    }

    // ✅ Smart argument parsing that supports quoted strings
    const parts = trimmedCommand.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
    const cmdName = parts[0]?.toLowerCase();
    const args = parts.slice(1).map(arg => arg.replace(/^"|"$/g, ''));

    // appendTerminalOutput(`cmdName = ${cmdName}`);
    // appendTerminalOutput(`args = ${args}`);

    const commandMap = {
        'reactor-ctrl': handleGameReactor,
        'r-ctrl': handleGameReactor,
        'reactor': handleGameReactor,
        'date': getDateTime,
        'time': getDateTime,
        'ls': handleLsCommand,
        'tree': handleTreeCommand,
        'cd': handleCdCommand,
        'pwd': handlePwdCommand,
        'clear': clearTerminal,
        'cls': clearTerminal,
        'echo': echoCommand,
        'cat': catCommand,
        'history': historyCommand,
        '!': historyCommand,
        'help': handleCmdHelpCommand,
        'h': handleCmdHelpCommand,
        '?': handleCmdHelpCommand,
        'run': runCommand,
        'play': playCommand,
        'open': openCommand,
        'exit': handleExitCommand
    };

    const handler = commandMap[cmdName];

    if (handler && currentGame === null) {
        handler(args);
    } else if (currentGame === 'reactor') {
        if (trimmedCommand.toLowerCase() === 'exit') {
            currentGame = null;
            appendTerminalOutput("Exited Reactor Control.");
            appendTerminalOutput("Type 'help' for a list of commands.");
        } else {
            handleUserCommand(trimmedCommand);
        }
    } else {
        appendTerminalOutput(`Unknown command: ${cmdName}`);
        appendTerminalOutput("Type 'help' for a list of commands.");
    }

    updatePrompt();
}

function handleGameReactor(args) {
    if (currentGame === 'reactor') {
        appendTerminalOutput("Reactor Control is already running.");
    } else {
        currentGame = 'reactor';
        appendTerminalOutput("Launching Reactor Control...");
        startReactorGame();
    }
}

function handleCmdHelpCommand() {
    const commandDescriptions = {
        'reactor-ctrl': 'Launches the Reactor Control game.',
        'date': 'Displays the current date and time.',
        'clear': 'Clears the terminal output.',
        'echo': 'Echoes the provided arguments.',
        'history': 'Shows the command history. Use !<number> to rerun a command.',
        'help': 'Displays this list of commands.',
        'exit': 'return to home page'
    };
    appendTerminalOutput("Available commands:");
    Object.keys(commandDescriptions).forEach(command => {
        appendTerminalOutput(`- ${command}: ${commandDescriptions[command]}`);
    });
}

function handleExitCommand() {
    appendTerminalOutput("Exiting terminal...");
    window.location.href = '/index.html'; // Open index.html in the current tab
}

function getDateTime() {
    const now = new Date();
    appendTerminalOutput(`Date: ${now.toLocaleDateString()}`);
    appendTerminalOutput(`Time: ${now.toLocaleTimeString()}`);
}

function clearTerminal() {
    const terminalOutput = document.getElementById('terminalOutput');
    terminalOutput.innerHTML = '';
}

function echoCommand(args) {
    appendTerminalOutput(args.join(' '));
}

function catCommand() {
    appendTerminalOutput('YOU DO NOT HAVE PERMISSION TO DO SO YET');
}

function historyCommand(args) {
    if (args && args.length > 0 && !isNaN(args[0])) {
        const index = parseInt(args[0], 10) - 1;
        if (index >= 0 && index < commandHistory.length) {
            const commandToRun = commandHistory[index];
            appendTerminalOutput(`Running command from history: ${commandToRun}`);
            processCommand(commandToRun);
            return;
        } else {
            appendTerminalOutput("Invalid history index.");
            return;
        }
    }

    appendTerminalOutput("Command History:");
    commandHistory.forEach((cmd, index) => {
        appendTerminalOutput(`${index + 1}: ${cmd}`);
    });
}

export {
    commandHistory,
    currentGame,
    processCommand,
    handleGameReactor,
    handleCmdHelpCommand,
    getDateTime,
    clearTerminal,
    echoCommand,
    catCommand,
    historyCommand
};
