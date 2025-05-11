function handlePhaseTransition(phase) {
    appendOutput(`--- Phase changed: ${phase.toUpperCase()} ---`);
    // TODO: Trigger phase-specific setup like monster spawns, system changes, etc.
}

function updateReactorTemp(dt) {
    if (!gameState.core_active) {
        // Temperature might slowly decrease when core is off
        gameState.reactor_temp = Math.max(0, gameState.reactor_temp - 0.05 * dt);
        return;
    }

    // Temperature increases over time
    gameState.reactor_temp += gameState.temp_increase_rate * dt;

    // Temperature cooling based on pump speed
    const coolingEffect = gameState.pump_speed * gameState.temp_cool_rate_multiplier * dt;
    gameState.reactor_temp -= coolingEffect;

    // Ensure temperature doesn't go below a minimum
    gameState.reactor_temp = Math.max(gameState.reactor_temp, 0.0);

    // Check for power cutout (temperature too low)
    if (gameState.reactor_temp < gameState.temp_power_cutout_threshold) {
        gameState.core_active = false;
        appendOutput("Power cutout! Reactor offline.");
        if (gameState.generator_status === "broken") {
            gameState.game_over = true;
            appendOutput("Power lost! Meltdown imminent.");
        }
    }

    // Check for meltdown (temperature too high)
    if (gameState.reactor_temp >= gameState.temp_meltdown_threshold) {
        gameState.reactor_temp += gameState.meltdown_rate * dt; // Accelerate temp increase
    }
}

function updateVentilation(dt) {
    // Increase blockage over time (rate can depend on game phase or other factors)
    const blockageIncreaseRate = (gameState.phase === 'survival') ? 5 * dt : 1 * dt; // Faster blockage in survival
    gameState.ventilationBlockageLevel += blockageIncreaseRate;

    const maxBlockage = 100; // Define max blockage level

    // Ensure blockage doesn't exceed max
    gameState.ventilationBlockageLevel = Math.min(maxBlockage, gameState.ventilationBlockageLevel);

    // Check if ventilation becomes blocked
    if (gameState.ventilationBlockageLevel >= maxBlockage && gameState.ventilationStatus !== 'blocked') {
        gameState.ventilationStatus = 'blocked';
        appendOutput("Ventilation system blocked! Air quality decreasing.");
        // TODO: Implement negative effects on player stats (insomnia, sanity) or facility (gas buildup)
    }

    // Check if ventilation becomes operational after clearing blockage
    if (gameState.ventilationStatus === 'blocked' && gameState.ventilationBlockageLevel < maxBlockage) {
        gameState.ventilationStatus = 'working';
        appendOutput("Ventilation system operational again.");
    }

    // Update ventilation blocked timer
    if (gameState.ventilationStatus === 'blocked') {
        gameState.ventilationBlockedTimer += dt;
    } else {
        gameState.ventilationBlockedTimer = 0;
    }

    // Check for game over due to asphyxiation
    if (gameState.ventilationStatus === 'blocked' && gameState.ventilationBlockedTimer >= 60 && !gameState.game_over) {
        gameState.game_over = true;
        appendOutput("Ventilation system blocked for too long! You have asphyxiated.");
    }
}

