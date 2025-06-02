// ==========================================================================
// 1. IMPORTS & INITIAL SETUP
// ==========================================================================
import { gameState } from "./reactorCtrlGameState.js";
import {
    facilityMapString,
    createCamera, // Assuming these are used or were planned if not directly in this snippet
    createDoor, // Assuming these are used or were planned
    createLocation, // Assuming these are used or were planned
    markerToLocationKey, // Assuming these are used or were planned
    locationKeyToMarker, // Assuming these are used or were planned
    adjacencyMatrix, // Assuming these are used or were planned
    locations,
    oil_consumption_rate,
    oil_leak_multiplier,
    shadowLookSanityDrain,
    soundEnabled,
    musicEnabled
} from "./reactorCtrlGameSettings.js";
import {
    appendTerminalOutput,
    appendTerminalSymbol,
    appendTerminalHTML,
    escapeRegExp,
    appendOutput,
    displayMap,
    updateUI,
    frog,
    updateGameUI
} from "../../terminal/js/ui.js";

let settings = {};
let lastUpdateTime = 0;
let gameTimeInMinutesReal = 0;
let currentPhase = "survival";
let awaitingExitConfirmation = false;

function initializeSettings() {
    settings.soundEnabled = soundEnabled;
    settings.musicEnabled = musicEnabled;
    updateGameUI("reactor-ctrl"); // Show game UI elements
}

// ==========================================================================
// 2. MAIN GAME LOOP & CORE TIME/PHASE MANAGEMENT
// ==========================================================================
function gameLoop(timestamp) {
    if (!lastUpdateTime) lastUpdateTime = timestamp;
    let dt = (timestamp - lastUpdateTime) / 1000;
    lastUpdateTime = timestamp;

    // UI Updates / Display
    displayGameStatus();
    displayMap(gameState, { locations, facilityMapString });

    // Core Game State Updates
    updateGameState(dt); // Handles game time and phase
    updateGame(); // Handles monsters, player stats, win/loss conditions (does not take dt)

    // Specific System Updates
    updateReactorTemp(dt);
    updateReactorPowerOutput(); // Does not take dt
    updateControlArchives(dt);
    updateVentilation(dt);
    updateGeneratorOil(dt);

    // TODO: Handle player input here or through an event listener (Comment from original)
    // For now, the game loop just updates the state over time.
    // Player commands will be processed via handleUserCommand in main.js
    // which calls reactorCtrlProcessCommand. (Comment from original)

    if (!gameState.game_over) {
        requestAnimationFrame(gameLoop);
    }
}

