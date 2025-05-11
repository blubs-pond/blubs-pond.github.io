import { gameState } from './gameState.js';
import { 
    processCommand, 
    handlePhaseTransition, 
    updateReactorTemp, 
    updateGame, 
    updateReactorPowerOutput, 
    updateGeneratorOil 
} from './gameLogic.js'; 

import { displayMap, appendOutput } from './ui.js';

let lastUpdateTime = 0;
let gameTimeInMinutesReal = 0;
let currentPhase = "survival"; // Initial phase
let awaitingExitConfirmation = false; // Flag for exit confirmation

function gameLoop(timestamp) {
    if (!lastUpdateTime) lastUpdateTime = timestamp;
    const dt = (timestamp - lastUpdateTime) / 1000; // Time delta in seconds
    lastUpdateTime = timestamp;

    // Update game state and mechanics
    updateGameState(dt);
    updateGame(); 
    updateReactorTemp(dt); 
    updateReactorPowerOutput();

    // Continue the game loop if the game is not over
    if (!gameState.game_over) {
        requestAnimationFrame(gameLoop);
    }
}

function updateGameState(dt) {
    const realLifeMinutesElapsed = dt / 60.0;
    gameTimeInMinutesReal += realLifeMinutesElapsed;

    // Calculate in-game time
    const totalInGameMinutes = (gameTimeInMinutesReal / 48.0) * 1440; // 48 real minutes = 1 in-game day
    const hours = Math.floor((totalInGameMinutes / 60) % 24);
    const minutes = Math.floor(totalInGameMinutes % 60);
    gameState.gameTime.hours = hours;
    gameState.gameTime.minutes = minutes;

    // Determine phase based on in-game hours
    const newPhase = getPhaseForTime(hours);
    if (newPhase !== currentPhase) {
        currentPhase = newPhase;
        handlePhaseTransition(newPhase); // Handle phase change logic
    }
}

function getPhaseForTime(hours) {
    if (hours >= 6 && hours < 13) return "fixing";
    if (hours >= 13) return "rest_payment";
    return "survival"; // Default phase
}

document.addEventListener('DOMContentLoaded', () => {
    const outputArea = document.getElementById('output-area');
    const commandInput = document.getElementById('command-input');
    
    // Command input event listener
    commandInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent form submission
            handleUserCommand(commandInput.value.trim());
        }
    });

    console.log('script.js loaded successfully!');

    // Start the game loop
    requestAnimationFrame(gameLoop);
});

// Handle user input commands
function handleUserCommand(command) {
    if (!command) return; // Skip empty input

    if (awaitingExitConfirmation) {
        handleExitConfirmation(command);
    } else {
        processInputCommand(command);
    }
}

