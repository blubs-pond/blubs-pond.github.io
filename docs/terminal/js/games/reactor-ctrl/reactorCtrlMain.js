// main.js
import { gameState } from './reactorCtrlGameState.js';
import { reactorCtrlProcessCommand } from './reactorCtrlCommands.js';
import { gameLoop } from './reactorCtrlGameLogic.js';
import { displayMap } from '../../ui.js';
import { locations, facilityMapString } from './reactorCtrlGameSettings.js';
function handleUserCommand(command) {
    if (!command.trim()) return; // Skip empty input
    const { locations, facilityMapString } = gameSettings;

    const parts = command.toLowerCase().split(' ');
    const cmdName = parts[0];
    const args = parts.slice(1);

    reactorCtrlProcessCommand(cmdName, ...args);

    // Clear the input field
    const commandInput = document.getElementById('terminal-command-input');
    if (commandInput) {
        commandInput.value = '';
    }

    displayMap(gameState, { locations, facilityMapString });
}

function startReactorGame(appendTerminalOutput) {
    requestAnimationFrame(gameLoop);

    appendTerminalOutput("Reactor Started in 3... 2... 1... Reactor Bolshoy Moshchnosti Kanalny at ##### Site started. Awaiting next instructions.");
    appendTerminalOutput('Reactor Control System Initiated. Type "help" for commands.');
    displayMap(gameState, { locations, facilityMapString }); // Add this line
    
}

export { handleUserCommand, startReactorGame };
