import { appendTerminalOutput } from './ui.js'; // Import the output function

document.addEventListener('DOMContentLoaded', () => {
    const terminalInput = document.getElementById('terminal-command-input');
    const terminalOutput = document.getElementById('terminalOutput'); // Get the output area

    // Focus the input field when the page loads
    terminalInput.focus();

    // Add event listener for the input field
    terminalInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent default form submission behavior

            const command = terminalInput.value.trim(); // Get the command and remove leading/trailing whitespace
            terminalInput.value = ''; // Clear the input field

            if (command) {
                // Process the command
                processCommand(command);
            }
        }
    });

    // Initial welcome message (optional)
    appendTerminalOutput("Welcome to the Blubs-Pond Terminal!");
    appendTerminalOutput("Type 'help' for a list of commands.");

});

// Function to process commands (initial version)
function processCommand(command) {
    // For now, just echo the command back to the terminal
    appendTerminalOutput(`> ${command}`); // Display the command the user entered

    // In the next steps, we will add logic to parse commands and route them
    // to the appropriate game or function.
}
