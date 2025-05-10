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