// Handles the transition between game phases (e.g., survival, repair, etc.)
function handlePhaseTransition(phase) {
    appendOutput(`--- Phase changed: ${phase.toUpperCase()} ---`);
    // TODO: Trigger phase-specific setup like monster spawns, system changes, etc.
}

// Updates reactor temperature based on system state and cooling effects
function updateReactorTemp(dt) {
    if (!gameState.core_active) {
        gameState.reactor_temp = Math.max(0, gameState.reactor_temp - 0.05 * dt);
        return;
    }

    // Temperature increases over time
    gameState.reactor_temp += gameState.temp_increase_rate * dt;
    const coolingEffect = gameState.pump_speed * gameState.temp_cool_rate_multiplier * dt;
    gameState.reactor_temp -= coolingEffect;
    gameState.reactor_temp = Math.max(gameState.reactor_temp, 0);

    // Check for power cutout and meltdown
    if (gameState.reactor_temp < gameState.temp_power_cutout_threshold) {
        gameState.core_active = false;
        appendOutput("Power cutout! Reactor offline.");
        if (gameState.generator_status === "broken") {
            gameState.game_over = true;
            appendOutput("Power lost! Meltdown imminent.");
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
        appendOutput("Ventilation system blocked! Air quality decreasing.");
    }

    if (gameState.ventilationStatus === 'blocked' && gameState.ventilationBlockageLevel < 100) {
        gameState.ventilationStatus = 'working';
        appendOutput("Ventilation system operational again.");
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
        appendOutput("Ventilation system blocked for too long! You have asphyxiated.");
    }
}

// Flushing ventilation blockage (more effective in 'fixing' phase)
function flushVentilation() {
    const flushAmount = gameState.phase === 'fixing' ? 50 : 20;
    gameState.ventilationBlockageLevel -= flushAmount;
    gameState.ventilationBlockageLevel = Math.max(0, gameState.ventilationBlockageLevel);
    appendOutput("You initiated the ventilation flush. Blockage reduced.");
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
            appendOutput("Backup generator out of oil!");
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
    appendOutput(`Pump speed set to ${gameState.pump_speed}%.`);
}

// Attempts to restart the reactor core if it is not already active
function restartCore() {
    if (!gameState.core_active) {
        if (gameState.backup_generator_oil > 0 && gameState.generator_status !== 'broken') {
            gameState.core_active = true;
            gameState.backup_generator_oil -= 10;
            appendOutput("Core restarting...");
        } else {
            appendOutput("Cannot restart core: Generator oil is low or generator is broken.");
        }
    } else {
        appendOutput("Core is already active.");
    }
}

// Repair a reactor component if the player has a working repair tool
function fixReactorComponent(component) {
    const repairToolDurabilityCost = 20;

    if (!gameState.inventory.repairToolDurability || gameState.inventory.repairToolDurability <= 0) {
        appendOutput("You need a working repair tool to fix components.");
        return;
    }

    if (gameState.inventory.repairToolDurability < repairToolDurabilityCost) {
        appendOutput("Your repair tool doesn't have enough durability to fix this component.");
        return;
    }

    appendOutput(`Attempting to fix the ${component}...`);
    gameState.inventory.repairToolDurability -= repairToolDurabilityCost;
    appendOutput(`Fixed the ${component}. Repair tool durability decreased.`);
}

// Reboots a reactor component
function rebootReactorComponent(component) {
    appendOutput(`Attempting to reboot the ${component}...`);
}

// Overclock a reactor component with a potential risk/reward system
function overclockReactorComponent(component) {
    appendOutput(`Attempting to overclock the ${component}...`);
}

// Upgrade a reactor component, requiring resources and money
function upgradeReactorComponent(component) {
    const upgradeCost = 50;

    if (gameState.playerMoney >= upgradeCost) {
        gameState.playerMoney -= upgradeCost;
        appendOutput(`Successfully upgraded the ${component}. You spent $${upgradeCost}.`);
    } else {
        appendOutput(`You don't have enough money to upgrade the ${component}. Requires $${upgradeCost}.`);
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
        appendOutput("You see the Shadow! Your sanity is draining!");
    } else {
        gameState.shadowVisible = false;
    }
}

// Reboots a camera if it is malfunctioning
function rebootCamera(cameraNumber) {
    const key = `camera${cameraNumber}`;
    if (gameState.cameraState?.[key]) {
        gameState.cameraState[key].isDistorted = false;
        appendOutput(`Camera ${cameraNumber} rebooted.`);
    } else {
        appendOutput(`Camera ${cameraNumber} is not recognized.`);
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
        appendOutput("You feel your grip on reality slipping...");
    }
}

// Checks if the win/lose conditions are met
function checkWinLoseConditions() {
    if (gameState.sanity <= 0) {
        appendOutput("You've lost your mind in the darkness. Game over.");
    }
}

// Randomly decides if a monster moves
function maybeMoveMonster(monster) {
    // Random movement logic here
}