function updateGameState(dt) {
    // Primarily game time and phase
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

function getPhaseForTime(hours) {
    if (hours >= 6 && hours < 13) return "fixing";
    if (hours >= 13) return "rest_payment";
    return "survival";
}

function handlePhaseTransition(phase) {
    appendTerminalOutput(`--- Phase changed: ${phase.toUpperCase()} ---`);
    // TODO: Trigger phase-specific setup like monster spawns, system changes, etc. (Comment from original)
}

// ==========================================================================
// 3. CORE GAME STATE UPDATES (Called from Game Loop or other updates)
// ==========================================================================

// --- 3.1 Reactor Systems ---
function updateReactorTemp(dt) {
    if (!gameState.core_active) {
        gameState.reactor_temp = Math.max(0, gameState.reactor_temp - 0.05 * dt);
        return;
    }

    let currentTempIncreaseRate = gameState.temp_increase_rate;

    if (gameState.criticalReactorTempIncreaseRate > 0) {
        currentTempIncreaseRate = gameState.criticalReactorTempIncreaseRate;
    }
    gameState.reactor_temp += currentTempIncreaseRate * dt;
    const coolingEffect = gameState.pump_speed * gameState.temp_cool_rate_multiplier * dt;
    gameState.reactor_temp -= coolingEffect;
    gameState.reactor_temp = Math.max(gameState.reactor_temp, 0);

    if (gameState.reactor_temp < gameState.temp_power_cutout_threshold) {
        gameState.core_active = false;
        appendTerminalOutput("Power cutout! Reactor offline.");
        if (gameState.generator_status === "broken") {
            gameState.game_over = true;
            appendTerminalOutput("Power lost! Meltdown imminent.");
        }
    }

    if (gameState.reactor_temp >= gameState.temp_meltdown_threshold) {
        gameState.reactor_temp += gameState.meltdown_rate * dt; // Accelerate temp increase
    }
}

function updateReactorPowerOutput() {
    if (gameState.core_active) {
        gameState.reactor_power_output = gameState.reactor_temp / 10 + gameState.reactor_pressure / 5;
    } else {
        gameState.reactor_power_output = 0;
    }
}

function updateControlArchives(dt) {
    const criticalRooms = ["RR", "CP", "BW"];

    criticalRooms.forEach((roomCode) => {
        if (gameState.roomPanelStatus[roomCode] === "working") {
            if (Math.random() < 0.005 * dt) {
                // 0.5% chance per second
                gameState.roomPanelStatus[roomCode] = "broken";
                appendTerminalOutput(`Control panel in the ${getUserFriendlyLocationName(roomCode)} has failed!`);
                if (criticalRooms.includes(roomCode)) {
                    gameState.criticalReactorTempIncreaseRate = calculateCriticalTempIncreaseRate();
                }
            }
        }
    });

    if (gameState.rebootAllCaCooldown > 0) {
        gameState.rebootAllCaCooldown = Math.max(0, gameState.rebootAllCaCooldown - dt);
    }
    // TODO: Implement reboot progress for individual rooms (Comment from original)
}

function calculateCriticalTempIncreaseRate() {
    let brokenCount = 0;
    if (gameState.roomPanelStatus["RR"] === "broken") brokenCount++;
    if (gameState.roomPanelStatus["CP"] === "broken") brokenCount++;
    if (gameState.roomPanelStatus["BW"] === "broken") brokenCount++;

    switch (brokenCount) {
        case 0:
            return 0;
        case 1:
            return 0.5;
        case 2:
            return 1.5;
        case 3:
            return 3.0;
        default:
            return 0;
    }
}

// --- 3.2 Facility Systems ---
function updateVentilation(dt) {
    const blockageIncreaseRate = gameState.phase === "survival" ? 5 * dt : 1 * dt;
    gameState.ventilationBlockageLevel += blockageIncreaseRate;
    gameState.ventilationBlockageLevel = Math.min(100, gameState.ventilationBlockageLevel);

    if (gameState.ventilationBlockageLevel >= 100 && gameState.ventilationStatus !== "blocked") {
        gameState.ventilationStatus = "blocked";
        appendTerminalOutput("Ventilation system blocked! Air quality decreasing.");
    }

    if (gameState.ventilationStatus === "blocked" && gameState.ventilationBlockageLevel < 100) {
        gameState.ventilationStatus = "working";
        appendTerminalOutput("Ventilation system operational again.");
    }

    if (gameState.ventilationStatus === "blocked") {
        gameState.ventilationBlockedTimer += dt;
    } else {
        gameState.ventilationBlockedTimer = 0;
    }

    if (gameState.ventilationStatus === "blocked" && gameState.ventilationBlockedTimer >= 60 && !gameState.game_over) {
        gameState.game_over = true;
        appendTerminalOutput("Ventilation system blocked for too long! You have asphyxiated.");
    }
}

function updateGeneratorOil(dt) {
    if (!gameState.core_active && gameState.generator_status !== "broken") {
        const consumptionRate =
            (oil_consumption_rate || 0.1) * (oil_leak_multiplier || 1.0) * (gameState.generator_lubricant_cycles || 1);
        gameState.backup_generator_oil -= consumptionRate * dt;
        gameState.backup_generator_oil = Math.max(0, gameState.backup_generator_oil);

        if (gameState.backup_generator_oil <= 0 && !gameState.game_over) {
            gameState.game_over = true;
            appendTerminalOutput("Backup generator out of oil!");
        }
    }
}

// --- 3.3 Player, World State & Monsters (Logic from original updateGame function) ---
function updateGame() {
    // This function is called by gameLoop without dt
    handleMonsters(); // Monster logic

    // Update Survival Stats
    const hungerIncreaseRate = currentPhase === "survival" ? 0.05 : 0.02; // Used currentPhase instead of gameState.currentPhase as per original
    const insomniaIncreaseRate = currentPhase === "survival" ? 0.07 : 0.03;
    const sanityDecreaseRate = currentPhase === "survival" ? 0.04 : 0.01;

    gameState.player.stats.hunger = Math.min(100, gameState.player.stats.hunger + hungerIncreaseRate);
    gameState.player.stats.insomnia = Math.min(100, gameState.player.stats.insomnia + insomniaIncreaseRate);
    gameState.player.stats.sanity = Math.max(0, gameState.player.stats.sanity - sanityDecreaseRate);

    if (gameState.player.stats.sanity <= 25) {
        appendTerminalOutput("You feel your grip on reality slipping...");
    }

    checkSanityEffects();
    checkWinLoseConditions();
}

// ==========================================================================
// Monster Hnadle
// ==========================================================================

function handleMonsters() {
    for (const monsterName in gameState.monsters) {
        const monster = gameState.monsters[monsterName];
        switch (monster.state) {
            case "dormant":
                checkMonsterStimulus(monster);
                break;
            case "active":
                updateMonsterState(monster);
                handleMonsterAction(monster);
                break;
            default:
                break;
        }
    }
}

function updateMonsterState(monster) {
    // This function is a Work In Progress (WIP)
    // It could handle changes to the monster's state based on health, environment,
    // duration in current state, losing a target, etc.
    // For example:
    // if (monster.hp < 20 && monster.isHostile) {
    //     monster.state = 'fleeing';
    //     monster.target = findSafeSpot(monster); // You'd need a findSafeSpot function
    //     monster.path = findPath(monster.location, monster.target, gameState.locations);
    // }
    return; // Or just leave it as an empty block {}
}

function handleMonsterAction(monster) {
    // Assuming 'monster.state' is already confirmed as 'active' by the calling function 'handleMonsters'.
    // If not, you can add: if (monster.state !== 'active') return;

    // The decision to move or act should depend on the monster's overall goal and immediate situation.
    // 'isNearPlayer' is a useful piece of information. How it's updated is important.
    // (e.g., is it same room? adjacent? line of sight?)

    // Example: If monster is in the same room as the player, it should probably attack, not move.
    if (monster.location === gameState.playerLocation) {
        appendOutput(`Monster ${monster.name || "Unknown Monster"} is with the player. Triggering attack.`);
        // monsterAttackLogic(monster); // Attack takes precedence over movement
    }
    // Example: If monster is near player (but not same room) and hostile, it should try to move to player.
    else if (monster.isNearPlayer && monster.isHostile) {
        appendOutput(`Monster ${monster.name || "Unknown Monster"} is near player and hostile. Moving to engage.`);
        if (monster.target !== "player") {
            // If not already targeting player, make it so
            monster.target = "player";
            monster.path = []; // Clear old path, new path to player should be generated
            // (either here, or maybeMoveMonster if it has pathfinding)
        }
        maybeMoveMonster(monster); // Use the corrected version above
    }
    // Example: Monster is active and has a target (player or location), regardless of 'isNearPlayer'
    else if (monster.target) {
        appendOutput(`Monster ${monster.name || "Unknown Monster"} is pursuing target: ${monster.target}.`);
        maybeMoveMonster(monster); // Use the corrected version above
    }
    // Example: Monster is active, not near player, no specific target - might patrol or random move
    else {
        appendOutput(
            `Monster ${monster.name || "Unknown Monster"} is active with no specific target. General movement.`
        );
        maybeMoveMonster(monster); // Will likely do random movement based on corrected function
    }
}

function maybeMoveMonster(monster) {
    // Ensure monster and its location are valid before proceeding
    if (!monster || !monster.location || !gameState.locations[monster.location]) {
        // It's good to know which monster had an issue if 'name' property exists
        const monsterId = monster && monster.name ? monster.name : "Unknown Monster";
        appendOutput(`Error: Monster (${monsterId}) or its location is invalid. Cannot move.`);
        return;
    }
    const monsterId = monster.name || "Unknown Monster"; // For logging

    // --- Case 1: Monster is targeting the player ---
    if (monster.target === "player") {
        if (monster.location === gameState.playerLocation) {
            appendOutput(`Monster ${monsterId} is in the same location as the player: ${monster.location}.`);
            // monsterAttackLogic(monster); // <<< Your monster attack logic would go here
            return; // Monster is at the player, action is likely attack, not move.
        }

        if (monster.path && monster.path.length > 0) {
            const nextStep = monster.path.shift();
            appendOutput(
                `Monster ${monsterId} (targeting player) moves from ${monster.location} to ${nextStep}. Path steps remaining: ${monster.path.length}`
            );
            monster.location = nextStep;

            if (monster.location === gameState.playerLocation) {
                appendOutput(`Monster ${monsterId} reached player at ${monster.location}!`);
                // monsterAttackLogic(monster); // <<< Attack logic
            } else if (monster.path.length === 0) {
                appendOutput(
                    `Monster ${monsterId}'s path to player ended at ${monster.location}, but player is at ${gameState.playerLocation}.`
                );
                // Monster might need to re-path or lose target.
            }
        } else {
            appendOutput(
                `Monster ${monsterId} wants to reach player (${gameState.playerLocation}) but has no current path.`
            );
            // TODO: Consider triggering pathfinding here if monster should actively seek player
            // e.g., monster.path = calculatePathToTarget(monster.location, gameState.playerLocation, gameState.locations, monster.canNoClip);
        }
    }
    // --- Case 2: Monster is targeting a specific location (room key) ---
    else if (monster.target && gameState.locations[monster.target]) {
        const targetLocationKey = monster.target;
        if (monster.location === targetLocationKey) {
            appendOutput(`Monster ${monsterId} is already at its target room: ${targetLocationKey}.`);
            monster.target = null; // Arrived
            monster.path = []; // Clear path
            return;
        }

        if (monster.path && monster.path.length > 0) {
            const nextStep = monster.path.shift();
            appendOutput(
                `Monster ${monsterId} (targeting room ${targetLocationKey}) moves from ${monster.location} to ${nextStep}. Path steps remaining: ${monster.path.length}`
            );
            monster.location = nextStep;

            if (monster.location === targetLocationKey) {
                appendOutput(`Monster ${monsterId} reached target room ${targetLocationKey}.`);
                monster.target = null; // Arrived
                monster.path = [];
            } else if (monster.path.length === 0) {
                appendOutput(
                    `Monster ${monsterId}'s path to ${targetLocationKey} ended at ${monster.location} before arrival.`
                );
                monster.target = null; // Path exhausted
            }
        } else {
            appendOutput(`Monster ${monsterId} wants to reach ${targetLocationKey} but has no current path.`);
            // TODO: Consider triggering pathfinding here
            // e.g., monster.path = calculatePathToTarget(monster.location, targetLocationKey, gameState.locations, monster.canNoClip);
        }
    }
    // --- Case 3: No specific target / Fallback to random movement (or patrolling if implemented) ---
    else {
        appendOutput(`Monster ${monsterId} (from ${monster.location}) has no specific target. Attempting random move.`);
        const currentRoomData = gameState.locations[monster.location];

        if (currentRoomData && currentRoomData.exits && Object.keys(currentRoomData.exits).length > 0) {
            const exitDirections = Object.keys(currentRoomData.exits);
            const randomDirectionKey = exitDirections[Math.floor(Math.random() * exitDirections.length)];
            const randomDestinationRoomKey = currentRoomData.exits[randomDirectionKey];

            if (randomDestinationRoomKey && gameState.locations[randomDestinationRoomKey]) {
                appendOutput(
                    `Monster ${monsterId} randomly moving from ${monster.location} via ${randomDirectionKey} to ${randomDestinationRoomKey}.`
                );
                monster.location = randomDestinationRoomKey;
            } else {
                appendOutput(
                    `Monster ${monsterId} chose a random exit (${randomDirectionKey}) from ${monster.location} that led to an invalid destination.`
                );
            }
        } else {
            appendOutput(
                `Monster ${monsterId} cannot make a random move from ${monster.location} (no exits or room data missing).`
            );
        }
    }

    // After any move, you might want to update the monster's 'isNearPlayer' status
    // or check if it has entered the player's line of sight, potentially re-targeting.
    // For example:
    // updateMonsterProximityAndAwareness(monster, gameState);
    if (monster.location === gameState.playerLocation && monster.target !== "player") {
        // If monster stumbled upon player without specifically targeting them.
        appendOutput(`Monster ${monsterId} stumbled upon the player at ${gameState.playerLocation}!`);
        // monster.target = "player"; // Optional: aggro
        // monsterAttackLogic(monster); // Optional: immediate action
    }
}

// --- 3.4 Condition Checking (Sanity, Win/Loss) ---
function checkSanityEffects() {
    // Called by updateGame
    // This function can be used for more complex sanity effects later if needed. (Comment from original)
}

function checkWinLoseConditions() {
    // Called by updateGame
    if (gameState.sanity <= 0) {
        // Original code refers to gameState.sanity, not gameState.player.stats.sanity here. Preserving.
        appendTerminalOutput("You've lost your mind in the darkness. Game over.");
        gameState.game_over = true; // Ensure game over is set.
    }
    // Other game over conditions are checked within their respective update functions (e.g. ventilation, reactor temp)
}

// ==========================================================================
// 4. PLAYER COMMAND HANDLERS & ACTIONS
// ==========================================================================

// --- 4.1 Navigation & Observation ---
function handleGo(direction) {
    const currentLocation = gameState.player.location;
    if (locations && locations[currentLocation] && locations[currentLocation].exits) {
        const exits = locations[currentLocation].exits;
        if (exits[direction]) {
            gameState.player.location = exits[direction];
            appendTerminalOutput(`\nYou moved to ${getUserFriendlyLocationName(exits[direction])}\n`);
            showRoomStatus(exits[direction]); // Automatically look around after moving
            displayMap(gameState, { locations, facilityMapString }); // Update map after moving
        } else {
            appendTerminalOutput(`Cannot go ${direction} from here.`);
        }
    } else {
        appendTerminalOutput("Invalid location or exits not defined.");
    }
}

function handleLook() {
    const currentLocationKey = gameState.player.location;
    if (locations[currentLocationKey]) {
        showRoomStatus(currentLocationKey);
    } else {
        appendTerminalOutput("You are in an unknown location.");
    }
}

function handleDisplayMap() {
    displayMap(gameState, { locations, facilityMapString });
}
// console.log("displayMap(gameState, { locations, facilityMapString });") // Original console.log, preserved

function handleExamine(objectName) {
    // TODO: Examine an object (Comment from original)
    appendTerminalOutput(`Examining ${objectName} (not yet implemented)`);
}

// --- 4.2 Player Status & Inventory ---
function handleInventory() {
    appendTerminalOutput("--- Inventory ---");
    if (gameState.playerInventory.length === 0) {
        // Original used gameState.playerInventory
        appendTerminalOutput("Your personal inventory is empty.");
    } else {
        gameState.player.inventory.forEach((item) => appendTerminalOutput(`- ${item}`)); // Original used gameState.player.inventory
    }
    appendTerminalOutput(`Oil Cans: ${gameState.oilCans}`);
    appendTerminalOutput(`Lubricant Kits: ${gameState.lubricantKits}`);
    appendTerminalOutput(`Rations: ${gameState.rations}`);
    appendTerminalOutput(`Coffee/Tea: ${gameState.coffeeTea}`);
    appendTerminalOutput(`Repair Tool Durability: ${gameState.repairToolDurability}`);
}

function handleStat(category) {
    if (category === "player") {
        showPlayerStatus();
    } else if (category === "facility") {
        showFacilityStatus();
    } else {
        appendTerminalOutput(`Invalid category: ${category}`);
    }
}

// --- 4.3 Reactor & Facility Interaction ---
function setPumpSpeed(speed) {
    // This is a command-like function
    gameState.pump_speed = Math.max(0, Math.min(100, speed));
    appendTerminalOutput(`Pump speed set to ${gameState.pump_speed}%.`);
}

function restartCore() {
    // This is a command-like function
    if (!gameState.core_active) {
        if (gameState.backup_generator_oil > 0 && gameState.generator_status !== "broken") {
            gameState.core_active = true;
            gameState.backup_generator_oil -= 10; // Cost to restart
            appendTerminalOutput("Core restarting...");
        } else {
            appendTerminalOutput("Cannot restart core: Generator oil is low or generator is broken.");
        }
    } else {
        appendTerminalOutput("Core is already active.");
    }
}

function fixReactorComponent(component) {
    // This is a command-like function
    const repairToolDurabilityCost = 20;

    if (!gameState.repairToolDurability || gameState.repairToolDurability <= 0) {
        appendTerminalOutput("You need a working repair tool to fix components.");
        return;
    }

    if (gameState.repairToolDurability < repairToolDurabilityCost) {
        appendTerminalOutput("Your repair tool doesn't have enough durability to fix this component.");
        return;
    }
    // Actual fixing logic missing, assuming it implies success if checks pass
    appendTerminalOutput(`Attempting to fix the ${component}...`);
    gameState.repairToolDurability -= repairToolDurabilityCost;
    appendTerminalOutput(`Fixed the ${component}. Repair tool durability decreased.`);
    // TODO: Implement actual component status change to 'working'
}

function rebootReactorComponent(component) {
    // This is a command-like function
    appendTerminalOutput(`Attempting to reboot the ${component}...`);
    // TODO: Implement actual reboot logic for components (Comment from original)
}

function rebootCaPanel(roomCode) {
    // This is a command-like function
    // TODO: Implement specific reboot logic for CA panels, including progress and setting status back to 'working'. (Comment from original)
    appendTerminalOutput(
        `Attempting to reboot CA panel in ${getUserFriendlyLocationName(roomCode)}... (not fully implemented)`
    );
}

function overclockReactorComponent(component) {
    // This is a command-like function
    appendTerminalOutput(`Attempting to overclock the ${component}...`);
    // TODO: Implement overclocking logic (Comment from original)
}

function upgradeReactorComponent(component) {
    // This is a command-like function
    const upgradeCost = 50; // Example cost

    if (gameState.playerMoney >= upgradeCost) {
        gameState.playerMoney -= upgradeCost;
        appendTerminalOutput(`Successfully upgraded the ${component}. You spent $${upgradeCost}.`);
        // TODO: Implement actual component upgrade effect (Comment from original)
    } else {
        appendTerminalOutput(`You don't have enough money to upgrade the ${component}. Requires $${upgradeCost}.`);
    }
}

function flushVentilation() {
    // Core logic for flushing
    const flushAmount = currentPhase === "fixing" ? 50 : 20; // Used currentPhase
    gameState.ventilationBlockageLevel -= flushAmount;
    gameState.ventilationBlockageLevel = Math.max(0, gameState.ventilationBlockageLevel);
    appendTerminalOutput("You initiated the ventilation flush. Blockage reduced.");
}

function handleFlush(systemName) {
    // Command handler
    if (systemName === "ventilation") {
        flushVentilation();
    } else {
        appendTerminalOutput(`Cannot flush ${systemName}.`);
    }
}

function rebootCamera(cameraNumber) {
    // Core logic for rebooting camera
    const key = `camera${cameraNumber}`;
    if (gameState.cameraState?.[key]) {
        gameState.cameraState[key].isDistorted = false;
        appendTerminalOutput(`Camera ${cameraNumber} rebooted.`);
    } else {
        appendTerminalOutput(`Camera ${cameraNumber} is not recognized.`);
    }
}

function handleCam(cameraNumber) {
    // Command handler
    rebootCamera(cameraNumber);
}

function handleReboot(component) {
    // Generic reboot handler (likely needs more specific routing)
    // TODO: Reboot a system component (Comment from original)
    // This is quite generic. Might need to check component type and call specific functions
    // like rebootReactorComponent or rebootCaPanel or rebootCamera.
    appendTerminalOutput(`Rebooting ${component} (not yet implemented fully for all types)`);
    // For now, one could assume it refers to rebootReactorComponent if not a CA panel or camera
    // For example: if (component.startsWith("camera")) handleCam(component.replace("camera",""));
    // else if (isCaPanel(component)) rebootCaPanel(component); else rebootReactorComponent(component);
}

// --- 4.4 Special Player Actions & Checks ---
function checkHideMonster() {
    // This seems more like a status check than an action command
    if (gameState.isHiding) {
        for (const monster of Object.values(gameState.monsters)) {
            if (monster?.isNearPlayer) {
                // Checks if player is hiding AND monster is near
                appendTerminalOutput("You are hidden, and a monster is nearby.");
                return true;
            }
        }
        appendTerminalOutput("You are hidden, but no monsters seem to be immediately near.");
        return true; // Still hidden
    }
    appendTerminalOutput("You are not currently hiding.");
    return false;
}

function checkLookAtShadow(locationViewed) {
    // This performs an action (sanity drain)
    const shadow = gameState.monsters["Shadow"];
    if (shadow && shadow.state !== "dormant" && shadow.location === locationViewed) {
        gameState.shadowVisible = true;
        gameState.sanity = Math.max(0, gameState.sanity - shadowLookSanityDrain);
        appendTerminalOutput("You see the Shadow! Your sanity is draining!");
    } else {
        gameState.shadowVisible = false;
        // appendTerminalOutput("The way is clear of the Shadow for now."); // Optional feedback
    }
}

// --- 4.5 Game Management & Meta Commands ---
function handleHelp() {
    // Removed appendTerminalOutput from params, assuming it's globally available via import
    const commandDescriptions = {
        "go / g [direction]": "Move in a specified direction (e.g., g n).",
        "look / l": "Look around your current location.",
        "inventory / inv": "Check your inventory.",
        "examine / exam [object]": "Examine an object in your location or inventory.",
        "help / h": "Displays this help message.",
        map: "Displays the game map.",
        "fix [component]": "Attempts to fix a broken component.",
        "reboot [component]": "Attempts to reboot a system component.",
        "stat [category]": "Displays game statistics (e.g., player, facility).",
        "upgrade [component]": "Attempts to upgrade a component.",
        "flush [system]": "Attempts to flush a system (e.g., ventilation).",
        clear: "Clears the terminal output.",
        "pump [speed]": "Sets the pump speed (0-100).",
        restart: "Attempts to restart the reactor core.",
        hide: "Checks if you are effectively hiding from a nearby monster.", // Clarified description
        "shadow [location]": "Checks if the shadow monster is visible in the specified location and affects sanity.", // Clarified
        "camera [number]": "Reboots the specified camera."
        // Added other commands based on function names if they are player-triggered
    };
    appendTerminalOutput("Available commands:");
    Object.keys(commandDescriptions).forEach((command) => {
        appendTerminalOutput(`- ${command}: ${commandDescriptions[command]}`);
    });
}

function handleSettings() {
    appendTerminalOutput("--- Game Settings ---");
    appendTerminalOutput(`Sound Enabled: ${settings.soundEnabled}`);
    appendTerminalOutput(`Music Enabled: ${settings.musicEnabled}`);
}

function handleToggleSetting(settingName) {
    if (settings.hasOwnProperty(settingName)) {
        settings[settingName] = !settings[settingName];
        appendTerminalOutput(`Toggled setting: ${settingName} to ${settings[settingName]}`);
    } else {
        appendTerminalOutput(`Setting ${settingName} not found.`);
    }
}

function handleClear() {
    const terminalOutput = document.getElementById("terminalOutput");
    if (terminalOutput) {
        // Added a null check for safety
        terminalOutput.innerHTML = "";
    }
}

function handleAbout() {
    appendTerminalOutput("--- About Reactor-CTRL ---");
    appendTerminalOutput("Created by ClockWorksProduction Studio");
    appendTerminalOutput("Created for Blub Blub Fish");
    appendTerminalOutput("--------------------------");
}

function handleStart() {
    appendTerminalOutput("Game start (not yet implemented)");
    // TODO: Initialize game state for a new game
}

function handlePeak() {
    // "peek" might be more conventional for looking, but sticking to "peak"
    appendTerminalOutput("Peak status (not yet implemented)");
    // TODO: Implement a peek action, perhaps revealing something briefly
}

function handleExit() {
    awaitingExitConfirmation = true;
    appendTerminalOutput("Are you sure you want to exit? Type 'yes' or 'no'.");
}

function handleExitConfirmationResponse(response) {
    awaitingExitConfirmation = false; // Reset confirmation state regardless of answer
    if (response.toLowerCase() === "yes") {
        appendTerminalOutput("Exiting game...");
        // Additional exit logic here (e.g., save game)
        gameState.game_over = true;
    } else {
        appendTerminalOutput("Exit cancelled.");
    }
}

function handleUpgrade(component) {
    // This was also a top-level function, now a handler
    // TODO: Upgrade a component (Comment from original)
    // This is a duplicate of upgradeReactorComponent functionality.
    // It's better to call upgradeReactorComponent or decide which one to keep.
    // For now, just noting it's a placeholder.
    appendTerminalOutput(
        `Upgrading ${component} (not yet implemented via this handler specifically, use 'upgrade component_name' which calls upgradeReactorComponent)`
    );
}

// ==========================================================================
// 5. UI DISPLAY FUNCTIONS (Output to Terminal/DOM)
// ==========================================================================
function displayGameStatus() {
    // For the stat-bar
    const statBar = document.getElementById("stat-bar");
    if (statBar) {
        statBar.style.display = "block";
        statBar.innerHTML = `
            Location: ${getUserFriendlyLocationName(gameState.player.location)} |
            Reactor Temp: ${gameState.reactorState.reactor_temp.toFixed(1)}°C | 
            Ventilation: ${gameState.ventilationStatus}
        `;
        // Original had gameState.reactor_temp, but status shows gameState.reactorState.reactor_temp. Preserving this version.
    }
}

function showFacilityStatus() {
    appendTerminalOutput("--- Facility Status ---");
    appendTerminalOutput(`Reactor Temperature: ${gameState.reactorState.reactor_temp.toFixed(1)}°C`);
    appendTerminalOutput(`Reactor Pressure: ${gameState.reactorState.reactor_pressure.toFixed(1)}`); // Assuming gameState.reactorState
    appendTerminalOutput(`Ventilation Status: ${gameState.ventilationStatus}`);
    appendTerminalOutput(`Ventilation Blockage: ${gameState.ventilationBlockageLevel.toFixed(1)}%`);
}

function showPlayerStatus() {
    appendTerminalOutput("--- Player Status ---");
    appendTerminalOutput(`Location: ${getUserFriendlyLocationName(gameState.playerLocation)}`); // Original: gameState.playerLocation
    appendTerminalOutput(`Hunger: ${gameState.player.stats.hunger.toFixed(1)}%`);
    appendTerminalOutput(`Insomnia: ${gameState.player.stats.insomnia.toFixed(1)}%`);
    appendTerminalOutput(`Sanity: ${gameState.player.stats.sanity.toFixed(1)}%`);
    appendTerminalOutput(`Money: $${gameState.playerMoney}`); // Added $ sign for clarity
}

function showSectorStatus(target) {
    appendTerminalOutput(`--- ${capitalize(target)} Sector Status ---`);
    // Implement sector-specific status outputs (Comment from original)
    appendTerminalOutput("----------------------------");
}

function showRoomStatus(target) {
    // target is a roomCode
    const room = locations[target];
    if (room) {
        appendTerminalOutput(`--- ${room.friendlyName} Status ---`);
        appendTerminalOutput(room.description);
        if (room.exits && Object.keys(room.exits).length > 0) {
            appendTerminalOutput(`Exits: ${Object.keys(room.exits).join(", ")}`);
        } else {
            appendTerminalOutput("There are no obvious exits.");
        }
    } else {
        appendTerminalOutput("Invalid room code.");
    }
}

// ==========================================================================
// 6. UTILITY FUNCTIONS
// ==========================================================================
function getUserFriendlyLocationName(locationCode) {
    if (locations && locations[locationCode]) {
        return locations[locationCode].friendlyName || locationCode;
    } else {
        return locationCode; // Fallback to code if not found
    }
}

function capitalize(string) {
    if (typeof string !== "string" || string.length === 0) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function parseMapString(mapString) {
    // TODO: Parse the ASCII map string into a usable data structure (Comment from original)
    return {}; // placeholder return
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