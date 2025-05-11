async function processCommand(command) {
    appendOutput(`> ${command}`); // Echo command

    if (awaitingExitConfirmation) {
        handleExitConfirmation(command);
        return;
    }

    const [action, ...args] = command.trim().toLowerCase().split(' ');

    const roomSpecificActions = ['fix', 'reboot', 'overclock', 'upgrade', 'cam', 'flush'];

    // Handle control panel status check
    if (gameState.caPanelStatus === 'broken' && roomSpecificActions.includes(action)) {
        appendOutput("The control panels in the Control Archives are not working. You cannot issue commands to other rooms.");
        return;
    }

    switch (action) {
        case 'start':
            startCommand();
            break;
        case 'help':
            helpCommand();
            break;
        case 'look':
            lookCommand();
            break;
        case 'go':
            goCommand(args);
            break;
        case 'peak':
            peakCommand();
            break;
        case 'cam':
            camCommand(args);
            break;
        case 'settings':
            settingsCommand(args);
            break;
        case 'about':
            aboutCommand();
            break;
        case 'map':
            displayMap();
            break;
        case 'fix':
            fixCommand(args);
            break;
        case 'reboot':
            rebootCommand(args);
            break;
        case 'stat':
            statCommand(args);
            break;
        case 'upgrade':
            upgradeCommand(args);
            break;
        case 'flush':
            flushCommand(args);
            break;
        case 'exit':
            awaitingExitConfirmation = true;
            appendOutput("Are you sure you want to exit? (yes/no)");
            break;
        default:
            appendOutput("Unknown command. Type 'help' for a list of commands.");
    }

    if (!awaitingExitConfirmation) {
        commandInput.value = ''; // Clear input if no exit confirmation
    }
}

// Helper functions for each command

function startCommand() {
    appendOutput("Starting the game...");
    requestAnimationFrame(gameLoop);
}

function helpCommand() {
    appendOutput("Available commands: start, help, look, exit");
    appendOutput("Settings commands: settings show, settings sound [on/off], settings music [on/off]");
    appendOutput("Navigation commands: map, go [exit_name]");
    appendOutput("Observation commands: look, peak, cam [camera_number]");
    appendOutput("Status commands: stat [all/player/@/sector/room]");
    appendOutput("Sectors: reactor, lab, utility, hallway");
    appendOutput("System commands: flush vent");
    appendOutput("Maintenance commands: fix [component], upgrade [component]");
    appendOutput("System commands: reboot [component]");
    appendOutput("Other commands: about");
}

function lookCommand() {
    if (gameState.isHiding) {
        appendOutput("You need to unhide to look around properly. Use 'peak' to cautiously peek.");
    } else {
        const desc = gameSettings.locations[gameState.currentLocation]?.description || "You are in an unknown location.";
        appendOutput(desc);
    }
}

function fixCommand([component]) {
    if (component === 'ca') {
        // Handle fixing Control Archives panel
        gameState.caPanelStatus = 'working';
        for (const roomCode in gameState.roomPanelStatus) {
            gameState.roomPanelStatus[roomCode] = 'working';
        }
        appendOutput("Control Archives panels have been manually fixed.");
    } else if (component) {
        fixReactorComponent(component);
    } else {
        appendOutput("Usage: fix [component] or fix ca (Fixing Phase)");
    }
}

function flushCommand([target]) {
    if (target === 'vent') {
        flushVentilation();
    } else {
        appendOutput("Usage: flush vent");
    }
}

function rebootCommand([component]) {
    if (component === 'ca') {
        handleRebootCA(args);
    } else if (component) {
        rebootReactorComponent(component);
    } else {
        appendOutput("Usage: reboot [component]");
    }
}

function handleRebootCA(args) {
    const target = args[1]?.toLowerCase();
    if (target === 'all') {
        if (gameState.rebootAllCaCooldown > 0) {
            appendOutput(`Reboot All CA is on cooldown. ${gameState.rebootAllCaCooldown.toFixed(1)} seconds left.`);
        } else {
            gameState.rebootAllCaCooldown = 120;
            appendOutput("Initiating full system reboot for Control Archives panels.");
        }
    } else if (target) {
        rebootSpecificRoomCA(target);
    } else {
        appendOutput("Usage: reboot ca [all/room_code]");
    }
}

function rebootSpecificRoomCA(target) {
    const roomCode = target.toUpperCase();
    const room = gameSettings.locations[roomCode];

    if (!room || gameState.caPanelStatus === 'broken') {
        appendOutput(`Invalid or broken Control Archives for room: ${roomCode}.`);
    } else {
        gameState.rebootRoomCaProgress[roomCode] = 0;
        appendOutput(`Initiating reboot for control panels in ${room.friendlyName}.`);
    }
}

function statCommand(args) {
    const target = args[0]?.toLowerCase();
    const validSectors = ['reactor', 'lab', 'utility', 'hallway'];

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
    appendOutput("--- Facility Status Summary ---");
    appendOutput(`Reactor Status: ${gameState.core_active ? 'Active' : 'Inactive'}`);
    appendOutput(`Reactor Temp: ${gameState.reactor_temp.toFixed(1)} C`);
    appendOutput(`Reactor Power: ${gameState.reactor_power_output.toFixed(1)} MW`);
    appendOutput("--- Inventory ---");
    for (const item in gameState.inventory) {
        appendOutput(`${capitalize(item)}: ${gameState.inventory[item]}`);
    }
    appendOutput("-------------------------------");
}

function showPlayerStatus() {
    appendOutput("--- Player Status ---");
    appendOutput(`Current Location: ${getUserFriendlyLocationName(gameState.currentLocation)}`);
    appendOutput(`Player State: ${gameState.playerState}`);
    appendOutput(`Time: ${gameState.inGameTime.toFixed(1)}`);
    appendOutput(`Money: $${gameState.playerMoney.toFixed(2)}`);
    appendOutput("---------------------");
}

function showSectorStatus(target) {
    appendOutput(`--- ${capitalize(target)} Sector Status ---`);
    // Implement sector-specific status outputs
    appendOutput("----------------------------");
}

function showRoomStatus(target) {
    const room = gameSettings.locations[target];
    if (room) {
        appendOutput(`--- ${room.friendlyName} Status ---`);
        appendOutput(room.description);
        appendOutput(`Exits: ${Object.keys(room.exits).join(', ')}`);
    } else {
        appendOutput("Invalid room code.");
    }
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Other command functions...

function handleExitConfirmation(response) {
    const lowerResponse = response.toLowerCase().trim();
    if (lowerResponse === 'yes' || lowerResponse === 'y') {
        appendOutput("Exiting game...");
        window.location.href = '../../index.html';
    } else {
        appendOutput("Exit cancelled.");
    }

    commandInput.value = '';
    awaitingExitConfirmation = false;
}

let awaitingExitConfirmation = false;
