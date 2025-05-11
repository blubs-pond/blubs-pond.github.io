import { appendOutput } from './ui.js';

async function processCommand(command) {
    appendOutput(`> ${command}`); // Echo command
}

export { processCommand };