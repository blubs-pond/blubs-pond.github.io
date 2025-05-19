// reactorCtrlCommands.js
import { appendTerminalOutput } from '../../ui.js';
import * as core from './reactorCtrlCore.js';

let awaitingExitConfirmation = false;

async function reactorCtrlProcessCommand(cmdName, ...args) {
    const commandMap = {
        'start': () => core.handleStart(core.gameLoop, appendTerminalOutput),
        'reactor-ctrl': () => core.handleStart(core.gameLoop, appendTerminalOutput),
        'r-ctrl': () => core.handleStart(core.gameLoop, appendTerminalOutput),

        'go': () => core.handleGo(args, core.gameState, core.gameSettings, appendTerminalOutput),
        'g': () => core.handleGo(args, core.gameState, core.gameSettings, appendTerminalOutput),

        'look': () => core.handleLook(args, appendTerminalOutput),
        'l': () => core.handleLook(args, appendTerminalOutput),

        'inventory': () => core.handleInventory(appendTerminalOutput),
        'inv': () => core.handleInventory(appendTerminalOutput),

        'examine': () => core.handleExamine(args, appendTerminalOutput),
        'exam': () => core.handleExamine(args, appendTerminalOutput),

        'help': () => core.handleHelp(appendTerminalOutput),
        'h': () => core.handleHelp(appendTerminalOutput),

        'fix': () => core.fixReactorComponent(args, appendTerminalOutput, core.gameState),
        'reboot': () => core.handleReboot(appendTerminalOutput),
        'stat': () => core.handleStat(
            appendTerminalOutput,
            core.gameState,
            core.showFacilityStatus,
            core.getUserFriendlyLocationName,
            core.showPlayerStatus,
            core.showSectorStatus,
            core.showRoomStatus,
            core.capitalize,
            core.gameSettings
        ),

        'upgrade': () => core.handleUpgrade(appendTerminalOutput),
        'flush': () => core.handleFlush(appendTerminalOutput),
        'peak': () => core.handlePeak(appendTerminalOutput),
        'cam': () => core.handleCam(appendTerminalOutput),
        'about': () => core.handleAbout(appendTerminalOutput),
        'map': () => core.handleDisplayMap(appendTerminalOutput),

        'exit': () => core.handleExit(appendTerminalOutput, awaitingExitConfirmation),
        'settings': () => core.handleSettings(args, appendTerminalOutput, core.gameState, core.handleToggleSetting),

        'pump': () => core.setPumpSpeed(args[0], appendTerminalOutput, core.gameState),
        'restart': () => core.restartCore(appendTerminalOutput, core.gameState),

        'hide': () => core.checkHideMonster(appendTerminalOutput, core.gameState),
        'shadow': () => core.checkLookAtShadow(args[0], appendTerminalOutput, core.gameState, core.gameSettings),
        'camera': () => core.rebootCamera(args[0], appendTerminalOutput, core.gameState),
    };

    if (awaitingExitConfirmation) {
        core.handleExitConfirmationResponse(cmdName);
        return;
    }

    const handler = commandMap[cmdName];

    if (handler) {
        handler();
    } else {
        appendTerminalOutput(`Unknown command: ${cmdName}`);
    }
}

export { reactorCtrlProcessCommand };
