import { appendTerminalOutput, appendTerminalSymbol, frog } from './ui.js';
import { handlePwdCommand, handleCdCommand, handleLsCommand, handleCatCommand, handleTreeCommand, printTree, openCommand, playCommand, runCommand, currentDir, fileSystem } from './dir.js';
import * as r_ctrl from './games/reactor-ctrl/reactor-ctrl-module.js'; // Import reactor-ctrl module
import { runTests } from './tests.js'; // Import runTests

const commandHistory = [];
let currentGame = null;
let isDebug = false; // Variable to track debug mode state
let isDevMode = false; // Variable to track developer mode state

const debugToggleElement = document.body; // Or document.getElementById('pseudo-terminal');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired');
    const terminalInput = document.getElementById('terminal-command-input');
    const terminalOutput = document.getElementById('terminalOutput');
    const frogButton = document.getElementById('frog-button'); // Assuming the button ID is 'frog-button'

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

    if (frogButton) {
        frogButton.addEventListener('click', frog);
    }
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
        'cat': handleCatCommand,
        'history': historyCommand,
        '!': historyCommand,
        'help': handleCmdHelpCommand,
        'h': handleCmdHelpCommand,
        '?': handleCmdHelpCommand,
        'run': runCommand,
        'play': playCommand,
        'open': openCommand,
 'dev': handleDevCommand, // Developer mode toggle
 'debug': handleDebugCommand, // Debug mode toggle (requires dev mode)
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
            // Pass the command to reactorCtrlMain.js for game-specific handling
            r_ctrl.handleUserCommand(trimmedCommand);
        }
    } else {
        appendTerminalOutput(`Unknown command: ${cmdName}`);
        appendTerminalOutput("Type 'help' for a list of commands.");
    }

    updatePrompt();
}

function handleDebugCommand(args) {
    if (isDevMode) {
        // If in developer mode, call the original debug logic
        toggleDebugMode(args);
    } else {
        appendTerminalOutput("Developer mode is not active. Type 'dev' to activate.");
    }
}

function toggleDebugMode(args) {
    const argument = args[0]; // The first argument

    // Toggle the isDebug state
    isDebug = !isDebug;

    // Toggle the debug-active class for CSS styling
    debugToggleElement.classList.toggle('debug-active');

    if (isDebug) {
        // If debug mode is turning ON
        console.log('Debug mode ON.');
        appendTerminalOutput('Debug mode ON.');

        if (argument === '-V') {
            debugToggleElement.dataset.debugView = 'visible';
            console.log('Debug view: Visible UI only');
        } else if (argument === '-H') {
            debugToggleElement.dataset.debugView = 'hidden';
            console.log('Debug view: Hidden UI only');
        } else if (argument === '-A') {
            debugToggleElement.dataset.debugView = 'all';
            console.log('Debug view: All UI');
            appendTerminalOutput('Debug view: All UI');
        } else {
            // Default to -A if no valid argument provided
            debugToggleElement.dataset.debugView = 'all';
            console.log('Debug view: All UI (default)');
            appendTerminalOutput('Debug view: All UI (default)');
        }


        // Notify the current game (if any) that debug mode is active
        if (currentGame !== null) {
             console.log("Notifying game '" + currentGame + "' that debug mode is ON.");
            // Future: Call a game-specific function, e.g., handleGameDebug(true, debugToggleElement.dataset.debugView);
        }

    } else {
        // If debug mode is turning OFF
        console.log('Debug mode OFF.');
        appendTerminalOutput('Debug mode OFF.');
        // Remove the debug view data attribute
        delete debugToggleElement.dataset.debugView;

        // Notify the current game (if any) that debug mode is inactive
        if (currentGame !== null) {
             console.log("Notifying game '" + currentGame + "' that debug mode is OFF.");
            // Future: Call a game-specific function, e.g., handleGameDebug(false);
        }
    }

    // You might want to update the terminal prompt or provide other feedback
    // updatePrompt(); // If you have a function to update the prompt
}

function handleGameReactor(args) {
    if (currentGame === 'reactor') {
        appendTerminalOutput("Reactor Control is already running.");
    } else {
        currentGame = 'reactor';
        appendTerminalOutput("Launching Reactor Control...");
        r_ctrl.startReactorGame(appendTerminalOutput);
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

// Empty function for the dev command for now
function handleDevCommand() {
    isDevMode = !isDevMode;
    if (isDevMode) {
        appendTerminalOutput("Developer mode ON.");
        runTests(); // Run tests when developer mode is activated
    } else {
        appendTerminalOutput("Developer mode OFF.");
    }

}
export {
    commandHistory,
    currentGame,
    processCommand,
    handleGameReactor,
    handleCdCommand,
    handlePwdCommand,
    handleLsCommand,
    handleCatCommand,
    handleTreeCommand,
    handleDebugCommand,
    handleDevCommand,
    handleExitCommand,
    handleCmdHelpCommand,
    getDateTime,
    clearTerminal,
    echoCommand,
    catCommand,
    historyCommand,
    frog,
    openCommand,
    playCommand,
    runCommand,
    currentDir,
    fileSystem
};
