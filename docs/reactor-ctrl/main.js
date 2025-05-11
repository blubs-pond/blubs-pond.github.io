import { processCommand } from './gameLogic.js'; // Corrected import path
import { gameLoop } from './gameLogic.js'; // gameLoop is also in gameLogic.js
import { appendOutput } from './ui.js'; // Make sure appendOutput is imported

document.addEventListener('DOMContentLoaded', () => {
    const commandInput = document.getElementById('command-input');

    if (commandInput) {
        commandInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // Prevent default form submission
                handleUserCommand(commandInput.value.trim());
            }
        });
    } else {
        console.error('Error: Could not find element with ID "command-input". Command input will not work.');
        // Provide feedback to the user in the output area as well
        appendOutput('Error: Command input is not available.');
    }

    // Start the game loop
    requestAnimationFrame(gameLoop);

    // Initial message to the user
    appendOutput('Reactor Control System Initiated. Type "help" for commands.'); // Initial prompt
});

function handleUserCommand(command) {
    if (!command) {
        // appendOutput(''); // Or provide a different message for empty input if desired
        return; // Skip empty input but don't add to output
    }
    processCommand(command);
    // Clear the input field
    const commandInput = document.getElementById('command-input');
    if (commandInput) {
        commandInput.value = '';
    }
}