function updateControlArchives(dt) {
    // --- Panel Breakdown Logic (Simple Random Chance for now) ---
    const breakdownChancePerSecond = 0.005; // 0.5% chance per second per panel
    const breakOnePanelChance = breakdownChancePerSecond * dt;

    // Break individual room panels
    for (const roomCode in gameSettings.locations) {
        // Don't break panels for rooms that don't have interactable controls or aren't relevant
        // This is a placeholder check - refine based on actual room interactions
        if (!['RR', 'SF', 'PC', 'TR', 'CP', 'BW', 'LAB', 'DCR', 'B', 'Vent', 'Elect', 'CA', 'GR', 'SR', 'CR'].includes(roomCode)) {
            continue;
        }

        // Initialize panel status if not set (should ideally be done on game start)
        if (gameState.roomPanelStatus[roomCode] === undefined) {
            gameState.roomPanelStatus[roomCode] = 'working';
        }

        if (gameState.roomPanelStatus[roomCode] === 'working' && Math.random() < breakOnePanelChance) {
            gameState.roomPanelStatus[roomCode] = 'broken';
            appendOutput(`Control panel for ${gameSettings.locations[roomCode]?.friendlyName || roomCode} is broken.`);
            // TODO: Add negative effects for broken room panels (e.g., reduced efficiency, alarms)
        }
    }

    // TODO: Add logic for main CA panel breakdown

    // --- Update Reboot Cooldown ---
    if (gameState.rebootAllCaCooldown > 0) {
        gameState.rebootAllCaCooldown = Math.max(0, gameState.rebootAllCaCooldown - dt);
    }

    // --- Update Reboot Progress ---
    for (const roomCode in gameState.rebootRoomCaProgress) {
        const rebootRatePerSecond = 10; // Progress percentage per second
        gameState.rebootRoomCaProgress[roomCode] += rebootRatePerSecond * dt;

        if (gameState.rebootRoomCaProgress[roomCode] >= 100) {
            gameState.roomPanelStatus[roomCode] = 'working';
            delete gameState.rebootRoomCaProgress[roomCode]; // Remove from progress tracking
            appendOutput(`Control panels for ${gameSettings.locations[roomCode]?.friendlyName || roomCode} are back online.`);
        }
    }

    // TODO: Add logic to handle 'reboot ca all' process completion if initiated
    // TODO: Add logic to potentially trigger 'reboot ca all' automatically after a delay if main CA panels are broken
}

function flushVentilation() {
    const flushAmount = (gameState.phase === 'fixing') ? 50 : 20; // More effective flush in fixing phase
    gameState.ventilationBlockageLevel -= flushAmount;
    gameState.ventilationBlockageLevel = Math.max(0, gameState.ventilationBlockageLevel); // Ensure blockage doesn't go below 0
    appendOutput("You initiated the ventilation flush. Blockage reduced.");

    // updateVentilation function in the game loop will handle status change if blockage is cleared
}

function updateGeneratorOil(dt) {
    // Only consume oil if the core is off and the generator isn't broken
    if (!gameState.core_active && gameState.generator_status !== 'broken') {
        // Simplified oil consumption formula (can be refined later)
        // Factors from Ren'Py script: oil_consumption_rate, oil_leak_multiplier, generator_lubricant_cycles
        const consumptionRate = (gameSettings.oil_consumption_rate || 0.1) *
                                (gameSettings.oil_leak_multiplier || 1.0) *
                                (gameState.generator_lubricant_cycles || 1); // Using 1 as default if cycle data is missing

        gameState.backup_generator_oil -= consumptionRate * dt;
        gameState.backup_generator_oil = Math.max(0, gameState.backup_generator_oil); // Ensure oil doesn't go below 0

        if (gameState.backup_generator_oil <= 0 && !gameState.game_over) {
            gameState.game_over = true;
            appendOutput("Backup generator out of oil!");
        }
    }
}

function updateReactorPowerOutput() {
    if (gameState.core_active) {
        // Simplified formula similar to Ren'Py script
        gameState.reactor_power_output = (gameState.reactor_temp / 10) + (gameState.reactor_pressure / 5);
    } else {
        gameState.reactor_power_output = 0;
    }
}

function setPumpSpeed(speed) {
    // Ensure speed is within a valid range (0 to 100)
    gameState.pump_speed = Math.max(0, Math.min(100, speed));
    appendOutput(`Pump speed set to ${gameState.pump_speed}%.`);
}

function restartCore() {
    if (!gameState.core_active) {
        if (gameState.backup_generator_oil > 0) {
            if (gameState.generator_status !== 'broken') {
                gameState.core_active = true;
                gameState.backup_generator_oil -= 10; // Consume oil on restart
                appendOutput("Core restarting...");
            } else {
                appendOutput("Cannot restart core: Generator is broken.");
            }
        } else {
            appendOutput("Cannot restart core: Generator oil is low.");
        }
    } else {
        appendOutput("Core is already active.");
    }
}

