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
    handleFlushCommand
} from './reactorCtrlGameLogic.js';

async function reactorCtrlProcessCommand(cmdName, ...args) {
    // Map shorter aliases to handler functions
    const commandMap = {
        'start': handleStartCommand,
        'reactor-ctrl': handleStartCommand,
        'r-ctrl': handleStartCommand, // Alias
        'go': handleGoCommand,
        'look': handleLookCommand,
        'inventory': handleInventoryCommand,
        'inv': handleInventoryCommand, // Alias
        'examine': handleExamineCommand,
        'help': handleHelpCommand,
        'fix': handleFixCommand,
        'reboot': handleRebootCommand,
        'stat': handleStatCommand,
        'upgrade': handleUpgradeCommand,
        'flush': handleFlushCommand,
        'peak': handlePeakCommand,
        'cam': handleCamCommand,
        'about': handleAboutCommand,
        'clear': handleClearCommand,
        'cls': handleClearCommand, // Alias
        'map': handleDisplayMap
        // Add other commands and their aliases here
    };

    const handler = commandMap[cmdName]; // Look up the handler using the command

    if (handler) {
        handler(args);
    } else {
        appendTerminalOutput(`Unknown command: ${cmdName}`);
    }
}

export { reactorCtrlProcessCommand };

