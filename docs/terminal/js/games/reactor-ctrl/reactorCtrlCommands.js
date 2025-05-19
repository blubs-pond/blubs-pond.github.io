import { appendTerminalOutput } from '../../ui.js';
import {
    gameLoop,
    getPhaseForTime,
    updateGameState,
    updateGame,
    updateReactorTemp,
    updateVentilation,
    updateGeneratorOil,
    updateReactorPowerOutput,
    updateControlArchives,
    checkSanityEffects,
    checkWinLoseConditions,
    parseMapString,
    getUserFriendlyLocationName,
    showFacilityStatus,
    showPlayerStatus,
    showSectorStatus,
    showRoomStatus,
    handleToggleSetting,
    capitalize,
    handleGo,
    handleHelp,
    handleExit,
    handleExitConfirmationResponse,
    handleSettings,
    handleLook,
    handleInventory,
    handleExamine,
    handleReboot,
    handleStat,
    handleUpgrade,
    handleFlush,
    handleDisplayMap,
    handleCam,
    handleStart,
    handlePeak,
    handleAbout,
    handleClear,
    setPumpSpeed,
    restartCore,
    checkHideMonster,
    checkLookAtShadow,
    rebootCamera,
    fixReactorComponent
} from './reactorCtrlGameLogic.js';
import { gameState } from './reactorCtrlGameState.js';
import { gameSettings } from './reactorCtrlGameSettings.js';

let awaitingExitConfirmation = false;

async function reactorCtrlProcessCommand(cmdName, ...args) {
    const commandMap = {
        'start': () => handleStart(gameLoop, appendTerminalOutput),
        'reactor-ctrl': () => handleStart(gameLoop, appendTerminalOutput),
        'r-ctrl': () => handleStart(gameLoop, appendTerminalOutput),
        'go': () => handleGo(args, gameState, gameSettings, appendTerminalOutput),
        'g': () => handleGo(args, gameState, gameSettings, appendTerminalOutput),
        'look': () => handleLook(args, appendTerminalOutput),
        'l': () => handleLook(args, appendTerminalOutput),
        'inventory': () => handleInventory(appendTerminalOutput),
        'inv': () => handleInventory(appendTerminalOutput),
        'examine': () => handleExamine(args, appendTerminalOutput),
        'exam': () => handleExamine(args, appendTerminalOutput),
        'help': () => handleHelp(appendTerminalOutput),
        'h': () => handleHelp(appendTerminalOutput),
        'fix': () => fixReactorComponent(args, appendTerminalOutput, gameState),
        'reboot': () => handleReboot(appendTerminalOutput),
        'stat': () => handleStat(appendTerminalOutput, gameState, showFacilityStatus, getUserFriendlyLocationName, showPlayerStatus, showSectorStatus, showRoomStatus, capitalize, gameSettings),
        'upgrade': () => handleUpgrade(appendTerminalOutput),
        'flush': () => handleFlush(appendTerminalOutput),
        'peak': () => handlePeak(appendTerminalOutput),
        'cam': () => handleCam(appendTerminalOutput),
        'about': () => handleAbout(appendTerminalOutput),
        'map': () => handleDisplayMap(appendTerminalOutput),
        'exit': () => handleExit(appendTerminalOutput, awaitingExitConfirmation),
        'settings': () => handleSettings(args, appendTerminalOutput, gameState, handleToggleSetting),
        'pump': () => setPumpSpeed(args[0], appendTerminalOutput, gameState),
        'restart': () => restartCore(appendTerminalOutput, gameState),
        'hide': () => checkHideMonster(appendTerminalOutput, gameState),
        'shadow': () => checkLookAtShadow(args[0], appendTerminalOutput, gameState, gameSettings),
        'camera': () => rebootCamera(args[0], appendTerminalOutput, gameState)
    };

    if (awaitingExitConfirmation) {
        handleExitConfirmationResponse(cmdName);
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