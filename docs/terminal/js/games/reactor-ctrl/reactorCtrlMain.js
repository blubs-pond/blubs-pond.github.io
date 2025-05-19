// main.js

import { reactorCtrlProcessCommand } from './reactorCtrlCommands.js';
import { appendTerminalOutput } from '../../ui.js';

// gameLoop is now inside reactorCtrlCore.js and used through reactorCtrlProcessCommand
import { gameLoop } from './reactorCtrlCore.js';  // UPDATED: from unified core file

function handleUserCommand(command) {
    if (!command.trim()) return; // Skip empty input

    const parts = command.toLowerCase().split(' ');
    const cmdName = parts[0];
    const args = parts.slice(1);

    reactorCtrlProcessCommand(cmdName, ...args);

    // Clear the input field
    const commandInput = document.getElementById('terminal-command-input');
    if (commandInput) {
        commandInput.value = '';
    }
}

function startReactorGame() {
    requestAnimationFrame(gameLoop);

    appendTerminalOutput("Reactor Started in 3... 2... 1... Reactor Bolshoy Moshchnosti Kanalny at ##### Site started. Awaiting next instructions.");
    appendTerminalOutput('Reactor Control System Initiated. Type "help" for commands.');
}

export { handleUserCommand, startReactorGame };
