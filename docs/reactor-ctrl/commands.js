function processCommand(command) {
    appendOutput(`> ${command}`); // Echo command

    if (awaitingExitConfirmation) {
        handleExitConfirmation(command);
        return; // Stop further processing if waiting for exit confirmation
    }

    const [action, ...args] = command.trim().toLowerCase().split(' ');

    // List of commands that interact with specific rooms
    const roomSpecificActions = ['fix', 'reboot', 'overclock', 'upgrade', 'cam', 'flush'];

    if (gameState.caPanelStatus === 'broken' && roomSpecificActions.includes(action)) {
        appendOutput("The control panels in the Control Archives are not working. You cannot issue commands to other rooms.");
        return; // Stop further processing if CA panels are broken for a room-specific command
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
            statCommand(args); // Keep the stat command handler
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
    appendOutput("Observation commands: look, peak, cam [camera_number]");
    appendOutput("Status commands: stat [all/player/@/sector/room]");
    appendOutput("Sectors: reactor, lab, utility, hallway");
    appendOutput("System commands: flush vent");
    appendOutput("Maintenance commands: fix [component], upgrade [component]");
    appendOutput("System commands: reboot [component]");
    appendOutput("Status commands: stat reactor [room_id]");
    appendOutput("Upgrade commands: upgrade [component]");
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
        // TODO: Check gameState.currentPhase for 'fixing' phase
        // if (gameState.currentPhase === 'fixing') { // Uncomment and implement phase check
            gameState.caPanelStatus = 'working';
            for (const roomCode in gameState.roomPanelStatus) {
                gameState.roomPanelStatus[roomCode] = 'working';
            }
            appendOutput("Control Archives panels have been manually fixed.");
        // } else {
        //     appendOutput("You can only manually fix the Control Archives panels during the Fixing phase."); // Uncomment and implement phase check
        // }
    } else if (component) {
        fixReactorComponent(component);
    } else {
        appendOutput("Usage: fix [component] or fix ca (Fixing Phase)");
    }
}

function flushCommand([target]) {
    if (target === 'vent') {
        flushVentilation(); // Call the flushVentilation function from gameLogic.js
    } else {
        appendOutput("Usage: flush vent");
    }
}

function rebootCommand([component]) {
    if (component === 'ca') {
        // Need args array here, get it from processCommand or pass it
        const target = args[1]?.toLowerCase(); // Get the second argument (all or room code)

        if (target === 'all') {
            // Reboot All CA panels
            if (gameState.rebootAllCaCooldown > 0) {
                appendOutput(`Reboot All CA is on cooldown. ${gameState.rebootAllCaCooldown.toFixed(1)} seconds left.`);
            } else {
                // Assuming 120 seconds cooldown for 'reboot ca all'
                gameState.rebootAllCaCooldown = 120; // Set cooldown
                // The actual fixing will happen in updateControlArchives
                appendOutput("Initiating full system reboot for Control Archives panels. This will take some time.");
            }
        } else if (target) {
            // Reboot specific room CA panel
            const roomCode = target.toUpperCase(); // Use uppercase for room codes
            const room = gameSettings.locations[roomCode];

            if (gameState.caPanelStatus === 'broken') {
                appendOutput("The main Control Archives panels are broken. Cannot reboot individual room panels.");
            } else if (!room || !room.friendlyName) {
                appendOutput(`Invalid room code: ${roomCode}.`);
            } else if (gameState.roomPanelStatus[roomCode] === 'working') {
                appendOutput(`Control panels for ${room.friendlyName} are already working.`);
            } else if (gameState.rebootRoomCaProgress[roomCode] !== undefined) {
                appendOutput(`Reboot for ${room.friendlyName} panels is already in progress.`);
            } else {
                // Start reboot for the specific room
                gameState.rebootRoomCaProgress[roomCode] = 0; // Initialize progress
                appendOutput(`Initiating reboot for control panels in ${room.friendlyName}.`);
                // The actual fixing will happen in updateControlArchives
            }
        } else {
            appendOutput("Usage: reboot ca [all/room_code]");
        }
    } else if (component) {
        // Existing reboot logic for other components
        rebootReactorComponent(component);
    } else {
        appendOutput("Usage: reboot [component]");
    }
}