function fixReactorComponent(component) {
    // Assuming reactor components are stored in gameState.reactorComponents
    // and each component object has a 'status' property (e.g., 'broken', 'operational')
    // and a 'repairCost' or similar that influences durability usage.
    // Also assuming gameState.inventory has repairToolDurability.

    const repairToolDurabilityCost = 20; // Example cost, adjust as needed

    if (!gameState.inventory.repairToolDurability || gameState.inventory.repairToolDurability <= 0) {
        appendOutput("You need a working repair tool to fix components.");
        return;
    }

    if (gameState.inventory.repairToolDurability < repairToolDurabilityCost) {
        appendOutput("Your repair tool doesn't have enough durability to fix this component.");
        return;
    }

    // Placeholder logic: In a real game, you'd look up the specific component
    // and set its status, perhaps with a success chance.
    appendOutput(`Attempting to fix the ${component}...`);
    gameState.inventory.repairToolDurability -= repairToolDurabilityCost;
    appendOutput(`Fixed the ${component}. Repair tool durability decreased.`);
}

function rebootReactorComponent(component) {
    // Placeholder logic: Implement actual reboot effects based on component and Ren'Py script
    appendOutput(`Attempting to reboot the ${component}...`);
    // Example: Maybe a chance to clear a 'glitched' status or provide a temporary buff
}

function overclockReactorComponent(component) {
    // Placeholder logic: Implement actual overclocking effects based on component and Ren'Py script
    appendOutput(`Attempting to overclock the ${component}...`);
    // Example: Chance of success, temporary performance boost, risk of failure/damage
}

function upgradeReactorComponent(component) {
    // Placeholder logic: Implement actual upgrading effects based on component, resources, and Ren'Py script
    appendOutput(`Attempting to upgrade the ${component}...`);

    // Example: Check for resources (e.g., money) and apply permanent stats
    const upgradeCost = 50; // Example cost

    if (gameState.playerMoney >= upgradeCost) {
        gameState.playerMoney -= upgradeCost;
        // Apply upgrade effects (e.g., reduce temp_increase_rate, increase temp_cool_rate_multiplier for a pump)
        appendOutput(`Successfully upgraded the ${component}. You spent $${upgradeCost}.`);
    } else {
        appendOutput(`You don't have enough money to upgrade the ${component}. Requires $${upgradeCost}.`);
    }

    // In a full game, you'd check if the component is even upgradeable and handle different components uniquely.
}

function checkHideMonster() {
    if (gameState.isHiding) {
        for (const monster of Object.values(gameState.monsters)) {
            if (monster?.isNearPlayer) return true;
        }
    }
    return false;
}

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

function rebootCamera(cameraNumber) {
    const key = `camera${cameraNumber}`;
    if (gameState.cameraState?.[key]) {
        gameState.cameraState[key].isDistorted = false;
        appendOutput(`Camera ${cameraNumber} rebooted.`);
    } else {
        appendOutput(`Camera ${cameraNumber} is not recognized.`);
    }
}

function updateGame() {
    handleMonsterMovement();
    checkSanityEffects();
    checkWinLoseConditions();
    // Add other periodic updates like resource drains, power checks, etc.
}

function handleMonsterMovement() {
    for (const monsterName in gameState.monsters) {
        const monster = gameState.monsters[monsterName];
        // Example logic:
        if (monster.state === 'active') {
            maybeMoveMonster(monster);
        }
    }
}

function checkSanityEffects() {
    if (gameState.sanity <= 25) {
        appendOutput("You feel your grip on reality slipping...");
    }
}

function checkWinLoseConditions() {
    if (gameState.sanity <= 0) {
        appendOutput("You've lost your mind in the darkness. Game over.");
        // Optionally stop the loop or set a gameOver flag
    }
}

function maybeMoveMonster(monster) {
    // Example: Random movement every few seconds
    // This should use timers or random intervals in a more complete version
}
