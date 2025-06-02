import { appendTerminalOutput, displayMap } from "../../terminal/js/ui.js";
import { gameState } from "./reactorCtrlGameState.js"; // Import gameState
import * as GameLogic from "./reactorCtrlGameLogic.js";
import * as GameSettings from "./reactorCtrlGameSettings.js";

// === Command Registry ===
const commandRegistry = {
    go: GameLogic.handleGo,
    g: GameLogic.handleGo,
    look: GameLogic.handleLook,
    l: GameLogic.handleLook,
    inventory: GameLogic.handleInventory,
    inv: GameLogic.handleInventory,
    examine: GameLogic.handleExamine,
    exam: GameLogic.handleExamine,
    help: GameLogic.handleHelp,
    h: GameLogic.handleHelp,
    fix: GameLogic.fixReactorComponent,
    reboot: GameLogic.handleReboot,
    stat: GameLogic.handleStat,
    upgrade: GameLogic.handleUpgrade,
    flush: GameLogic.handleFlush,
    peak: GameLogic.handlePeak,
    cam: GameLogic.handleCam,
    about: GameLogic.handleAbout,
    map: GameLogic.handleDisplayMap,
    settings: GameLogic.handleSettings,
    pump: GameLogic.setPumpSpeed,
    restart: GameLogic.restartCore,
    hide: GameLogic.checkHideMonster,
    shadow: GameLogic.checkLookAtShadow,
    camera: GameLogic.rebootCamera
};

async function reactorCtrlProcessCommand(commandString) {
    // Parse the command string
    const trimmedCommand = commandString.trim();
    const parts = trimmedCommand.match(/(?:[^\\s"]|"[^"]*")+/g) || [];
    const cmdName = parts[0]?.toLowerCase();
    const args = parts.slice(1).map((arg) => arg.replace(/^"|"$/g, ""));

    // Handle exit confirmation separately
    if (gameState.awaitingExitConfirmation) {
        GameLogic.handleExitConfirmationResponse(commandString);
        return;
    }

    if (cmdName === "start" || cmdName === "s") {
        appendTerminalOutput("Launching Reactor Control...");
        gameState.currentScene = "game";
        gameState.lastUpdateTime = Date.now(); // Initialize last update time
        appendTerminalOutput(
            "Reactor Started in 3... 2... 1... Reactor Bolshoy Moshchnosti Kanalny at #### Site started. Awaiting next instructions."
        ); // Example flavor text
        appendTerminalOutput("Reactor Control System Initiated. Type 'help' for commands.");
        GameLogic.gameLoop(); // Start the game loop
        displayMap(gameState, { locations: GameSettings.locations, facilityMapString: GameSettings.facilityMapString }); // Display initial map
        return; // Exit the function after handling the start command
    }

    const handler = commandRegistry[cmdName];

    if (handler) {
        // Call the handler with arguments
        handler(...args);
    } else {
        appendTerminalOutput(`Unknown game command: ${cmdName}`);
    }
}

export { reactorCtrlProcessCommand };