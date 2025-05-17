import { processCommand } from './reactorCtrlCommands.js'; // Corrected import path
import { gameLoop } from './reactorCtrlGameLogic.js'; // gameLoop is also in gameLogic.js
import { appendTerminalOutput } from '../../ui.js'; // Make sure appendTerminalOutput is imported

function handleUserCommand(command, ...arg) {
    if (!command) {
        // appendTerminalOutput(''); // Or provide a different message for empty input if desired
        return; // Skip empty input but don't add to output
    }
    processCommand(command);
    // Clear the input field
    const commandInput = document.getElementById('command-input');
    if (commandInput) {
        commandInput.value = '';
    }
}

function startReactorGame() {
    // Start the game loop
    requestAnimationFrame(gameLoop);

    // Initial message to the user
    appendTerminalOutput("Reactor Started in 3... 2... 1... Reactor Bolshoy Moshchnosti Kanalny at ##### Site started awaited next instructions.");
    appendTerminalOutput('Reactor Control System Initiated. Type "help" for commands.'); // Initial prompt
}

export { handleUserCommand, startReactorGame };