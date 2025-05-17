import { appendTerminalOutput } from './ui.js';
// We'll import the Reactor Control main function later
// import { startReactorGame, processReactorCommand } from './games/reactor-ctrl/reactorCtrlMain.js';

let currentGame = null; // Variable to track the currently active game

document.addEventListener('DOMContentLoaded', () => {
    const terminalInput = document.getElementById('terminal-command-input');
    const terminalOutput = document.getElementById('terminalOutput');

    terminalInput.focus();

    terminalInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();

            const command = terminalInput.value.trim();
            terminalInput.value = '';

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

    if (currentGame === 'reactor') {
        // If a game is active, send the command to the game's processor
        if (command.toLowerCase() === 'exit') {
            currentGame = null; // Exit the game
            appendTerminalOutput("Exited Reactor Control.");
            appendTerminalOutput("Type 'help' for a list of commands.");
        } else {
            // Placeholder: Call the actual Reactor Control command processor here
            appendTerminalOutput("Reactor Control command received: " + command); // Temporary message
            // processReactorCommand(command); // This will be the actual call
        }
    } else {
        // If no game is active, check for main terminal commands
        switch (command.toLowerCase()) {
            case 'help':
                displayHelp(); // Display main terminal help
                break;
            case 'reactor':
                currentGame = 'reactor';
                appendTerminalOutput("Launching Reactor Control...");
                // Placeholder: Call the actual Reactor Control game start function here
                appendTerminalOutput("Reactor Control launched."); // Temporary message
                // startReactorGame(); // This will be the actual call
                break;
            default:
                appendTerminalOutput(`Unknown command: ${command}`);
                appendTerminalOutput("Type 'help' for a list of commands.");
        }
    }
}

function displayHelp() {
    appendTerminalOutput("Available commands:");
    appendTerminalOutput("- help: Display this help message");
    appendTerminalOutput("- reactor: Launch the Reactor Control game");
    // Add other main terminal commands here later
}
