import { appendTerminalOutput, displayMap } from '../../terminal/js/ui.js';
import { gameState } from './reactorCtrlGameState.js'; // Import gameState
import {
    handleGo,
    handleLook,
    handleInventory,
    handleExamine,
    handleHelp,
    fixReactorComponent,
    handleReboot,
    handleStat,
    handleUpgrade,
    handleFlush,
    handlePeak,
    handleCam,
    handleAbout,
    handleDisplayMap,
    handleExit,
    handleExitConfirmationResponse,
    handleSettings,
    setPumpSpeed,
    restartCore,
    checkHideMonster,
    checkLookAtShadow,
    rebootCamera,
    showFacilityStatus,
    getUserFriendlyLocationName,
    showPlayerStatus,
    showSectorStatus,
    showRoomStatus,
    capitalize, // This seems unused here, maybe remove?

    flushVentilation,
    gameLoop,
    handleToggleSetting
} from './reactorCtrlGameLogic.js'; // Import handlers from game logic
import {
    createCamera,
    createDoor,
    createLocation,
    markerToLocationKey,
    locationKeyToMarker,
    adjacencyMatrix, // This seems unused here, maybe remove?

    locations,
    facilityMapString
  } from './reactorCtrlGameSettings.js';

async function reactorCtrlProcessCommand(commandString) {
    // Parse the command string
    const trimmedCommand = commandString.trim();
    const parts = trimmedCommand.match(/(?:[^\\s"]|"[^"]*")+/g) || [];
    const cmdName = parts[0]?.toLowerCase();
    const args = parts.slice(1).map(arg => arg.replace(/^"|"$/g, ''));

    // Define the command map
    const commandMap = {
        'go': () => handleGo(args[0]), // Assuming handleGo takes direction as argument
        'g': () => handleGo(args[0]),
        'look': () => handleLook(), // Assuming handleLook takes no arguments
        'l': () => handleLook(),
        'inventory': () => handleInventory(), // Assuming handleInventory takes no arguments
        'inv': () => handleInventory(),
        'examine': () => handleExamine(args[0]), // Assuming handleExamine takes object name as argument
        'exam': () => handleExamine(args[0]),
        'help': () => handleHelp(appendTerminalOutput), // Assuming handleHelp takes appendTerminalOutput
        'h': () => handleHelp(appendTerminalOutput),
        'fix': () => fixReactorComponent(args[0]), // Assuming fixReactorComponent takes component name
        'reboot': () => handleReboot(args[0]), // Assuming handleReboot takes component name
        'stat': () => handleStat(args[0]), // Assuming handleStat takes category
        'upgrade': () => handleUpgrade(args[0]), // Assuming handleUpgrade takes component name
        'flush': () => handleFlush(args[0]), // Assuming handleFlush takes system name
        'peak': () => handlePeak(), // Assuming handlePeak takes no arguments
        'cam': () => handleCam(args[0]), // Assuming handleCam takes camera number
        'about': () => handleAbout(), // Assuming handleAbout takes no arguments
        'map': () => handleDisplayMap(), // Assuming handleDisplayMap takes no arguments
        'settings': () => handleSettings(args[0]), // Assuming handleSettings takes setting name
        'pump': () => setPumpSpeed(args[0]), // Assuming setPumpSpeed takes speed
        'restart': () => restartCore(), // Assuming restartCore takes no arguments
        'hide': () => checkHideMonster(), // Assuming checkHideMonster takes no arguments
        'shadow': () => checkLookAtShadow(args[0]), // Assuming checkLookAtShadow takes location
        'camera': () => rebootCamera(args[0]), // Assuming rebootCamera takes camera number

        // Add other command mappings as needed
    };

    // Handle exit confirmation separately
    if (gameState.awaitingExitConfirmation) {
        handleExitConfirmationResponse(commandString);
        return;
    }

    // Handle 'start' command specifically to initialize the game
    if (cmdName === 'start' || cmdName === 's') {
        appendTerminalOutput("Launching Reactor Control...");
        gameState.currentScene = 'game';
        gameState.lastUpdateTime = Date.now(); // Initialize last update time
        appendTerminalOutput("Reactor Started in 3... 2... 1... Reactor Bolshoy Moshchnosti Kanalny at #### Site started. Awaiting next instructions."); // Example flavor text
        appendTerminalOutput("Reactor Control System Initiated. Type 'help' for commands.");
        gameLoop(); // Start the game loop
        displayMap(gameState, { locations, facilityMapString: gameSettings.facilityMapString }); // Display initial map
        return; // Exit the function after handling the start command
    }

    const handler = commandMap[cmdName];

    if (handler) {
        handler();
    } else {
        appendTerminalOutput(`Unknown game command: ${cmdName}`);
    }
}

export { reactorCtrlProcessCommand };
