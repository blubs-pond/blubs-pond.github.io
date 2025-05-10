// Game Settings
let gameSettings = {
    failedDevices: {
        // Dummy data: replace with actual device IDs and coordinates
        "device1": { line: 7, column: 18 }, // Example coordinate in Spent Fuel Storage
        "device2": { line: 14, column: 65 }, // Example coordinate in Turbine Room
    },
    tasks: {
        // Dummy data: replace with actual task IDs and coordinates
        "task1": { line: 28, column: 38 }, // Example coordinate in Control Room
        "task2": { line: 37, column: 45 }, // Example coordinate in Bunker
    },
    soundEnabled: true,
    musicEnabled: true,
    showGameName: true, // Example setting based on gui.show_name
    doorHoldHungerCostPerSecond: 0.5, // Example cost, adjust as needed
    shadowLookSanityDrain: 5, // Example sanity drain when looking at Shadow
    facilityMap: `
┌─────────────┐ ┌───┐ ┌───────┐ ┌─────────────────────────┐ ┌───────┐ ┌───┐  ┌─────────────┐
│             │ │<5>│ │       │ │                         │ │       │ │<6>│  │             │
│             │ │   │ │       │ │                         │ │       │ │   │  │             │
│             │ │   │ │ <PC>  │ │                         │ │       │ │   │  │             │
│             └─┘   │ │       │ │                         │ │       │ │   │  │             │
│    <CP>           │ └─┐   ┌─┘ │                         └─┘       │ │   └──┘             │
│             ┌─┐   │ ┌─┘   └─┐ │                                   │ │<HW5>      <BW>     │
│             │ │   │ │       │ │          <RR>               <TR>  │ │   ┌──┐             │
│             │ │   │ │       │ │                         ┌─┐       │ │   │  │             │
│             │ │   │ │       └─┘                         │ │       │ │   │  │             │
└─────────────┘ │   │ │ <SF>                              │ │       │ │   │  └─────────────┘
┌─────────────┐ │   │ │       ┌─┐                         │ │       │ │   │                 
│             │ │   │ │       │ │                         │ │       │ │   │  ┌─────────────┐
│             └─┘   │ │       │ │                         │ │       │ │   │  │             │
│   <Vent>     <HW4>│ └───────┘ └──────────┬xxx┬──────────┘ └───────┘ │   │  │             │
│             ┌─┐   │                      │   │                      │   │  │             │
│             │ │   └──────────────────────┴xxx┴──────────────────────┘   └──┘             │
└─────────────┘ │                          <HW3>                                  <CA>     │
┌─────────────┐ │   ┌───────────┐   ┌─────────────────┐   ┌───────────┐   ┌──┐             │
│             │ │   │ ┌───────┐ │   │ ┌─────────────┐ │   │ ┌───────┐ │   │  │             │
│             │ │   │ │       │ │   │ │             │ │   │ │       │ │   │  │             │
│             │ │   │ │       │ │   │ │             │ │   │ │       │ │   │  │             │
│             │ │   │ │       │ │   │ │             │ │   │ │       │ │   │  │             │
│             │ │   │ │       └─┘   └─┤             ├─┘   └─┘       │ │   │  └─────────────┘
│             ├─┤   │ │         <HW1> x             x <HW2>         │ │   │                 
│             x x   │ │ <GR>  ┌─┐   ┌─┤    <CR>     ├─┐   ┌─┐  <SR> │ │   │  ┌─────────────┐
│    <LAB>    x x   │ │       │ │   │ │             │ │   │ │       │ │   │  │             │
│             x x   │ │       │ │   │ │      @      │ │   │ │       │ │   │  │             │
│             ├─┤   │ │       │ │   │ │             │ │   │ │       │ │   │  │             │
│             │ │   │ │       │ │<1>│ │             │ │<2>│ │       │ │   └──┘             │
│             │ │   │ └───────┘ └───┘ └────┬xxx┬────┘ └───┘ └───────┘ │          <Elect>   │
│             │ │<3>│                      │   │                      │   ┌──┐             │
│             │ └───┘ ┌────────────────────┘   └────────────────────┐ │   │  │             │
│             ├───────┤                                             │ │   │  │             │
│             x <DCR> x                     <B>                     │ │   │  │             │
│             ├───────┤                                             │ │<4>│  │             │
└─────────────┘       └─────────────────────────────────────────────┘ └───┘  └─────────────┘
`,

	machines: {
        // Dummy data: replace with actual machine IDs and coordinates
        "reactor": { line: 9, column: 47 }, // Example coordinate in Reactor Room
    },

	blastDoors: {
		// Approximate coordinates based on the map 'x' markers
		"door26_17_HW1": { line: 26, column: 17, isOpen: true }, // Hallway 1 section
		"door27_18_HW1": { line: 27, column: 18, isOpen: true }, // Hallway 1 section
		"door28_18_HW1": { line: 28, column: 18, isOpen: true }, // Hallway 1 section
		"door29_18_HW1": { line: 29, column: 18, isOpen: true }, // Hallway 1 section
		"door30_18_HW1": { line: 30, column: 18, isOpen: true }, // Hallway 1 section
		"door26_64_HW2": { line: 26, column: 64, isOpen: true }, // Hallway 2 section
		"door27_63_HW2": { line: 27, column: 63, isOpen: true }, // Hallway 2 section
		"door36_17_DCR": { line: 36, column: 17, isOpen: true }, // Decontamination Room entrance
		"door37_17_DCR": { line: 37, column: 17, isOpen: true }, // Decontamination Room section
		"door38_17_DCR": { line: 38, column: 17, isOpen: true }, // Decontamination Room exit

    },
};
// Helper to get user-friendly location name
function getUserFriendlyLocationName(locationId) {
return gameSettings.locations[locationId]?.friendlyName || locationId;
}

