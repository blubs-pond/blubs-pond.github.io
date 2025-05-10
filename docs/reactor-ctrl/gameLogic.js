function gameLoop(timestamp) {
    if (!lastUpdateTime) lastUpdateTime = timestamp;
    const dt = (timestamp - lastUpdateTime) / 1000; // in seconds
    lastUpdateTime = timestamp; 

    updateGameState(dt); // Update time + phase
    updateGame(); // Call your core logic
    requestAnimationFrame(gameLoop); // Keep the loop running
}

function updateGameState(dt) {
    const realLifeMinutesElapsed = dt / 60.0;
    gameTimeInMinutesReal += realLifeMinutesElapsed;

    const totalInGameMinutes = (gameTimeInMinutesReal / 48.0) * 1440;
    const hours = Math.floor((totalInGameMinutes / 60) % 24);
    const minutes = Math.floor(totalInGameMinutes % 60);
    gameState.gameTime.hours = hours;
    gameState.gameTime.minutes = minutes;

    let newPhase = "survival";
    if (hours >= 6 && hours < 13) {
        newPhase = "fixing";
    } else if (hours >= 13) {
        newPhase = "rest_payment";
    }

    if (newPhase !== currentPhase) {
        currentPhase = newPhase;
        handlePhaseTransition(newPhase);
    }
}

function handlePhaseTransition(phase) {
    appendOutput(`--- Phase changed: ${phase.toUpperCase()} ---`);
    // TODO: Trigger phase-specific setup like monster spawns, system changes, etc.
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
