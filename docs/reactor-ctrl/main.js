function gameLoop(timestamp) {
    if (!lastUpdateTime) lastUpdateTime = timestamp;
    const dt = (timestamp - lastUpdateTime) / 1000; // in seconds
    lastUpdateTime = timestamp;

    updateGameState(dt); // Update time + phase
    updateGame();        // Call your core logic
    requestAnimationFrame(gameLoop); // Keep the loop running
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