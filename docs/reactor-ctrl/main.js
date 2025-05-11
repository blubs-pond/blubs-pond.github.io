import { gameState } from './gameState.js';
import { processCommand, handlePhaseTransition, updateReactorTemp, updateGame, updateReactorPowerOutput, updateGeneratorOil } from './gameLogic.js'; // Import necessary functions
import { displayMap, appendOutput } from './ui.js'; // Assuming displayMap and appendOutput are in ui.js

let lastUpdateTime = 0;
let gameTimeInMinutesReal = 0;
let currentPhase = "survival"; // Initial phase
let awaitingExitConfirmation = false; // Assuming this variable exists and is used in handleExitConfirmation

function gameLoop(timestamp) {
    if (!lastUpdateTime) lastUpdateTime = timestamp;
    const dt = (timestamp - lastUpdateTime) / 1000; // in seconds
    lastUpdateTime = timestamp;

    updateGameState(dt);
    updateGame(); // Call the main game update function (without dt unless needed inside)
    updateReactorTemp(dt); // Call the reactor update function
    updateReactorPowerOutput(); // Update reactor power output

    // TODO: Call other update functions here (monster movement, etc.)

    if (!gameState.game_over) { // Assuming gameState has a game_over flag
        requestAnimationFrame(gameLoop); // Keep the loop running
    }
}

// Note: updateGameState is moved here from gameLogic.js

function updateGameState(dt) {
    const realLifeMinutesElapsed = dt / 60.0;
    gameTimeInMinutesReal += realLifeMinutesElapsed;

    const totalInGameMinutes = (gameTimeInMinutesReal / 48.0) * 1440; // Assuming 48 real minutes = 1 in-game day
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
        handlePhaseTransition(newPhase); // This function should be in gameLogic.js or ui.js
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const outputArea = document.getElementById('output-area');
    const commandInput = document.getElementById('command-input');
    commandInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent default form submission
            const command = commandInput.value;
            if (command) {
                if (awaitingExitConfirmation) {
                    handleExitConfirmation(command);
                } else {
                    // Process commands here
                    const lowerCommand = command.toLowerCase().trim();
                    const commandParts = lowerCommand.split(' ');
                    const primaryCommand = commandParts[0];
                    const secondaryCommand = commandParts[1];

                    if (primaryCommand === 'map' && secondaryCommand) {
                        // You might need to pass gameState or relevant data to displayMap
                        displayMap(secondaryCommand); // Pass the state to displayMap
                    } else {
                        processCommand(command);
                    }
                }
            }
        }
    });

    console.log('script.js loaded successfully!');

    // Start the game loop
    requestAnimationFrame(gameLoop);
});