import { gameState } from './reactorCtrlGameState.js';
import { gameSettings } from './reactorCtrlGameSettings.js';
import { getUserFriendlyLocationName } from './reactorCtrlGameSettings.js'; // Import for stat command
import { appendTerminalOutput } from '../../ui.js';

let lastUpdateTime = 0;
let gameTimeInMinutesReal = 0; // Initialize gameTimeInMinutesReal here
let currentPhase = "survival"; // Initial phase

let awaitingExitConfirmation = false;
function gameLoop(timestamp) {
    if (!lastUpdateTime) lastUpdateTime = timestamp;
    const dt = (timestamp - lastUpdateTime) / 1000; // Time delta in seconds
    lastUpdateTime = timestamp;

    // Update game state and mechanics
    updateGameState(dt);
    updateGame(); // A function to contain other periodic updates
    updateReactorTemp(dt);
    updateReactorPowerOutput();
    updateControlArchives(dt);
    updateVentilation(dt); // Added ventilation update
    updateGeneratorOil(dt); // Added generator oil update


    // Continue the game loop if the game is not over
    if (!gameState.game_over) {
        requestAnimationFrame(gameLoop);
    }
}

function updateGameState(dt) {
    const realLifeMinutesElapsed = dt / 60.0;
    gameTimeInMinutesReal += realLifeMinutesReal;

    // Calculate in-game time (assuming 48 real minutes = 1 in-game day = 1440 in-game minutes)
    const totalInGameMinutes = (gameTimeInMinutesReal / 48.0) * 1440;
    const hours = Math.floor((totalInGameMinutes / 60) % 24);
    const minutes = Math.floor(totalInGameMinutes % 60);

    gameState.gameTime.hours = hours;
    gameState.gameTime.minutes = minutes;

    // Determine phase based on in-game hours
    const newPhase = getPhaseForTime(hours);
    if (newPhase !== currentPhase) { // Use the module-level currentPhase
        currentPhase = newPhase;
        handlePhaseTransition(newPhase);
    }
}

// Helper function to determine the game phase based on in-game hours
function getPhaseForTime(hours) {
    if (hours >= 6 && hours < 13) return "fixing"; // Example phases - adjust as needed
    if (hours >= 13) return "rest_payment";
    return "survival"; // Default phase
}

// Handles the transition between game phases
function handlePhaseTransition(phase) {
    appendTerminalOutput(`--- Phase changed: ${phase.toUpperCase()} ---`);
    // TODO: Trigger phase-specific setup like monster spawns, system changes, etc.
    // This is where you would add logic that happens ONLY when a phase changes.
}


// A function to contain other periodic updates that don't depend directly on dt in a complex way
function updateGame() {
    // This function can call other update functions that manage things like monster movement, sanity, etc.
    handleMonsterMovement();
    checkSanityEffects();
    checkWinLoseConditions();
}


function updateReactorTemp(dt) {
    // TODO: Implement reactor temperature logic
    // Factors to consider: base increase rate, cooling from pumps, effects of broken panels, meltdown threshold.
}

function updateVentilation(dt) {
    // TODO: Implement ventilation logic
    // Factors to consider: blockage increase, flushing, impact on sanity/health.
}

function updateGeneratorOil(dt) {
    // TODO: Implement generator oil logic
    // Factors to consider: consumption rate when reactor is off, oil leaks, running out of oil.
}

function updateReactorPowerOutput() {
    // TODO: Implement power output logic
    // Factors to consider: reactor temperature, pressure, core active status.
}

function updateControlArchives(dt) {
    // TODO: Implement Control Archives logic
    // Factors to consider: panel status (working, broken, rebooting), chance of breaking, reboot progress.
}

function handleMonsterMovement() {
    // TODO: Implement monster movement logic
    // Factors to consider: monster type, current phase, player location, visibility.
}

function checkSanityEffects() {
    // TODO: Implement sanity effects
    // Factors to consider: sanity level, events, monster encounters, environmental factors.
}

function checkWinLoseConditions() {
    // TODO: Implement win/lose conditions
    // Factors to consider: reactor meltdown, player death, completing objectives, time limits.
}

