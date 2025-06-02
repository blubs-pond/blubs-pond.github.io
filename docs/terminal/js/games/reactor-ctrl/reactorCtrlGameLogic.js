// ==========================================================================
// 1. IMPORTS & INITIAL SETUP
// ==========================================================================
import { gameState } from './reactorCtrlGameState.js';
import {
    facilityMapString,
    locations,
    oil_consumption_rate,
    oil_leak_multiplier,
    shadowLookSanityDrain,
    soundEnabled,
    musicEnabled
} from './reactorCtrlGameSettings.js';
import { appendTerminalOutput, displayMap, updateGameUI } from '../../terminal/js/ui.js';

/**
 * @module GameLogic
 * This module contains the core game logic for the Reactor Control game.
 */

/**
 * Settings object to store game settings.
 * @type {Object}
 */
let settings = {};

/**
 * Last update time.
 * @type {number}
 */
let lastUpdateTime = 0;

/**
 * Real time passed in minutes.
 * @type {number}
 */
let gameTimeInMinutesReal = 0;

/**
 * Current game phase.
 * @type {string}
 */
let currentPhase = "survival";

/**
 * Flag to track if the game is awaiting exit confirmation.
 * @type {boolean}
 */
let awaitingExitConfirmation = false;

/**
 * Initializes game settings.
 */
function initializeSettings() {
    settings.soundEnabled = soundEnabled;
    settings.musicEnabled = musicEnabled;
    updateGameUI('reactor-ctrl'); // Show game UI elements
}

// ==========================================================================
// 2. MAIN GAME LOOP & CORE TIME/PHASE MANAGEMENT
// ==========================================================================

/**
 * Main game loop.
 * @param {number} timestamp - The timestamp of the current frame.
 */
function gameLoop(timestamp) {
    if (!lastUpdateTime) lastUpdateTime = timestamp;
    let dt = (timestamp - lastUpdateTime) / 1000;
    lastUpdateTime = timestamp;

    // UI Updates / Display
    displayGameStatus();
    displayMap(gameState, { locations, facilityMapString });

    // Core Game State Updates
    updateGameState(dt); // Handles game time and phase
    updateGame();        // Handles monsters, player stats, win/loss conditions (does not take dt)

    // Specific System Updates
    updateReactorTemp(dt);
    updateReactorPowerOutput(); // Does not take dt
    updateControlArchives(dt);
    updateVentilation(dt);
    updateGeneratorOil(dt);

    if (!gameState.game_over) {
        requestAnimationFrame(gameLoop);
    }
}

/**
 * Updates the game state.
 * @param {number} dt - The time elapsed since the last update.
 */
function updateGameState(dt) {
    const realLifeMinutesElapsed = dt / 60.0;
    gameTimeInMinutesReal += realLifeMinutesElapsed;

    const totalInGameMinutes = (gameTimeInMinutesReal / 48.0) * 1440;
    const hours = Math.floor((totalInGameMinutes / 60) % 24);
    const minutes = Math.floor(totalInGameMinutes % 60);

    gameState.gameTime.hours = hours;
    gameState.gameTime.minutes = minutes;

    const newPhase = getPhaseForTime(hours);
    if (newPhase !== currentPhase) {
        currentPhase = newPhase;
        handlePhaseTransition(newPhase);
    }
}

/**
 * Gets the game phase for a given hour.
 * @param {number} hours - The hour of the day.
 * @returns {string} - The game phase.
 */
function getPhaseForTime(hours) {
    if (hours >= 6 && hours < 13) return "fixing";
    if (hours >= 13) return "survival";
    return "rest_payment";
}

/**
 * Handles a phase transition.
 * @param {string} phase - The new game phase.
 */
function handlePhaseTransition(phase) {
    appendTerminalOutput(`--- Phase changed: ${phase.toUpperCase()} ---`);
    // TODO: Trigger phase-specific setup like monster spawns, system changes, etc. (Comment from original)
}

// ==========================================================================
// 3. CORE GAME STATE UPDATES (Called from Game Loop or other updates)
// ==========================================================================

// --- 3.1 Reactor Systems ---

/**
 * Updates the reactor temperature.
 * @param {number} dt - The time elapsed since the last update.
 */
