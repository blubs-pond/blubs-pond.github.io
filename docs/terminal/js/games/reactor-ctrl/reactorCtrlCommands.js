import { appendTerminalOutput } from '../../ui.js';

async function processCommand(command) {
    appendTerminalOutput(`> ${command}`); // Echo command
}

export { processCommand };