// This function parses the map string into a 2D array (matrix)
function parseMapString(mapString) {
    const lines = mapString.trim().split('\n');
    const matrix = lines.map(line => line.split(''));
    return matrix;
}


// function to handle the 'go' command
function handleGoCommand(args) {
    const direction = args[0]; // Get the direction (e.g., 'north', 'east')

    if (!direction) {
        appendTerminalOutput("Go where? You need to specify a direction (e.g., g n).");
        return;
    }

    // You might want to also handle direction aliases (n, s, e, w) here
    const directionMap = {
        'north': 'north', 'n': 'north',
        'south': 'south', 's': 'south',
        'east': 'east', 'e': 'east',
        'west': 'west', 'w': 'west',
        // Add other directions if needed
    };

    const fullDirection = directionMap[direction.toLowerCase()];

    if (!fullDirection) {
         appendTerminalOutput(`Invalid direction: ${direction}. Use north, south, east, or west (or n, s, e, w).`);
         return;
    }


    const currentLocationKey = gameState.player.location;
    const currentLocation = gameSettings.locations[currentLocationKey];

    if (!currentLocation) {
        appendTerminalOutput("Error: Your current location is not defined in gameSettings.locations.");
        console.error("Invalid player location key:", currentLocationKey);
        return;
    }

    const exits = currentLocation.exits;

    // Check if the direction is a valid exit
    if (exits && exits[fullDirection]) {
        const nextLocationKey = exits[fullDirection];
        const nextLocation = gameSettings.locations[nextLocationKey];

        if (nextLocation) {
            gameState.player.location = nextLocationKey; // Update player's location
            appendTerminalOutput(`You go ${fullDirection} to the ${nextLocation.friendlyName}.`);
            // You might want to add a function here to display the description of the new location
        } else {
            appendTerminalOutput(`Error: The exit to ${nextLocationKey} is defined but the location is not found.`);
            console.error("Invalid next location key in exits:", nextLocationKey);
        }
    } else {
        appendTerminalOutput(`You cannot go ${fullDirection} from here.`);
        // You might want to list the available exits here
    }
}

// function to handle the 'help' command with shorter aliases
function handleHelpCommand() {
    const commandDescriptions = {
        'go / g [direction]': 'Move in a specified direction (e.g., g n).',
        'look / l': 'Look around your current location.',
        'inventory / inv': 'Check your inventory.',
        'examine / exam [object]': 'Examine an object in your location or inventory.',
        'help / h': 'Displays this help message.',
        'map': 'Displays the game map.',
        'fix [component]': 'Attempts to fix a broken component.',
        'reboot [component]': 'Attempts to reboot a system component.',
        'stat [category]': 'Displays game statistics (e.g., player, reactor, inventory).',
        'upgrade [component]': 'Attempts to upgrade a component.',
        'flush [system]': 'Attempts to flush a system (e.g., ventilation).',
        'clear': 'Clears the terminal output.',
        // Add other commands and their descriptions here
    };
    appendTerminalOutput("Available commands:");
    Object.keys(commandDescriptions).forEach(command => {
        appendTerminalOutput(`- ${command}: ${commandDescriptions[command]}`);
    });
}

// Function to handle the 'exit' command
function handleExitCommand(args) {
 // The confirmation logic is now handled by the main terminal's input
 // We set a state variable to indicate we're awaiting confirmation
 awaitingExitConfirmation = true;
 appendTerminalOutput("Are you sure you want to exit? (yes/no)");
}

// Function to handle the response to the exit confirmation
function handleExitConfirmationResponse(response) {
    const lowerResponse = response.toLowerCase().trim();
    if (lowerResponse === 'yes' || lowerResponse === 'y') {
        exitGame(); // Call the actual exit function
    } else {
        appendTerminalOutput("Exit cancelled.");
    }
}