function updateReactorTemp(dt) {
    if (!gameState.core_active) return;

    let tempIncreaseRate = gameState.temp_increase_rate;

    if (gameState.caPanelStatus === 'broken') {
        tempIncreaseRate += calculateCriticalTempIncreaseRate();
    }

    gameState.reactorState.reactor_temp += tempIncreaseRate * dt;

    const coolingEffect = gameState.pump_speed * gameState.temp_cool_rate_multiplier;
    gameState.reactorState.reactor_temp -= coolingEffect * dt;

    if (gameState.reactorState.reactor_temp > gameState.temp_meltdown_threshold) {
        appendTerminalOutput("Meltdown imminent!");
        gameState.game_over = true;
    }
}

/**
 * Updates the reactor power output.
 */
function updateReactorPowerOutput() {
    // Placeholder logic
    gameState.reactorState.reactor_power_output = gameState.reactorState.reactor_temp * 0.5;
}

/**
 * Updates the control archives.
 * @param {number} dt - The time elapsed since the last update.
 */
function updateControlArchives(dt) {
    if (gameState.rebootAllCaCooldown > 0) {
        gameState.rebootAllCaCooldown = Math.max(0, gameState.rebootAllCaCooldown - dt);
    }
}

/**
 * Calculates the critical temperature increase rate.
 * @returns {number} - The critical temperature increase rate.
 */
function calculateCriticalTempIncreaseRate() {
    return gameState.criticalReactorTempIncreaseRate;
}

// --- 3.2 Facility Systems ---

/**
 * Updates the ventilation system.
 * @param {number} dt - The time elapsed since the last update.
 */
function updateVentilation(dt) {
    if (gameState.ventilationStatus === 'blocked') {
        gameState.ventilationBlockedTimer += dt;
        if (gameState.ventilationBlockedTimer >= 60) {
            appendTerminalOutput("Ventilation systems are critically blocked!");
            // Additional effects can be added here
        }
    }
}

/**
 * Updates the generator oil level.
 * @param {number} dt - The time elapsed since the last update.
 */
function updateGeneratorOil(dt) {
    if (gameState.generatorState.fuel > 0) {
        gameState.generatorState.fuel -= oil_consumption_rate * dt;

        if (Math.random() < oil_leak_multiplier * dt) {
            gameState.backup_generator_oil = Math.max(0, gameState.backup_generator_oil - 0.1);
            appendTerminalOutput("Oil leak detected in the generator room!");
        }
    } else {
        appendTerminalOutput("Generator out of fuel!");
    }
}

// --- 3.3 Player, World State & Monsters (Logic from original updateGame function) ---

/**
 * Updates the game world.
 */
function updateGame() {
    handleMonsters();
    checkSanityEffects();
    checkWinLoseConditions();
}

// ==========================================================================
// Monster Handle
// ==========================================================================

/**
 * Handles monster actions.
 */
function handleMonsters() {
    for (const monsterName in gameState.monsters) {
        const monster = gameState.monsters[monsterName];
        updateMonsterState(monster);
        handleMonsterAction(monster);
    }
}

/**
 * Updates the state of a monster.
 * @param {Object} monster - The monster object.
 */
function updateMonsterState(monster) {
    // Placeholder logic
    if (monster.state === "dormant" && Math.random() < 0.01) {
        monster.state = "active";
        appendTerminalOutput(`${monsterName} is now active.`);
    }
}

/**
 * Handles the action of a monster.
 * @param {Object} monster - The monster object.
 */
function handleMonsterAction(monster) {
    // Placeholder logic
    if (monster.isHostile && monster.state === "active") {
        // Example: Monster attacks the player
        // gameState.player.hp -= 10;
        appendTerminalOutput(`${monsterName} attacks!`);
    }
}

/**
 * Moves a monster.
 * @param {Object} monster - The monster object.
 */
function maybeMoveMonster(monster) {
    // Placeholder logic
    const currentLocation = monster.location;
    if (!currentLocation) return;

    const possibleExits = Object.keys(locations[currentLocation].exits);
    if (possibleExits.length === 0) return;

    const newLocation = possibleExits[Math.floor(Math.random() * possibleExits.length)];
    monster.location = newLocation;
    appendTerminalOutput(`${monsterName} moved from ${currentLocation} to ${newLocation}.`);
}

// --- 3.4 Condition Checking (Sanity, Win/Loss) ---

/**
 * Checks for sanity effects.
 */
function checkSanityEffects() {
    if (gameState.player.location === "Vent" && Math.random() < 0.1) {
        gameState.player.stats.sanity -= 1;
        appendTerminalOutput("The darkness of the vents is unsettling...");
    }
}