gameSettings.locations = {
    // Added friendlyName to locations for user-friendly display
    
};

let awaitingExitConfirmation = false; // Flag to track exit confirmation

// Game State
let gameState = {
    currentScene: 'start', // Start at a 'start' scene
    gameTime: { hours: 0, minutes: 0 },
	playerInventory: [], // Array of item strings
	playerLocation: "ControlRoom", // Add this line
    reactorState: {
        temperature: 500, // Example initial values
        pressure: 100,
        power: 0,
        fuel: 100,
        cooling: 50
    },
    monsterState: [], // Array of monster objects
    monsters: { // Object to track individual monster states
        "Shadow": { location: null, state: "dormant", isNearPlayer: false } // Initial state for Shadow, added isNearPlayer
    },
    doorState: {
        door1: { state: 'closed', durability: 100 },
        door2: { state: 'closed', durability: 100 }
    },
    playerMoney: 1000.0,
    oilCans: 2,
    lubricantKits: 1,
    rations: 0, // Assuming rations start at 0 based on the Ren'Py script example
    coffeeTea: 0, // Assuming coffee/tea starts at 0
    repairToolDurability: 100.0, // Assuming a starting repair tool
    hungerLevel: 0.0,
    insomniaLevel: 0.0,
    sanity: 100,
    caffeineEffectTimer: 0.0,
    caffeineCrashTimer: 0.0,
    caffeineOverdosed: false,
    hidingAbuseCounter: 0.0,
    isHiding: false,
    experimentEntryTimer: -1.0, // -1.0 if not in room
doorBeingHeld: "none", // Tracks which door is being held ('door1', 'door2', or 'none')
cameraState: { // Object to track the state of cameras
"camera1": { isDistorted: false }, // Example state property
"camera2": { isDistorted: false }
    },
    shadowVisible: false, // Track if the Shadow is currently visible on a camera
    
    gameFlags: {} // Object to store boolean flags
};

// Time variables
let lastUpdateTime = 0; // To track real-life time for delta calculation
let gameTimeInMinutesReal = 0; // Total real-life minutes elapsed

// Phase variable
let currentPhase = "survival"; // Assume starting in survival phase

// Function to update the game state based on elapsed time
function updateGameState(dt) {
    // dt is the time elapsed since the last update (in seconds)

    const realLifeMinutesElapsed = dt / 60.0; // Convert seconds to minutes
    gameTimeInMinutesReal += realLifeMinutesElapsed; // Track total real-life time elapsed

    // Convert real minutes to in-game time (assuming 48 real minutes = 1 in-game day, 1440 in-game minutes per day)
    const totalInGameMinutes = (gameTimeInMinutesReal / 48.0) * (24 * 60);
    gameState.gameTime.hours = Math.floor((totalInGameMinutes / 60) % 24);
    gameState.gameTime.minutes = Math.floor(totalInGameMinutes % 60);

    // Determine the current phase
    let newPhase = "survival"; // Default to survival
    if (gameState.gameTime.hours >= 6 && gameState.gameTime.hours < 13) {
        newPhase = "fixing";
    } else if (gameState.gameTime.hours >= 13 && gameState.gameTime.hours < 24) {
        newPhase = "rest_payment";
    }

    // Check for phase transition
    if (newPhase !== currentPhase) {
        currentPhase = newPhase;
        // TODO: Call phase-specific start functions here
    }
}