// Placeholder function for the 'settings' command
function handleSettingsCommand(args) {
    const subcommand = args[0]?.toLowerCase();

    switch (subcommand) {
        case 'show':
            appendTerminalOutput("--- Current Settings ---");
            appendTerminalOutput(`Sound: ${gameState.settings.sound ? 'on' : 'off'}`);
            appendTerminalOutput(`Music: ${gameState.settings.music ? 'on' : 'off'}`);
            appendTerminalOutput("-----------------------");
            break;
 case 'sound':
 handleToggleSetting(args[1], 'sound', 'Sound');
 break;
 case 'music':
 handleToggleSetting(args[1], 'music', 'Music');
 break;
 default:
 appendTerminalOutput("Usage: settings [show | sound [on/off] | music [on/off]]");
    }
}
// Placeholder function for the 'look' command
function handleLookCommand(args) {
    // TODO: Implement logic to display current location description and items/features
    if (args.length > 0) {
        appendTerminalOutput("You can just 'look' (l) to look around.");
    } else {
        appendTerminalOutput("You look around. (Location description and details will go here)");
        // In the future, get the description from gameSettings.locations[gameState.player.location].description
        // and list items or features in the location.
    }
}

// Placeholder function for the 'inventory' command
function handleInventoryCommand() {
    // TODO: Implement logic to list player's inventory
    appendTerminalOutput("You check your inventory. (Inventory items will be listed here)");
    // In the future, iterate through gameState.player.inventory and list items.
}

// Placeholder function for the 'examine' command
function handleExamineCommand(args) {
    // TODO: Implement logic to examine a specific object
    if (args.length > 0) {
        const objectToExamine = args.join(' '); // Join arguments to handle multi-word objects
        appendTerminalOutput(`You examine the ${objectToExamine}. (Details about the object will appear here)`);
        // In the future, check if the object is in the current location or inventory
        // and display its description.
    } else {
        appendTerminalOutput("Examine what? You need to specify an object to examine (e.g., exam key).");
    }
}

function handleRebootCommand(args) {
 // TODO: Implement rebooting actions
 if (gameState.caPanelStatus === 'broken') {
 appendTerminalOutput("The control panels in the Control Archives are not working. You cannot issue commands to other rooms.");
 return;
 }
 appendTerminalOutput("Attempting to reboot...");
}

function handleStatCommand(args) {
 const target = args[0]?.toLowerCase();
 const validSectors = ['reactor', 'lab', 'utility', 'hallway']; // Assuming these are the sectors

 if (!target || target === 'all') {
 showFacilityStatus();
    } else if (target === 'player' || target === '@') {
 showPlayerStatus();
    } else if (validSectors.includes(target)) {
 showSectorStatus(target);
    } else {
 showRoomStatus(target);
    }
}

function showFacilityStatus() {
 appendTerminalOutput("--- Facility Status Summary ---");
    appendTerminalOutput(`Reactor Status: ${gameState.core_active ? 'Active' : 'Inactive'}`);
    appendTerminalOutput(`Reactor Temp: ${gameState.reactor_temp.toFixed(1)} C`);
    appendTerminalOutput(`Reactor Power: ${gameState.reactor_power_output.toFixed(1)} MW`);
    appendTerminalOutput("--- Inventory ---");
        for (const item in gameState.inventory) {
            appendTerminalOutput(`${capitalize(item)}: ${gameState.inventory[item]}`);
        }
    appendTerminalOutput("-------------------------------");
}

function showPlayerStatus() {
    appendTerminalOutput("--- Player Status ---");
    appendTerminalOutput(`Current Location: ${getUserFriendlyLocationName(gameState.player.location)}`);
    appendTerminalOutput(`Player State: ${gameState.playerState}`);
    appendTerminalOutput(`Time: ${gameState.gameTime.hours.toString().padStart(2, '0')}:${gameState.gameTime.minutes.toString().padStart(2, '0')}`); // Using new gameTime structure
    appendTerminalOutput(`Money: $${gameState.playerMoney.toFixed(2)}`);
    appendTerminalOutput("---------------------");
}

function showSectorStatus(target) {
    appendTerminalOutput(`--- ${capitalize(target)} Sector Status ---`);
    // TODO: Implement sector-specific status outputs based on game state
    // You'll need to define what information is available for each sector.
    appendTerminalOutput("Sector status not fully implemented yet.");
    appendTerminalOutput("----------------------------");
}

