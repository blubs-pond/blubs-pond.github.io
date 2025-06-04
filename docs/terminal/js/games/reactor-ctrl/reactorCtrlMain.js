// main.js
import { gameState } from './reactorCtrlGameState.js';
import { reactorCtrlProcessCommand } from './reactorCtrlCommands.js';
import { gameLoop } from './reactorCtrlGameLogic.js';
import { displayMap } from '../../ui.js';
import { locations, facilityMapString } from './reactorCtrlGameSettings.js';
import * as GameLogic from "./reactorCtrlGameLogic.js";
import * as GameSettings from "./reactorCtrlGameSettings.js";
import { appendTerminalOutput } from '../../ui.js';

/**
 * Handles user commands entered in the terminal.
 * @param {string} command The command string entered by the user.
 */
function handleUserCommand(command) {
    if (!command.trim()) return; // Skip empty input

    const parts = command.toLowerCase().split(' ');
    const cmdName = parts[0];
    const args = parts.slice(1);

    reactorCtrlProcessCommand(cmdName, ...args);

    // Clear the input field
    clearCommandInput();

    // Update the map display
    displayMap(gameState, { locations, facilityMapString });
}

/**
 * Clears the terminal command input field.
 */
function clearCommandInput() {
    const commandInput = document.getElementById('terminal-command-input');
    if (commandInput) {
        commandInput.value = '';
    }
}

/**
 * Starts the reactor control game.
 * @param {function} appendTerminalOutput Function to append output to the terminal.
 */
function startReactorGame(appendTerminalOutput) {
    requestAnimationFrame(gameLoop);

    appendTerminalOutput("Reactor Started in 3... 2... 1... Reactor Bolshoy Moshchnosti Kanalny at ##### Site started. Awaiting next instructions.");
    appendTerminalOutput('Reactor Control System Initiated. Type "help" for commands.');

    // Display the initial map
    displayMap(gameState, { locations, facilityMapString });
}

function startGame() {
    appendTerminalOutput("Launching Reactor Control...");
    gameState.currentScene = "game";
    gameState.lastUpdateTime = Date.now(); // Initialize last update time
    appendTerminalOutput(
        "Reactor Started in 3... 2... 1... Reactor Bolshoy Moshchnosti Kanalny at #### Site started. Awaiting next instructions."
    ); // Example flavor text
    appendTerminalOutput("Reactor Control System Initiated. Type 'help' for commands.");
    GameLogic.gameLoop(); // Start the game loop
    displayMap(gameState, { locations: GameSettings.locations, facilityMapString: GameSettings.facilityMapString }); // Display initial map
}

export { handleUserCommand, startReactorGame, startGame };