function statCommand(args) {
    const target = args[0]?.toLowerCase(); // Ensure target is lowercase for consistent comparison
    const validSectors = ['reactor', 'lab', 'utility', 'hallway'];

    if (!target || target === 'all') {
        // Stat All
        appendOutput("--- Facility Status Summary ---"); // Header
        // Example: Display critical reactor stats, player health, security level
        appendOutput(`Reactor Status: ${gameState.core_active ? 'Active' : 'Inactive'}`);
        appendOutput(`Reactor Temp: ${gameState.reactor_temp.toFixed(1)} C`);
        appendOutput(`Reactor Power: ${gameState.reactor_power_output.toFixed(1)} MW`);
        appendOutput(`Backup Oil: ${gameState.backup_generator_oil.toFixed(1)}%`);
        appendOutput(`Coffee/Tea: ${gameState.inventory.coffeeTea}`);
        appendOutput(`Repair Tool: ${gameState.inventory.repairToolDurability.toFixed(1)}%`);
        appendOutput(`Hunger: ${gameState.hungerLevel.toFixed(1)}`);
        appendOutput(`Insomnia: ${gameState.insomniaLevel.toFixed(1)}`);
        appendOutput(`Sanity: ${gameState.sanity.toFixed(1)}`);
        // Display inventory details
        appendOutput("--- Inventory ---");
        for (const item in gameState.inventory) {
            appendOutput(`${item.charAt(0).toUpperCase() + item.slice(1).replace(/([A-Z])/g, ' $1').trim()}: ${gameState.inventory[item]}`);
        }
        // appendOutput(`Hiding: ${gameState.isHiding ? 'Yes' : 'No'}`); // Moved to Player Status
        appendOutput(`Player Health: Needs Implementation`); // TODO: Implement Player Health
        appendOutput(`Security Level: Needs Implementation`); // TODO: Implement Security Level
        appendOutput("-------------------------------"); // Footer
    } else if (target === 'player' || target === '@') {
        // Stat Player
        appendOutput("--- Player Status ---");
        appendOutput(`Current Location: ${getUserFriendlyLocationName(gameState.currentLocation)}`);
        appendOutput(`Player State: ${gameState.playerState}`);
        appendOutput(`Time: ${gameState.inGameTime.toFixed(1)}`); // Assuming inGameTime is a number
        appendOutput(`Money: $${gameState.playerMoney.toFixed(2)}`);
        appendOutput(`Hiding: ${gameState.isHiding ? 'Yes' : 'No'}`);
        // Display inventory details
        appendOutput("--- Inventory ---");
        for (const item in gameState.inventory) {
             appendOutput(`${item.charAt(0).toUpperCase() + item.slice(1).replace(/([A-Z])/g, ' $1').trim()}: ${gameState.inventory[item]}`);
        }
        appendOutput("---------------------");
    } else if (validSectors.includes(target)) {
        // Stat Sector
        const sectorName = target.charAt(0).toUpperCase() + target.slice(1);
        appendOutput(`--- ${sectorName} Sector Status ---`);

        if (target === 'reactor') {
            // Reactor Sector Stats
            appendOutput(`Core Active: ${gameState.core_active ? 'Yes' : 'No'}`);
            appendOutput(`Temperature: ${gameState.reactor_temp.toFixed(1)} C`);
            appendOutput(`Pressure: ${gameState.reactor_pressure.toFixed(1)} MPa`);
            appendOutput(`Power Output: ${gameState.reactor_power_output.toFixed(1)} MW`);
            appendOutput(`Pump Speed: ${gameState.pump_speed.toFixed(0)}%`);
            // Assuming component statuses are stored directly or accessible via a function
            appendOutput(`Reactor Pump Status: ${gameState.reactor_pump_status || 'Status Unknown'}`); // Placeholder, update with actual gameState property
            appendOutput(`Turbine Status: ${gameState.turbine_status || 'Status Unknown'}`); // Placeholder
            appendOutput(`Generator Status: ${gameState.generator_status || 'Status Unknown'}`); // Placeholder
            appendOutput(`Coolant Level: ${gameState.coolant_level ? gameState.coolant_level.toFixed(1) + '%' : 'Status Unknown'}`); // Placeholder
        } else if (target === 'lab') {
            // Lab Sector Stats
            // TODO: Add stats for Laboratory, Decontamination Room, Bunker
            appendOutput("Laboratory, Decontamination Room, and Bunker status checks need implementation.");
    } else if (target === 'hallway') {
        // Hallway Movement Check (Special Case)
        appendOutput("--- Hallway Status ---");
        if (gameState.recentHallwayMovement) {
            appendOutput("You detect recent movement in the hallways.");
            gameState.recentHallwayMovement = false; // Reset after checking
        } else {
            appendOutput("The hallways seem quiet for now.");
        }
        appendOutput("----------------------");
        // Hallway Movement Check (Special Case)
        appendOutput("Checking hallways for movement..."); // Placeholder
    }else if (target === 'utility') {
            // Utility Sector Stats
            // TODO: Add stats for Ventilation, Electrical, Generators, Servers, Control Room
            appendOutput("Ventilation, Electrical, Generators, Servers, and Control Room status checks need implementation.");
        }
 appendOutput(`Control Archives Panels: ${gameState.caPanelStatus}`);
            appendOutput(`Ventilation Status: ${gameState.ventilationStatus}`);
            appendOutput(`Ventilation Blockage: ${gameState.ventilationBlockageLevel.toFixed(1)}%`);

        appendOutput("----------------------------");
    } else {
        // Stat Room (Detailed for a specific room)
        const roomCode = target;
        const room = gameSettings.locations[roomCode];

        if (room) {
            appendOutput(`--- ${room.friendlyName} Status ---`);
            appendOutput(room.description);

            const exits = Object.keys(room.exits).map(exitKey => `${exitKey} (${getUserFriendlyLocationName(room.exits[exitKey])})`).join(', ');
            appendOutput(`Exits: ${exits || 'None'}`);

            // Room-specific stats
            switch (roomCode) {
                case 'RR': // Reactor Room
                    appendOutput(`Current Temperature: ${gameState.reactor_temp.toFixed(1)} C`);
                    appendOutput(`Current Pressure: ${gameState.reactor_pressure.toFixed(1)} MPa`);
                    // TODO: Add status of main reactor components in RR
                    break;
                case 'SF': // Sphere Foundry
                    // TODO: Add status of foundry machinery, processes, material levels
                    appendOutput("Sphere Foundry status details need implementation.");
                    break;
                case 'PC': // Pump Control
                    appendOutput(`Coolant Pump Status: ${gameState.reactor_pump_status || 'Status Unknown'}`);
                    // TODO: Add coolant flow rate, reservoir level
                    appendOutput("Pump Control details need implementation.");
                    break;
                case 'TR': // Turbine Room
                    appendOutput(`Turbine Status: ${gameState.turbine_status || 'Status Unknown'}`);
                    // TODO: Add power generation rate
                    appendOutput("Turbine Room details need implementation.");
                    break;
                case 'CP': // Coolant Processing
                    // TODO: Add status of processing equipment, coolant purity
                    appendOutput("Coolant Processing details need implementation.");
                    break;
                case 'BW': // Bad-Water Treatment
                    // TODO: Add status of waste processing, radiation levels
                    appendOutput("Bad-Water Treatment details need implementation.");
                    break;
                case 'LAB': // Laboratory
                    // TODO: Add status of research equipment, experiments, analysis
                    appendOutput("Laboratory details need implementation.");
                    break;
                case 'DCR': // Decontamination Room
                    // TODO: Add decontamination cycle status, radiation levels
                    appendOutput("Decontamination Room details need implementation.");
                    break;
                case 'B': // Bunker
                    // TODO: Add bunker door status, air supply
                    appendOutput("Bunker details need implementation.");
                    break;
                case 'Vent': // Ventilation
                    // TODO: Add status of fans, air quality
                    appendOutput(`Ventilation Status: ${gameState.ventilationStatus}`);
                    appendOutput(`Ventilation Blockage: ${gameState.ventilationBlockageLevel.toFixed(1)}%`);
                    // appendOutput("Ventilation details need implementation.");
                    break;
                case 'Elect': // Electrical
                    // TODO: Add power distribution status, breaker status
                    appendOutput("Electrical details need implementation.");
                    break;
                case 'CA': // Control Archives
                    // TODO: Add access status, data retrieval progress
                    appendOutput("Control Archives details need implementation.");
                    break;
                case 'GR': // Generators
                    appendOutput(`Generator Status: ${gameState.generator_status || 'Status Unknown'}`);
                    // TODO: Add fuel/oil levels (oil is in stat all/player, but maybe also here?)
                    appendOutput("Generator details need implementation.");
                    break;
                case 'SR': // Servers
                    // TODO: Add server status, network connectivity
                    appendOutput("Server details need implementation.");
                    break;
                case 'CR': // Control Room
                    // TODO: Add status of main control console, alarm status
                    appendOutput("Control Room details need implementation.");
                    break;
                // Hallways (HW1-5)
                case 'HW1':
                case 'HW2':
                case 'HW3':
                case 'HW4':
                case 'HW5':
                    // TODO: Add logic to indicate if monster movement has been detected in this specific hallway
                    appendOutput(`Checking ${room.friendlyName} for movement...`);
                    break;
                default:
                    // No specific stats for this room yet, just show basic info
                    break;
            }

            // TODO: Add logic to display presence of items or monsters in the room
            // appendOutput("Items present: [List items]");
            // appendOutput("Monsters present: [List monsters]");

            appendOutput("--------------------------");
        } else {
            // If the target is not 'all', 'player', a valid sector, or a valid room code
            appendOutput("Usage: stat [all/player/@/sector/room]");
            appendOutput("Sectors: reactor, lab, utility");
            appendOutput("Rooms: Use room codes (e.g., RR, SF, PC, CR)");
        }
    }
}

function overclockCommand([component]) {
    if (component) {
        overclockReactorComponent(component);
    } else {
        appendOutput("Usage: overclock [component]");
    }
}

function upgradeCommand([component]) {
    if (component) {
        upgradeReactorComponent(component);
    } else {
        appendOutput("Usage: upgrade [component]");
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