// New function to process user commands
export function processCommand(commandInput) {
    const [command, ...args] = commandInput.trim().toLowerCase().split(' '); // Split command and arguments

    if (command === 'go') {
        handleGoCommand(args);
    } else if (command === 'help') { // Add a case for the 'help' command
        handleHelpCommand();
    }
    else {
        appendOutput(`Unknown command: ${command}`);
    }
}

// New function to handle the 'help' command
function handleHelpCommand() {
    appendOutput("Available commands:");
    appendOutput("- go [direction] (e.g., go north)");
    // Add other commands here as you implement them
    appendOutput("- help (Displays this help message)");
    // You could also add commands like 'look', 'inventory', 'examine', etc.
}

// ... (rest of your gameLogic.js code)
