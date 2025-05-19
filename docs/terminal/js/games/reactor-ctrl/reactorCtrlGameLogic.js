import { gameState } from './reactorCtrlGameState.js';
import { gameSettings } from './reactorCtrlGameSettings.js';
import { appendTerminalOutput } from '../../ui.js';

let lastUpdateTime = 0;
let gameTimeInMinutesReal = 0;
let currentPhase = "survival";
let awaitingExitConfirmation = false;

function gameLoop(timestamp) {
    if (!lastUpdateTime) lastUpdateTime = timestamp;
    const dt = (timestamp - lastUpdateTime) / 1000;
    lastUpdateTime = timestamp;

    updateGameState(dt);
    updateGame();
    updateReactorTemp(dt);
    updateReactorPowerOutput();
    updateControlArchives(dt);
    updateVentilation(dt);
    updateGeneratorOil(dt);

    if (!gameState.game_over) {
        requestAnimationFrame(gameLoop);
    }
}

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

function getPhaseForTime(hours) {
    if (hours >= 6 && hours < 13) return "fixing";
    if (hours >= 13) return "rest_payment";
    return "survival";
}

function handlePhaseTransition(phase) {
    appendTerminalOutput(`--- Phase changed: ${phase.toUpperCase()} ---`);
    // TODO: Trigger phase-specific setup like monster spawns, system changes, etc.
}

