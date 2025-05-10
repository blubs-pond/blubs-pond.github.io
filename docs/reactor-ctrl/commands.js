function processCommand(command) {
    appendOutput(`> ${command}`); // Echo command
    const [action, ...args] = command.trim().toLowerCase().split(' ');

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
        case 'exit':
            appendOutput("Are you sure you want to exit? (yes/no)");
            break;
        default:
            appendOutput("Unknown command. Type 'help' for a list of commands.");
    }

    if (!awaitingExitConfirmation) {
        commandInput.value = '';
    }
}

function startCommand() {
    appendOutput("Starting the game...");
    requestAnimationFrame(gameLoop);
}

function helpCommand() {
    appendOutput("Available commands: start, help, look, exit");
    appendOutput("Settings commands: settings show, settings sound [on/off], settings music [on/off]");
    appendOutput("Navigation commands: map, go [exit_name]");
    appendOutput("Observation commands: look, peak, cam [camera_number] [action]");
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

function goCommand([exitName]) {
    const currentLocation = gameState.currentLocation;
    const exits = gameSettings.locations[currentLocation]?.exits || {};

    if (exitName && exits[exitName]) {
        gameState.currentLocation = exits[exitName];
        appendOutput(`You are now in the ${getUserFriendlyLocationName(exits[exitName])}.`);
    } else {
        appendOutput(`You cannot go that way. Available exits: ${Object.keys(exits).join(', ') || 'None'}.`);
    }
}

function peakCommand() {
    if (gameState.isHiding) {
        appendOutput(checkHideMonster() ? "You hear something moving close by..." : "You cautiously peek from your hiding spot...");
    } else {
        appendOutput("You need to be hiding to peek.");
    }
}

function camCommand([cameraNumber, action]) {
    if (!cameraNumber) {
        appendOutput("Usage: cam [camera_number] [action]");
        return;
    }

    const cameraLocation = Object.values(gameSettings.locations).find(loc => loc.cameraFeed === `camera${cameraNumber}`);

    if (!cameraLocation) {
        appendOutput(`Camera ${cameraNumber} not found.`);
        const available = Object.values(gameSettings.locations).filter(loc => loc.cameraFeed).map(loc => loc.cameraFeed.replace('camera', ''));
        appendOutput(`Available cameras: ${available.join(', ')}`);
        return;
    }

    if (!action) {
        appendOutput(`Viewing Camera ${cameraNumber}: ${cameraLocation.description}`);
        checkLookAtShadow(cameraLocation.location);
    } else if (action === 'reboot') {
        appendOutput(`Attempting to reboot Camera ${cameraNumber}...`);
        rebootCamera(cameraNumber);
    } else {
        appendOutput(`Invalid action for camera: ${action}`);
    }
}

function settingsCommand([type, value]) {
    if (type === 'show') {
        appendOutput("--- Current Settings ---");
        appendOutput(`Sound: ${gameSettings.soundEnabled ? 'On' : 'Off'}`);
        appendOutput(`Music: ${gameSettings.musicEnabled ? 'On' : 'Off'}`);
        appendOutput("------------------------");
    } else if (['sound', 'music'].includes(type)) {
        const valid = ['on', 'off'].includes(value);
        if (!valid) {
            appendOutput(`Invalid ${type} setting. Use 'settings ${type} on' or 'settings ${type} off'.`);
            return;
        }
        gameSettings[`${type}Enabled`] = value === 'on';
        appendOutput(`${type.charAt(0).toUpperCase() + type.slice(1)} ${value === 'on' ? 'enabled' : 'disabled'}.`);
    } else {
        appendOutput("Invalid settings command. Use 'settings show' or 'settings sound/music [on/off]'.");
    }
}

function aboutCommand() {
    appendOutput("--- About Reactor Control (CLI Edition) ---");
    appendOutput("Version: Alpha_0.1");
    appendOutput("Developed by: ClockWorksProduction Studio");
    appendOutput("Developed for: twitch.tv/blubbyblubfish");
    appendOutput("-----------------------------------------");
}


// Function to handle exit confirmation
function handleExitConfirmation(response) {
    const lowerResponse = response.toLowerCase().trim();

    if (lowerResponse === 'yes' || lowerResponse === 'y') {
        appendOutput("Exiting game...");
        window.location.href = '../../index.html'; // Redirect to the index page
    } else {
        appendOutput("Exit cancelled.");
    }

    commandInput.value = ''; // Clear the input field
    awaitingExitConfirmation = false; // Reset the flag
}

let awaitingExitConfirmation = false; // Flag to track exit confirmation