// Function to check if a monster is near the player while hiding
function checkHideMonster() {
    if (gameState.isHiding) {
        for (const monsterName in gameState.monsters) {
            if (gameState.monsters[monsterName].isNearPlayer) {
                return true; // A monster is near
            }
        }
    }
    return false; // Not hiding or no monster is near
}

// Function to check if looking at the Shadow on camera
function checkLookAtShadow(locationViewed) {
    // Check if the Shadow is active and in the viewed location
    if (gameState.monsters["Shadow"].state !== "dormant" && gameState.monsters["Shadow"].location === locationViewed) {
        gameState.shadowVisible = true;
        // Drain sanity if looking at the Shadow
        gameState.sanity = Math.max(0, gameState.sanity - gameSettings.shadowLookSanityDrain); // Ensure sanity doesn't go below 0
        appendOutput("You see the Shadow! Your sanity is draining!"); // Output message
    } else {
        gameState.shadowVisible = false;
    }
}

// Function to reboot a camera
function rebootCamera(cameraNumber) {
    const cameraKey = `camera${cameraNumber}`;
    if (gameState.cameraState[cameraKey]) {
        gameState.cameraState[cameraKey].isDistorted = false; // Example: reset distortion
        appendOutput(`Camera ${cameraNumber} rebooted.`);
    }
}

// Function to display the facility map
function displayMap() {
    let mapLines = gameSettings.facilityMap.split('\n');
    const playerLocation = gameState.currentLocation;
    const playerMarker = gameSettings.locations[playerLocation]?.mapMarker;

    // Function to place a marker on the map lines
    const placeMarker = (lines, { line, column }, marker) => {
        if (lines[line] !== undefined && lines[line][column] !== undefined) {
            lines[line] = lines[line].substring(0, column) + marker + lines[line].substring(column + marker.length);
        }
    };

    // Place player marker by replacing the mapMarker string
 if (playerMarker) {
        // Use a regular expression to find the marker, ignoring case
        const markerRegex = new RegExp(escapeRegExp(playerMarker), 'gi');

 for (let i = 0; i < mapLines.length; i++) {
            const line = mapLines[i];
            const match = markerRegex.exec(line);
 if (match) {
                const columnIndex = match.index;
                mapLines[i] = line.substring(0, columnIndex) + "<YOU>" + line.substring(columnIndex + match[0].length);
                break; // Assuming each marker is unique and appears once
            }
        }
    }

    // Determine which markers to display based on the state
    const state = arguments.length > 0 ? arguments[0] : 'default'; // Get the optional state argument

    switch (state) {
        case 'failed':
            // Display failed devices
            for (const deviceId in gameSettings.failedDevices) {
                const position = gameSettings.failedDevices[deviceId];
                placeMarker(mapLines, position, 'X');
            }
            break;
        case 'players':
            // Player location is already handled by replacing the mapMarker
            // Display monster locations (using the first character of their name)
            for (const monsterName in gameState.monsters) {
                const monster = gameState.monsters[monsterName];
                if (monster.mapPosition) { // Assuming monster state includes a mapPosition {line, column}
                    placeMarker(mapLines, monster.mapPosition, monsterName[0].toUpperCase());
                }
            }
            break;
        case 'show':
            // Display all important tasks, machines, failed devices, players, and monsters
            for (const taskId in gameSettings.tasks) {
                const position = gameSettings.tasks[taskId];
                placeMarker(mapLines, position, '$');
            }
            for (const machineId in gameSettings.machines) {
                const position = gameSettings.machines[machineId];
                placeMarker(mapLines, position, '%');
            }
            // Fall through to 'failed' and 'players' to include their markers
        case 'default':
            // Default state (shows player location and room markers) - already handled
            break;
    }

// TODO: Handle different map states (failed, players, show)
 // Join the lines back into a single string
    const finalMap = mapLines.join('\n');

    // Display the map in the map-area div
    const mapAreaElement = document.getElementById('map-area');
    if (mapAreaElement) {
        mapAreaElement.textContent = finalMap;
    } else {
        // Fallback to appending to output area if map-area doesn't exist
        appendOutput(finalMap);
    }
}
// Function to update the UI elements
function updateUI() {
    const inGameTimeElement = document.getElementById('inGameTime');
    if (inGameTimeElement) {
        inGameTimeElement.textContent = `${String(gameState.gameTime.hours).padStart(2, '0')}:${String(gameState.gameTime.minutes).padStart(2, '0')}`;
    }

    // TODO: Update other UI elements like player money, inventory, stats, etc.
    const playerMoneyElement = document.getElementById('playerMoney');
    if (playerMoneyElement) {
        playerMoneyElement.textContent = `$${gameState.playerMoney.toFixed(2)}`;
    }
    // Add updates for other new variables here
    // Example: document.getElementById('hungerLevel').textContent = gameState.hungerLevel.toFixed(1);
}