/**
 * Checks for win/lose conditions.
 */
function checkWinLoseConditions() {
    if (gameState.player.stats.sanity <= 0) {
        appendTerminalOutput("You have lost your mind...");
        gameState.game_over = true;
    }

    if (gameState.reactorState.stability >= 100) {
        appendTerminalOutput("Reactor stability reached 100%. You win!");
        gameState.game_over = true;
    }
}

// ==========================================================================
// 4. PLAYER COMMAND HANDLERS & ACTIONS
// ==========================================================================

// --- 4.1 Navigation & Observation ---

/**
 * Handles the "go" command.
 * @param {string} direction - The direction to go.
 */
function handleGo(direction) {
    const currentLocation = gameState.player.location;
    if (!locations[currentLocation].exits[direction]) {
        appendTerminalOutput("You cannot go that way.");
        return;
    }

    gameState.player.location = direction;
    appendTerminalOutput(`You go to the ${getUserFriendlyLocationName(direction)}.`);
    handleLook(); // Automatically look after moving
}

/**
 * Handles the "look" command.
 */
function handleLook() {
    const currentLocation = gameState.player.location;
    const location = locations[currentLocation];
    appendTerminalOutput(`You are in the ${location.friendlyName}.`);
    appendTerminalOutput(location.description);

    // Display exits
    const exits = Object.keys(location.exits);
    if (exits.length > 0) {
        appendTerminalOutput("Exits:");
        exits.forEach(exit => {
            appendTerminalOutput(`- ${getUserFriendlyLocationName(exit)}`);
        });
    } else {
        appendTerminalOutput("There are no obvious exits.");
    }
}

/**
 * Handles the "display map" command.
 */
function handleDisplayMap() {
    displayMap(gameState, { locations, facilityMapString });
}
// console.log("displayMap(gameState, { locations, facilityMapString });") // Original console.log, preserved

/**
 * Handles the "examine" command.
 * @param {string} objectName - The name of the object to examine.
 */
function handleExamine(objectName) {
    // Placeholder logic
    appendTerminalOutput(`You examine the ${objectName}. It seems to be important.`);
}

// --- 4.2 Player Status & Inventory ---

/**
 * Handles the "inventory" command.
 */
function handleInventory() {
    if (gameState.player.inventory.length === 0) {
        appendTerminalOutput("You are carrying nothing.");
        return;
    }

    appendTerminalOutput("You are carrying:");
    gameState.player.inventory.forEach(item => {
        appendTerminalOutput(`- ${item}`);
    });
}

/**
 * Handles the "stat" command.
 * @param {string} category - The category of stat to display.
 */
function handleStat(category) {
    switch (category) {
        case "sanity":
            appendTerminalOutput(`Sanity: ${gameState.player.stats.sanity}`);
            break;
        case "hunger":
            appendTerminalOutput(`Hunger: ${gameState.player.stats.hunger}`);
            break;
        case "insomnia":
            appendTerminalOutput(`Insomnia: ${gameState.player.stats.insomnia}`);
            break;
        default:
            appendTerminalOutput("Available stats: sanity, hunger, insomnia");
    }
}

// --- 4.3 Reactor & Facility Interaction ---

/**
 * Sets the pump speed.
 * @param {string} speed - The pump speed to set.
 */
function setPumpSpeed(speed) {
    const parsedSpeed = parseInt(speed);
    if (isNaN(parsedSpeed) || parsedSpeed < 0 || parsedSpeed > 100) {
        appendTerminalOutput("Invalid pump speed. Must be between 0 and 100.");
        return;
    }

    gameState.pump_speed = parsedSpeed;
    appendTerminalOutput(`Pump speed set to ${parsedSpeed}.`);
}

/**
 * Restarts the core.
 */
function restartCore() {
    // Placeholder logic
    appendTerminalOutput("Restarting the core...");
}

/**
 * Fixes a reactor component.
 * @param {string} component - The component to fix.
 */
function fixReactorComponent(component) {
    // Placeholder logic
    appendTerminalOutput(`Attempting to fix the ${component}...`);
}

/**
 * Reboots a reactor component.
 * @param {string} component - The component to reboot.
 */
function rebootReactorComponent(component) {
    // Placeholder logic
    appendTerminalOutput(`Attempting to reboot the ${component}...`);
}

