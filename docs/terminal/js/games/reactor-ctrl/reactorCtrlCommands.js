import { appendTerminalOutput } from '../../ui.js';
import {
    handleGoCommand,
    handleLookCommand,
    handleInventoryCommand,
    handleExamineCommand,
    handleHelpCommand
} from './reactorCtrlGameLogic.js';

async function processCommand(command, ...args) {
    appendTerminalOutput(`> ${command}`); // Echo command

    const [command, ...args] = commandInput.trim().toLowerCase().split(' '); // Split command and arguments

    // Map shorter aliases to handler functions
    const commandMap = {
        'go': handleGoCommand,
        'g': handleGoCommand, // Alias
        'look': handleLookCommand,
        'l': handleLookCommand, // Alias
        'inventory': handleInventoryCommand,
        'inv': handleInventoryCommand, // Alias
        'examine': handleExamineCommand,
        'exam': handleExamineCommand, // Alias
        'help': handleHelpCommand,
        'h': handleHelpCommand, // Alias
        // Add other commands and their aliases here
    };

    const handler = commandMap[command]; // Look up the handler using the command

    if (handler) {
        handler(args);
    } else {
        appendTerminalOutput(`Unknown command: ${command}`);
    }
}

export { processCommand };

