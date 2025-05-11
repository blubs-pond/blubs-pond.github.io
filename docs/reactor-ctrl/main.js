import { processCommand } from './commands.js';

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
    }
});

function handleUserCommand(command) {
    if (!command) return; // Skip empty input
    processCommand(command);
    // Clear the input field
    const commandInput = document.getElementById('command-input');
    if (commandInput) {
        commandInput.value = '';
    }
}