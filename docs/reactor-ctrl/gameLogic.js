import { gameState } from './gameState.js';
import { gameSettings } from './gameSettings.js';
import { appendOutput } from './ui.js';

let lastUpdateTime = 0;
let gameTimeInMinutesReal = 0; // Initialize gameTimeInMinutesReal here
let currentPhase = "survival"; // Initial phase

export function gameLoop(timestamp) {
    if (!lastUpdateTime) lastUpdateTime = timestamp;
    const dt = (timestamp - lastUpdateTime) / 1000; // Time delta in seconds
    lastUpdateTime = timestamp;

    // Update game state and mechanics
    updateGameState(dt);
    updateGame(); // A function to contain other periodic updates
    updateReactorTemp(dt);
    updateReactorPowerOutput();
    updateControlArchives(dt);
    updateVentilation(dt); // Added ventilation update
    updateGeneratorOil(dt); // Added generator oil update


    // Continue the game loop if the game is not over
    if (!gameState.game_over) {
        requestAnimationFrame(gameLoop);
    }
}

function updateGameState(dt) {
    const realLifeMinutesElapsed = dt / 60.0;
    gameTimeInMinutesReal += realLifeMinutesMinutesElapsed; // Corrected variable name

    // Calculate in-game time (assuming 48 real minutes = 1 in-game day = 1440 in-game minutes)
    const totalInGameMinutes = (gameTimeInMinutesReal / 48.0) * 1440;
    const hours = Math.floor((totalInGameMinutes / 60) % 24);
    const minutes = Math.floor(totalInGameMinutes % 60);

    gameState.gameTime.hours = hours;
    gameState.gameTime.minutes = minutes;

    // Determine phase based on in-game hours
    const newPhase = getPhaseForTime(hours);
    if (newPhase !== currentPhase) { // Use the module-level currentPhase
        currentPhase = newPhase;
        handlePhaseTransition(newPhase);
    }
}

// Helper function to determine the game phase based on in-game hours
function getPhaseForTime(hours) {
    if (hours >= 6 && hours < 13) return "fixing"; // Example phases - adjust as needed
    if (hours >= 13) return "rest_payment";
    return "survival"; // Default phase
}

// Handles the transition between game phases
function handlePhaseTransition(phase) {
    appendOutput(`--- Phase changed: ${phase.toUpperCase()} ---`);
    // TODO: Trigger phase-specific setup like monster spawns, system changes, etc.
    // This is where you would add logic that happens ONLY when a phase changes.
}


// A function to contain other periodic updates that don't depend directly on dt in a complex way
function updateGame() {
    // This function can call other update functions that manage things like monster movement, sanity, etc.
    handleMonsterMovement();
    checkSanityEffects();
    checkWinLoseConditions();
}


function updateReactorTemp(dt) {
    // TODO: Implement reactor temperature logic
    // Factors to consider: base increase rate, cooling from pumps, effects of broken panels, meltdown threshold.
}

function updateVentilation(dt) {
    // TODO: Implement ventilation logic
    // Factors to consider: blockage increase, flushing, impact on sanity/health.
}

function updateGeneratorOil(dt) {
    // TODO: Implement generator oil logic
    // Factors to consider: consumption rate when reactor is off, oil leaks, running out of oil.
}

function updateReactorPowerOutput() {
    // TODO: Implement power output logic
    // Factors to consider: reactor temperature, pressure, core active status.
}

function updateControlArchives(dt) {
    // TODO: Implement Control Archives logic
    // Factors to consider: panel status (working, broken, rebooting), chance of breaking, reboot progress.
}

function handleMonsterMovement() {
    // TODO: Implement monster movement logic
    // Factors to consider: monster type, current phase, player location, visibility.
}

function checkSanityEffects() {
    // TODO: Implement sanity effects
    // Factors to consider: sanity level, events, monster encounters, environmental factors.
}

function checkWinLoseConditions() {
    // TODO: Implement win/lose conditions
    // Factors to consider: reactor meltdown, player death, completing objectives, time limits.
}

// This function parses the map string into a 2D array (matrix)
export function parseMapString(mapString) {
    const lines = mapString.trim().split('\n');
    const matrix = lines.map(line => line.split(''));
    return matrix;
}

// New function to process user commands
export function processCommand(commandInput) {
    const [command, ...args] = commandInput.trim().toLowerCase().split(' '); // Split command and arguments

    if (command === 'go') {
        handleGoCommand(args);
    } else {
        appendOutput(`Unknown command: ${command}`);
    }
}

// New function to handle the 'go' command
function handleGoCommand(args) {
    const direction = args[0]; // Get the direction (e.g., 'north', 'east')

    if (!direction) {
        appendOutput("Go where? You need to specify a direction.");
        return;
    }

    const currentLocationKey = gameState.player.location;
    const currentLocation = gameSettings.locations[currentLocationKey];

    if (!currentLocation) {
        appendOutput("Error: Your current location is not defined in gameSettings.locations.");
        console.error("Invalid player location key:", currentLocationKey);
        return;
    }

    const exits = currentLocation.exits;

    // Check if the direction is a valid exit
    if (exits && exits[direction]) {
        const nextLocationKey = exits[direction];
        const nextLocation = gameSettings.locations[nextLocationKey];

        if (nextLocation) {
            gameState.player.location = nextLocationKey; // Update player's location
            appendOutput(`You go ${direction} to the ${nextLocation.friendlyName}.`);
            // You might want to add a function here to display the description of the new location
        } else {
            appendOutput(`Error: The exit to ${nextLocationKey} is defined but the location is not found.`);
            console.error("Invalid next location key in exits:", nextLocationKey);
        }
    } else {
        appendOutput(`You cannot go ${direction} from here.`);
        // You might want to list the available exits here
    }
}

// You may need to export other functions as they are implemented and needed elsewhere
// export { updateReactorTemp, updateVentilation, updateGeneratorOil, updateReactorPowerOutput, updateControlArchives, processCommand }; // Added processCommand to export
