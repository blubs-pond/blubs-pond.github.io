import { appendTerminalOutput } from '../../ui.js';
import {
    handleStartCommand,
    handleHelpCommand,
    handleGoCommand,
    handleLookCommand,
    handleInventoryCommand,
    handleExamineCommand,
    handlePeakCommand,
    handleCamCommand,
    handleAboutCommand,
    handleClearCommand,
    handleDisplayMap,
    handleFixCommand,
    handleRebootCommand,
    handleStatCommand,
    handleUpgradeCommand,
    handleFlushCommand,
    handleSettingsCommand,
    handleExitCommand,
    awaitingExitConfirmation, // Import the state variable
    handleExitConfirmationResponse // Import the handler
} from './reactorCtrlGameLogic.js'; 

async function reactorCtrlProcessCommand(cmdName, ...args) {
    // Map shorter aliases to handler functions
    const commandMap = {
        'start': handleStartCommand,
        'reactor-ctrl': handleStartCommand,
        'r-ctrl': handleStartCommand, // Alias
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
        'fix': handleFixCommand,
        'reboot': handleRebootCommand,
        'stat': handleStatCommand,
        'upgrade': handleUpgradeCommand,
        'flush': handleFlushCommand,
        'peak': handlePeakCommand,
        'cam': handleCamCommand,
        'about': handleAboutCommand,
        'clear': handleClearCommand,
        'cls': handleClearCommand, // Alias,
        'settings': handleSettingsCommand,
        'map': handleDisplayMap,
        'exit': handleExitCommand
        // Add other commands and their aliases here
    };

    // Check if awaiting exit confirmation
    if (awaitingExitConfirmation) {
        handleExitConfirmationResponse(cmdName);
        return;
    }

    const handler = commandMap[cmdName]; // Look up the handler using the command

    if (handler) {
        handler(args);
    } else {
        appendTerminalOutput(`Unknown command: ${cmdName}`);
    }
}

export { reactorCtrlProcessCommand };