// Removed saveSettings and loadSettings functions

document.addEventListener('DOMContentLoaded', () => {
    // Removed call to loadSettings()

    const outputArea = document.getElementById('output-area');
    const commandInput = document.getElementById('command-input');

    // Helper function to escape special characters for regex
    function escapeRegExp(string) {
 return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }

    // Function to append text to the output area
    function appendOutput(text) {
        outputArea.innerHTML += `<p>${text}</p>`;
        // Scroll to the bottom
        outputArea.scrollTop = outputArea.scrollHeight;
    }

    // Game Loop
    function gameLoop(timestamp) {
        if (!lastUpdateTime) {
            lastUpdateTime = timestamp;
        }
        const dt = (timestamp - lastUpdateTime) / 1000; // Time delta in seconds
        lastUpdateTime = timestamp;

        updateGameState(dt); // Update the game state
        updateUI(); // Update the UI elements

        requestAnimationFrame(gameLoop); // Request the next frame
    }

    // Function to process commands
    function processCommand(command) {
        appendOutput(`> ${command}`); // Echo the command

        const lowerCommand = command.toLowerCase().trim();
        const commandParts = lowerCommand.split(' ');
        const primaryCommand = commandParts[0];
        const secondaryCommand = commandParts[1];
        const tertiaryCommand = commandParts[2];

        if (primaryCommand === 'start') {
            appendOutput("Starting the game...");
            requestAnimationFrame(gameLoop); // Start the game loop
            // TODO: Add game initialization logic
        } else if (primaryCommand === 'help') {
            appendOutput("Available commands: start, help, look, exit");
            appendOutput("Settings commands: settings show, settings sound [on/off], settings music [on/off]");
            appendOutput("Navigation commands: map, go [exit_name]");
            appendOutput("Observation commands: look, peak, cam [camera_number] [action]");
            // TODO: Add other commands as they are implemented (visit, interact, etc.)
            appendOutput("Other commands: about");
        } else if (primaryCommand === 'look') { 
            if (gameState.isHiding) {
                appendOutput("You need to unhide to look around properly. Use 'peak' to cautiously peek.");
            } else {
                const locationDescription = gameSettings.locations[gameState.currentLocation].description || "You are in an unknown location.";
                appendOutput(locationDescription);
            // TODO: Add context-aware look description
            }
        } else if (primaryCommand === 'go') {
            // Placeholder logic for go command
            const exitName = secondaryCommand;
            const currentLocation = gameState.currentLocation;
            if (gameSettings.locations[currentLocation]?.exits && gameSettings.locations[currentLocation].exits[exitName]) {
                const newLocationId = gameSettings.locations[currentLocation].exits[exitName];
                gameState.currentLocation = newLocationId;
                appendOutput(`You are now in the ${getUserFriendlyLocationName(newLocationId)}.`);
            } else {
                appendOutput(`You cannot go that way from here. Available exits: ${Object.keys(gameSettings.locations[currentLocation]?.exits || {}).join(', ') || 'None'}.`);
            }
        } else if (primaryCommand === 'peak') {
            // Placeholder logic for peak command
            if (gameState.isHiding) {
                if (checkHideMonster()) {
                    appendOutput("You hear something moving close by...");
                } else {
                    appendOutput("You cautiously peak from your hiding spot...");
                }
            } else {
                appendOutput("You need to be hiding to peak.");
            }
        } else if (primaryCommand === 'cam') {
            // Placeholder logic for cam command
            if (commandParts.length > 1) {
                const cameraNumber = commandParts[1];
                const action = commandParts[2]; // Get the optional action

                // Find the location associated with this camera feed (access is global for cam)
                const cameraLocation = Object.values(gameSettings.locations).find(loc => loc.cameraFeed === `camera${cameraNumber}`);

                if (cameraLocation) {
                    if (!action) {
                        // No action specified, just view the camera
                        appendOutput(`Viewing Camera ${cameraNumber}: ${cameraLocation.description}`); // Display camera description
                        checkLookAtShadow(cameraLocation.location); // Check for Shadow, passing the location property
                        // TODO: Add detailed camera view and Shadow logic here
                    } else if (action === 'reboot') {
                        appendOutput(`Attempting to reboot Camera ${cameraNumber}...`);
                        // TODO: Implement camera reboot logic
rebootCamera(cameraNumber);
} else {
                        appendOutput(`Invalid action for camera: ${action}`);
                    }
                } else {
                    appendOutput(`Camera ${cameraNumber} not found.`);
                    // List available cameras
                    const availableCameras = Object.values(gameSettings.locations)
                        .filter(loc => loc.cameraFeed)
                        .map(loc => loc.cameraFeed.replace('camera', '')); // Get just the number
                    appendOutput(`Available cameras: ${availableCameras.join(', ')}`);
                }
            } else {
                appendOutput("Usage: cam [camera_number]");
            }
        } else if (primaryCommand === 'settings') {
            if (secondaryCommand === 'show') {
                appendOutput("--- Current Settings ---");
                appendOutput(`Sound: ${gameSettings.soundEnabled ? 'On' : 'Off'}`);
                appendOutput("------------------------");
            } else if (secondaryCommand === 'sound') {
                if (tertiaryCommand === 'on') {
                    gameSettings.soundEnabled = true;
                    appendOutput("Sound enabled.");
                    // TODO: Implement actual sound enabling logic
                    // Removed call to saveSettings()
                } else if (tertiaryCommand === 'off') {
                    gameSettings.soundEnabled = false;
                    appendOutput("Sound disabled.");
                    // TODO: Implement actual sound disabling logic
                    // Removed call to saveSettings()
                } else {
                    appendOutput("Invalid sound setting. Use 'settings sound on' or 'settings sound off'.");
                }
            } else if (secondaryCommand === 'music') {
                if (tertiaryCommand === 'on') {
                    gameSettings.musicEnabled = true;
                    appendOutput("Music enabled.");
                    // TODO: Implement actual music enabling logic
                    // Removed call to saveSettings()
                } else if (tertiaryCommand === 'off') {
                    gameSettings.musicEnabled = false;
                    appendOutput("Music disabled.");
                    // TODO: Implement actual music disabling logic
                    // Removed call to saveSettings()
                } else {
                    appendOutput("Invalid music setting. Use 'settings music on' or 'settings music off'.");
                }
            } else {
                appendOutput("Invalid settings command. Use 'settings show' or 'settings sound/music [on/off]'.");
            }
        } else if (primaryCommand === 'about') {
            appendOutput("--- About Reactor Control (CLI Edition) ---");
            appendOutput("Version: Alpha_0.1"); // Example version
            appendOutput("Developed by: ClockWorksProduction Studio");
            // TODO: Get the actual about text from somewhere (maybe a variable or a separate file)
            appendOutput("--- About Reactor Control (CLI Edition) ---");
            appendOutput("Version: Alpha_0.1"); // Example version
            appendOutput("Developed by: ClockWorksProduction Studio");
            appendOutput("Developed for: twitch.tv/blubbyblubfish");
            appendOutput("-----------------------------------------");
        } else if (primaryCommand === 'exit') {
            appendOutput("Are you sure you want to exit? (yes/no)");
        } else if (primaryCommand === 'map') {
            // Display the facility map
displayMap();
            awaitingExitConfirmation = true; // Set flag
        }
        // TODO: Add more command handling here
        else {
            appendOutput("Unknown command. Type 'help' for a list of commands.");
        }

        if (!awaitingExitConfirmation) { // Only clear input if not waiting for confirmation
            commandInput.value = ''; // Clear the input field
        }
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


    // Event listener for the input field (when user presses Enter)
    commandInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent default form submission
            const command = commandInput.value;
            if (command) {
                if (awaitingExitConfirmation) {
                    handleExitConfirmation(command);
                } else {
                    const lowerCommand = command.toLowerCase().trim();
                    const commandParts = lowerCommand.split(' ');
                    const primaryCommand = commandParts[0];
                    const secondaryCommand = commandParts[1];

if (primaryCommand === 'map' && secondaryCommand) {
                        displayMap(secondaryCommand); // Pass the state to displayMap
} else {
processCommand(command);
                    }
                }
            }
        }
    });

    console.log('script.js loaded successfully!');
});