function showRoomStatus(target) {
 const roomCode = target.toUpperCase();
    const room = gameSettings.locations[roomCode];
    if (room) {
    appendTerminalOutput(`--- ${room.friendlyName} Status ---`);
            appendTerminalOutput(room.description);
    appendTerminalOutput(`Exits: ${Object.keys(room.exits).join(', ')}`);
        } else {
    appendTerminalOutput(`Invalid room code: ${target}`);
    }
}

function handleUpgradeCommand(args) {
 // TODO: Implement upgrading actions
 if (gameState.caPanelStatus === 'broken') {
 appendTerminalOutput("The control panels in the Control Archives are not working. You cannot issue commands to other rooms.");
 return;
 }
 appendTerminalOutput("Attempting to upgrade...");
}

function handleFlushCommand(args) {
    // TODO: Implement flushing actions
    if (gameState.caPanelStatus === 'broken') {
        appendTerminalOutput("The control panels in the Control Archives are not working. You cannot issue commands to other rooms.");
        return;
    }
    if (args[0]?.toLowerCase() === 'vent') {
        // Call a dedicated function for flushing vents if needed
        appendTerminalOutput("Flushing ventilation system...");
    } else {
    appendTerminalOutput("Attempting to flush...");
    }
}

function handleFixCommand(args) {
 // TODO: Implement fixing actions
 appendTerminalOutput("Attempting to fix...");
}

// Function to handle the 'displaymap' command
function handleDisplayMap() {
    // TODO: Implement displaying the game map
    appendTerminalOutput("Displaying map...");
}

function handleCamCommand(args) {
    const cameraNumber = args[0];
    if (gameState.caPanelStatus === 'broken') {
        appendTerminalOutput("The control panels in the Control Archives are not working. You cannot issue commands to other rooms.");
        return;
    }
    if (cameraNumber) {
        // TODO: Implement camera view logic
        appendTerminalOutput(`Viewing camera ${cameraNumber}... (Camera view will be displayed here)`);
    } else {
        appendTerminalOutput("Specify camera number (e.g., cam 1).");
    }
}

function handleStartCommand() {
    appendTerminalOutput("Starting the game...");
    requestAnimationFrame(gameLoop);
}

function handlePeakCommand() {
    if (gameState.isHiding) {
        appendTerminalOutput("You cautiously peek from your hiding spot.");
        // TODO: Implement peek logic, e.g., brief view of the location, chance to spot monster
    } else {
        appendTerminalOutput("You are not hiding.");
    }
}

function handleAboutCommand() {
    appendTerminalOutput("Reactor Control Terminal - Version 0.1");
    appendTerminalOutput("Developed by [Your Name/Team Name]");
    appendTerminalOutput("A text-based survival game.");
}

// Helper function to handle toggling settings
function handleToggleSetting(value, settingKey, settingName) {
    if (value === 'on') {
        gameState.settings[settingKey] = true;
        appendTerminalOutput(`${settingName} turned on.`);
    } else if (value === 'off') {
        gameState.settings[settingKey] = false;
        appendTerminalOutput(`${settingName} turned off.`);
    } else {
        appendTerminalOutput(`Usage: settings ${settingKey} [on/off]`);
    }
}

function capitalize(string) {
 return string.charAt(0).toUpperCase() + string.slice(1);
}

// Function to handle the 'clear' command
function handleClearCommand() {
    // TODO: Implement clearing the terminal output
    appendTerminalOutput("Terminal cleared.");
}

export {
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
    handleMonsterMovement,
    handleStartCommand,
    handleHelpCommand,
    handlePhaseTransition,
    handleGoCommand,
    handleLookCommand,
    handleInventoryCommand,
    handleExamineCommand,
    handlePeakCommand,
    handleCamCommand,
    handleAboutCommand,
    handleClearCommand,
    handleExitCommand, // Added exit command handler
    awaitingExitConfirmation,
    handleSettingsCommand, // Added settings command handler
    handleExitConfirmationResponse,
    handleDisplayMap,
    handleFixCommand,
    handleRebootCommand,
    handleStatCommand,
    showFacilityStatus, // Exporting helper functions for stat
    showPlayerStatus,
    showSectorStatus,
    showRoomStatus,
    handleUpgradeCommand,
    handleFlushCommand
};