// Updates reactor temperature based on system state and cooling effects
function updateReactorTemp(dt) {
    if (!gameState.core_active) {
        gameState.reactor_temp = Math.max(0, gameState.reactor_temp - 0.05 * dt);
        return;
    }

    // Temperature increases over time based on critical panel status
    let currentTempIncreaseRate = gameState.temp_increase_rate;

    // If critical panels are broken, use the critical increase rate
    // Otherwise, normal temperature increase and cooling apply
    // Apply critical temperature increase rate if any critical panel is broken
    if (gameState.criticalReactorTempIncreaseRate > 0) {
        currentTempIncreaseRate = gameState.criticalReactorTempIncreaseRate;
    }
    gameState.reactor_temp += currentTempIncreaseRate * dt;
    const coolingEffect = gameState.pump_speed * gameState.temp_cool_rate_multiplier * dt;
    gameState.reactor_temp -= coolingEffect;
    gameState.reactor_temp = Math.max(gameState.reactor_temp, 0);


    // Check for power cutout and meltdown
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

// Updates ventilation system, including blockage and air quality status
function updateVentilation(dt) {
    const blockageIncreaseRate = gameState.phase === 'survival' ? 5 * dt : 1 * dt;
    gameState.ventilationBlockageLevel += blockageIncreaseRate;
    gameState.ventilationBlockageLevel = Math.min(100, gameState.ventilationBlockageLevel);

    // Ventilation system status update
    if (gameState.ventilationBlockageLevel >= 100 && gameState.ventilationStatus !== 'blocked') {
        gameState.ventilationStatus = 'blocked';
        appendTerminalOutput("Ventilation system blocked! Air quality decreasing.");
    }

    if (gameState.ventilationStatus === 'blocked' && gameState.ventilationBlockageLevel < 100) {
        gameState.ventilationStatus = 'working';
        appendTerminalOutput("Ventilation system operational again.");
    }

    // Blocked ventilation timer
    if (gameState.ventilationStatus === 'blocked') {
        gameState.ventilationBlockedTimer += dt;
    } else {
        gameState.ventilationBlockedTimer = 0;
    }

    // Check for asphyxiation if ventilation is blocked for too long
    if (gameState.ventilationStatus === 'blocked' && gameState.ventilationBlockedTimer >= 60 && !gameState.game_over) {
        gameState.game_over = true;
        appendTerminalOutput("Ventilation system blocked for too long! You have asphyxiated.");
    }
}

// Flushing ventilation blockage (more effective in 'fixing' phase)
function flushVentilation() {
    const flushAmount = gameState.phase === 'fixing' ? 50 : 20;
    gameState.ventilationBlockageLevel -= flushAmount;
    gameState.ventilationBlockageLevel = Math.max(0, gameState.ventilationBlockageLevel);
    appendTerminalOutput("You initiated the ventilation flush. Blockage reduced.");
}

// Updates the backup generator oil consumption if reactor is off
function updateGeneratorOil(dt) {
    if (!gameState.core_active && gameState.generator_status !== 'broken') {
        const consumptionRate = (gameSettings.oil_consumption_rate || 0.1) *
            (gameSettings.oil_leak_multiplier || 1.0) *
            (gameState.generator_lubricant_cycles || 1);
        gameState.backup_generator_oil -= consumptionRate * dt;
        gameState.backup_generator_oil = Math.max(0, gameState.backup_generator_oil);

        if (gameState.backup_generator_oil <= 0 && !gameState.game_over) {
            gameState.game_over = true;
            appendTerminalOutput("Backup generator out of oil!");
        }
    }
}

// Updates the reactor's power output based on temperature and pressure
function updateReactorPowerOutput() {
    if (gameState.core_active) {
        gameState.reactor_power_output = (gameState.reactor_temp / 10) + (gameState.reactor_pressure / 5);
    } else {
        gameState.reactor_power_output = 0;
    }
}

// Sets the pump speed within a valid range (0-100)
function setPumpSpeed(speed) {
    gameState.pump_speed = Math.max(0, Math.min(100, speed));
    appendTerminalOutput(`Pump speed set to ${gameState.pump_speed}%.`);
}

// Attempts to restart the reactor core if it is not already active
function restartCore() {
    if (!gameState.core_active) {
        if (gameState.backup_generator_oil > 0 && gameState.generator_status !== 'broken') {
            gameState.core_active = true;
            gameState.backup_generator_oil -= 10;
            appendTerminalOutput("Core restarting...");
        } else {
            appendTerminalOutput("Cannot restart core: Generator oil is low or generator is broken.");
        }
    } else {
        appendTerminalOutput("Core is already active.");
    }
}

// Repair a reactor component if the player has a working repair tool
function fixReactorComponent(component) {
    const repairToolDurabilityCost = 20;

    if (!gameState.inventory.repairToolDurability || gameState.inventory.repairToolDurability <= 0) {
        appendTerminalOutput("You need a working repair tool to fix components.");
        return;
    }

    if (gameState.inventory.repairToolDurability < repairToolDurabilityCost) {
        appendTerminalOutput("Your repair tool doesn't have enough durability to fix this component.");
        return;
    }

    appendTerminalOutput(`Attempting to fix the ${component}...`);
    gameState.inventory.repairToolDurability -= repairToolDurabilityCost;
    appendTerminalOutput(`Fixed the ${component}. Repair tool durability decreased.`);
}

// Reboots a reactor component
function rebootReactorComponent(component) {
    appendTerminalOutput(`Attempting to reboot the ${component}...`);
}

function rebootCaPanel(roomCode) {
    // TODO: Implement specific reboot logic for CA panels, including progress and setting status back to 'working'.
}

// Overclock a reactor component with a potential risk/reward system
function overclockReactorComponent(component) {
    appendTerminalOutput(`Attempting to overclock the ${component}...`);
}

// Upgrade a reactor component, requiring resources and money
function upgradeReactorComponent(component) {
    const upgradeCost = 50;

    if (gameState.playerMoney >= upgradeCost) {
        gameState.playerMoney -= upgradeCost;
        appendTerminalOutput(`Successfully upgraded the ${component}. You spent $${upgradeCost}.`);
    } else {
        appendTerminalOutput(`You don't have enough money to upgrade the ${component}. Requires $${upgradeCost}.`);
    }
}

// Checks if the player is hiding from a nearby monster
function checkHideMonster() {
    if (gameState.isHiding) {
        for (const monster of Object.values(gameState.monsters)) {
            if (monster?.isNearPlayer) return true;
        }
    }
    return false;
}

// Checks if the shadow monster is visible, and decreases sanity if it is
function checkLookAtShadow(locationViewed) {
    const shadow = gameState.monsters["Shadow"];
    if (shadow && shadow.state !== "dormant" && shadow.location === locationViewed) {
        gameState.shadowVisible = true;
        gameState.sanity = Math.max(0, gameState.sanity - gameSettings.shadowLookSanityDrain);
        appendTerminalOutput("You see the Shadow! Your sanity is draining!");
    } else {
        gameState.shadowVisible = false;
    }
}

// Reboots a camera if it is malfunctioning
function rebootCamera(cameraNumber) {
    const key = `camera${cameraNumber}`;
    if (gameState.cameraState?.[key]) {
        gameState.cameraState[key].isDistorted = false;
        appendTerminalOutput(`Camera ${cameraNumber} rebooted.`);
    } else {
        appendTerminalOutput(`Camera ${cameraNumber} is not recognized.`);
    }
}

// Main game loop for periodic updates (monster movements, sanity checks, etc.)
function updateGame() {
    handleMonsterMovement();
    checkSanityEffects();
    checkWinLoseConditions();
}

// Handles monster movement logic
function handleMonsterMovement() {
    for (const monsterName in gameState.monsters) {
        const monster = gameState.monsters[monsterName];
        if (monster.state === 'active') {
            maybeMoveMonster(monster);
        }
    }
}

// Checks sanity effects (e.g., when sanity is low, the player is warned)
function checkSanityEffects() {
    if (gameState.sanity <= 25) {
        appendTerminalOutput("You feel your grip on reality slipping...");
    }
}

// Checks if the win/lose conditions are met
function checkWinLoseConditions() {
    if (gameState.sanity <= 0) {
        appendTerminalOutput("You've lost your mind in the darkness. Game over.");
    }
}

// Randomly decides if a monster moves
function maybeMoveMonster(monster) {
    // Random movement logic here
}

// Helper function to calculate the critical temperature increase rate based on broken critical panels
function calculateCriticalTempIncreaseRate() {
    let brokenCount = 0;
    if (gameState.roomPanelStatus['RR'] === 'broken') brokenCount++;
    if (gameState.roomPanelStatus['CP'] === 'broken') brokenCount++;
    if (gameState.roomPanelStatus['BW'] === 'broken') brokenCount++;

    // Define different critical rates based on the number of broken panels
    // These are placeholder values and should be adjusted in gameSettings.js
    switch (brokenCount) {
        case 0:
            return 0; // No critical panels broken, no critical increase
        case 1:
            return 0.5; // One critical panel broken
        case 2:
            return 1.5; // Two critical panels broken
        case 3:
            return 3.0; // All three critical panels broken (very rapid increase)
        default:
            return 0; // Should not happen
    }
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function handleHelp(appendTerminalOutput) {
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
        'pump [speed]': 'Sets the pump speed (0-100).',
        'restart': 'Attempts to restart the reactor core.',
        'hide': 'Checks if you are hiding from a nearby monster.',
        'shadow [location]': 'Checks if the shadow monster is visible in the specified location.',
        'camera [number]': 'Reboots the specified camera.'
    };
    appendTerminalOutput("Available commands:");
    Object.keys(commandDescriptions).forEach(command => {
        appendTerminalOutput(`- ${command}: ${commandDescriptions[command]}`);
    });
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
};
