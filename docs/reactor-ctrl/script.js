// Game Settings
let gameSettings = {
    soundEnabled: true,
    musicEnabled: true,
    showGameName: true // Example setting based on gui.show_name
};

// Function to save settings to localStorage
function saveSettings() {
    localStorage.setItem('reactorGameSettings', JSON.stringify(gameSettings));
    console.log("Settings saved.");
}

// Function to load settings from localStorage
function loadSettings() {
    const savedSettings = localStorage.getItem('reactorGameSettings');
    if (savedSettings) {
        gameSettings = JSON.parse(savedSettings);
        console.log("Settings loaded.");
        // TODO: Apply loaded settings (e.g., set initial volume)
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadSettings(); // Load settings when the page starts

    const outputArea = document.getElementById('output-area');
    const commandInput = document.getElementById('command-input');

    // Function to append text to the output area
    function appendOutput(text) {
        outputArea.innerHTML += `<p>${text}</p>`;
        // Scroll to the bottom
        outputArea.scrollTop = outputArea.scrollHeight;
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
            // TODO: Add game initialization logic
        } else if (primaryCommand === 'help') {
            appendOutput("Available commands: start, help, look");
            appendOutput("Settings commands: settings show, settings sound [on/off], settings music [on/off]");
            appendOutput("Other commands: about");
        } else if (primaryCommand === 'look') {
            appendOutput("You look around. It's dark.");
            // TODO: Add context-aware look description
        } else if (primaryCommand === 'settings') {
            if (secondaryCommand === 'show') {
                appendOutput("--- Current Settings ---");
                appendOutput(`Sound: ${gameSettings.soundEnabled ? 'On' : 'Off'}`);
                appendOutput(`Music: ${gameSettings.musicEnabled ? 'On' : 'Off'}`);
                appendOutput(`Show Game Name: ${gameSettings.showGameName ? 'On' : 'Off'}`);
                appendOutput("------------------------");
            } else if (secondaryCommand === 'sound') {
                if (tertiaryCommand === 'on') {
                    gameSettings.soundEnabled = true;
                    appendOutput("Sound enabled.");
                    // TODO: Implement actual sound enabling logic
                    saveSettings(); // Save settings after change
                } else if (tertiaryCommand === 'off') {
                    gameSettings.soundEnabled = false;
                    appendOutput("Sound disabled.");
                    // TODO: Implement actual sound disabling logic
                    saveSettings(); // Save settings after change
                } else {
                    appendOutput("Invalid sound setting. Use 'settings sound on' or 'settings sound off'.");
                }
            } else if (secondaryCommand === 'music') {
                if (tertiaryCommand === 'on') {
                    gameSettings.musicEnabled = true;
                    appendOutput("Music enabled.");
                    // TODO: Implement actual music enabling logic
                    saveSettings(); // Save settings after change
                } else if (tertiaryCommand === 'off') {
                    gameSettings.musicEnabled = false;
                    appendOutput("Music disabled.");
                    // TODO: Implement actual music disabling logic
                    saveSettings(); // Save settings after change
                } else {
                    appendOutput("Invalid music setting. Use 'settings music on' or 'settings music off'.");
                }
            } else {
                appendOutput("Invalid settings command. Use 'settings show' or 'settings sound/music [on/off]'.");
            }
        } else if (primaryCommand === 'about') {
            // TODO: Get the actual about text from somewhere (maybe a variable or a separate file)
            appendOutput("--- About Reactor Control (CLI Edition) ---");
            appendOutput("Version: alpha_1.0"); // Example version
            appendOutput("Developed by: ClockWorksProduction Studio");
            appendOutput("-----------------------------------------");
        }
        // TODO: Add more command handling here
        else {
            appendOutput("Unknown command. Type 'help' for a list of commands.");
        }

        commandInput.value = ''; // Clear the input field
    }

    // Event listener for the input field (when user presses Enter)
    commandInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent default form submission
            const command = commandInput.value;
            if (command) {
                processCommand(command);
            }
        }
    });

    console.log('script.js loaded successfully!');
});
