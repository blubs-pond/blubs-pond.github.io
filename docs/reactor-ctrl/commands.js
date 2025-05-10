// commands.js

// This file will contain the functions for processing player input
// and executing specific commands like go, look, cam, etc.

function processCommand(command) {
    const [action, ...args] = command.trim().toLowerCase().split(' ');
    switch (action) {
        case 'go':
            goCommand(args);
            break;
        case 'look':
            lookCommand(args);
            break;
        // Add other cases for different commands
        default:
            appendOutput("Unknown command. Type 'help' for a list of commands.");
    }
}

function goCommand(args) {
    // Logic for handling the 'go' command
}

function lookCommand(args) {
    // Logic for handling the 'look' command
}

// Add other command functions here

// function lookCommand(args) {
//     // Logic for handling the 'look' command
// }

// Add other command functions here