/**
 * Reboots a CA panel.
 * @param {string} roomCode - The room code of the CA panel to reboot.
 */
function rebootCaPanel(roomCode) {
    // Placeholder logic
    appendTerminalOutput(`Attempting to reboot the CA panel in ${roomCode}...`);
}

/**
 * Overclocks a reactor component.
 * @param {string} component - The component to overclock.
 */
function overclockReactorComponent(component) {
    // Placeholder logic
    appendTerminalOutput(`Attempting to overclock the ${component}...`);
}

/**
 * Upgrades a reactor component.
 * @param {string} component - The component to upgrade.
 */
function upgradeReactorComponent(component) {
    // Placeholder logic
    appendTerminalOutput(`Attempting to upgrade the ${component}...`);
}

/**
 * Flushes the ventilation system.
 */
function flushVentilation() {
    // Placeholder logic
    appendTerminalOutput("Flushing the ventilation system...");
}

/**
 * Handles the "flush" command.
 * @param {string} systemName - The name of the system to flush.
 */
function handleFlush(systemName) {
    // Placeholder logic
    appendTerminalOutput(`Flushing the ${systemName}...`);
}

/**
 * Reboots a camera.
 * @param {string} cameraNumber - The number of the camera to reboot.
 */
function rebootCamera(cameraNumber) {
    // Placeholder logic
    appendTerminalOutput(`Rebooting camera ${cameraNumber}...`);
}

/**
 * Handles the "cam" command.
 * @param {string} cameraNumber - The number of the camera to view.
 */
function handleCam(cameraNumber) {
    // Placeholder logic
    appendTerminalOutput(`Viewing camera ${cameraNumber}...`);
}

/**
 * Handles the "reboot" command.
 * @param {string} component - The component to reboot.
 */
function handleReboot(component) {
    // Placeholder logic
    appendTerminalOutput(`Rebooting ${component}...`);
}

// --- 4.4 Special Player Actions & Checks ---

/**
 * Checks for hiding from a monster.
 */
function checkHideMonster() {
    // Placeholder logic
    appendTerminalOutput("Attempting to hide from the monster...");
}

/**
 * Checks for looking at the Shadow.
 * @param {string} locationViewed - The location being viewed.
 */
function checkLookAtShadow(locationViewed) {
    // Placeholder logic
    appendTerminalOutput(`You look towards the ${locationViewed}...`);
}

// --- 4.5 Game Management & Meta Commands ---

/**
 * Handles the "help" command.
 */
function handleHelp() {
    appendTerminalOutput("Available commands:");
    appendTerminalOutput("- go [direction]");
    appendTerminalOutput("- look");
    appendTerminalOutput("- inventory");
    appendTerminalOutput("- examine [object]");
    appendTerminalOutput("- stat [sanity|hunger|insomnia]");
    appendTerminalOutput("- pump [0-100]");
    appendTerminalOutput("- restart");
    appendTerminalOutput("- fix [component]");
    appendTerminalOutput("- reboot [component]");
    appendTerminalOutput("- flush [system]");
    appendTerminalOutput("- cam [camera number]");
    appendTerminalOutput("- help");
    appendTerminalOutput("- about");
    appendTerminalOutput("- exit");
}

/**
 * Handles the "settings" command.
 */
function handleSettings() {
    appendTerminalOutput("Settings:");
    appendTerminalOutput(`- Sound: ${settings.soundEnabled ? "On" : "Off"}`);
    appendTerminalOutput(`- Music: ${settings.musicEnabled ? "On" : "Off"}`);
}

/**
 * Handles toggling a setting.
 * @param {string} settingName - The name of the setting to toggle.
 */
function handleToggleSetting(settingName) {
    if (settingName === "sound") {
        settings.soundEnabled = !settings.soundEnabled;
        appendTerminalOutput(`Sound is now ${settings.soundEnabled ? "On" : "Off"}`);
    } else if (settingName === "music") {
        settings.musicEnabled = !settings.musicEnabled;
        appendTerminalOutput(`Music is now ${settings.musicEnabled ? "On" : "Off"}`);
    } else {
        appendTerminalOutput("Invalid setting. Available settings: sound, music");
    }
}

/**
 * Handles the "clear" command.
 */
function handleClear() {
    // Placeholder logic
    appendTerminalOutput("Clearing the terminal...");
}

/**
 * Handles the "about" command.
 */
function handleAbout() {
    appendTerminalOutput("Reactor Control: A text-based adventure game.");
    appendTerminalOutput("Created by GitHub Copilot.");
}

/**
 * Handles the "start" command.
 */
function handleStart() {
    // Placeholder logic
    appendTerminalOutput("Starting the game...");
}

/**
 * Handles the "peak" command.
 */
function handlePeak() {
    // Placeholder logic
    appendTerminalOutput("Peeking...");
}

/**
 * Handles the "exit" command.
 */
function handleExit() {
    if (gameState.awaitingExitConfirmation) {
        appendTerminalOutput("Please confirm you want to exit by typing 'yes' or 'no'.");
        return;
    }

    appendTerminalOutput("Are you sure you want to exit? Type 'yes' to confirm or 'no' to cancel.");
    gameState.awaitingExitConfirmation = true;
}

/**
 * Handles the exit confirmation response.
 * @param {string} response - The user's response.
 */
function handleExitConfirmationResponse(response) {
    gameState.awaitingExitConfirmation = false;
    if (response.toLowerCase() === "yes") {
        appendTerminalOutput("Exiting the game...");
        gameState.game_over = true;
    } else {
        appendTerminalOutput("Exit cancelled.");
    }
}

/**
 * Handles the "upgrade" command.
 * @param {string} component - The component to upgrade.
 */
function handleUpgrade(component) {
    // Placeholder logic
    appendTerminalOutput(`Upgrading ${component}...`);
}

// ==========================================================================
// 5. UI DISPLAY FUNCTIONS (Output to Terminal/DOM)
// ==========================================================================

/**
 * Displays the game status.
 */
function displayGameStatus() {
    // Placeholder logic
    appendTerminalOutput(`Time: ${gameState.gameTime.hours}:${gameState.gameTime.minutes}`);
    appendTerminalOutput(`Reactor Temp: ${gameState.reactorState.reactor_temp}`);
    appendTerminalOutput(`Pump Speed: ${gameState.pump_speed}`);
}

/**
 * Shows the facility status.
 */
function showFacilityStatus() {
    // Placeholder logic
    appendTerminalOutput("Facility Status:");
    appendTerminalOutput(`- Ventilation: ${gameState.ventilationStatus}`);
    appendTerminalOutput(`- CA Panels: ${gameState.caPanelStatus}`);
}

/**
 * Shows the player status.
 */
function showPlayerStatus() {
    // Placeholder logic
    appendTerminalOutput("Player Status:");
    appendTerminalOutput(`- Location: ${gameState.player.location}`);
    appendTerminalOutput(`- Sanity: ${gameState.player.stats.sanity}`);
}

/**
 * Shows the sector status.
 * @param {string} target - The target sector.
 */
function showSectorStatus(target) {
    // Placeholder logic
    appendTerminalOutput(`Sector Status: ${target}`);
}

/**
 * Shows the room status.
 * @param {string} target - The target room.
 */
function showRoomStatus(target) {
    // Placeholder logic
    appendTerminalOutput(`Room Status: ${target}`);
}

// ==========================================================================
// 6. UTILITY FUNCTIONS
// ==========================================================================

/**
 * Gets the user-friendly name of a location.
 * @param {string} locationCode - The location code.
 * @returns {string} - The user-friendly name of the location.
 */
function getUserFriendlyLocationName(locationCode) {
    return locations[locationCode]?.friendlyName || locationCode;
}

/**
 * Capitalizes a string.
 * @param {string} string - The string to capitalize.
 * @returns {string} - The capitalized string.
 */
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Parses a map string.
 * @param {string} mapString - The map string to parse.
 * @returns {Object} - The parsed map.
 */
function parseMapString(mapString) {
    // Placeholder logic
    return {};
}

// ==========================================================================
// 7. EXPORTS (Preserved as original)
// ==========================================================================
export {
    gameLoop,
    getPhaseForTime,
    displayGameStatus,
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
    flushVentilation,
    setPumpSpeed,
    restartCore,
    fixReactorComponent,
    rebootReactorComponent,
    rebootCaPanel,
    overclockReactorComponent,
    upgradeReactorComponent,
    checkHideMonster,
    checkLookAtShadow,
    rebootCamera,
    maybeMoveMonster,
    calculateCriticalTempIncreaseRate,
    handleHelp
    // initializeSettings, // Added if it needs to be called from outside
};