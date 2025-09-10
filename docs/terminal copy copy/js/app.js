
import { CentralTerminal } from './lib/index.js';
import { FileSystemAddon } from './filesystem_addon.js';
import { ReactorControlGameAddon } from './games/rctrl.js';

async function initializeTerminal() {
  try {
    const term = new CentralTerminal('#central-terminal-container', {
      addons: [
        new FileSystemAddon(),
        new ReactorControlGameAddon(),
      ],
    });

    await term.boot();

    term.print('Terminal booted successfully. Type "help" for a list of commands.');

  } catch (error) {
    console.error('Failed to initialize terminal:', error);

    const container = document.querySelector('#central-terminal-container');
    if (container) {
      container.innerHTML = `
        <div style="color: red; font-family: monospace; padding: 1em;">
          <h2>Error Initializing Terminal</h2>
          <p><strong>Error:</strong> ${error.message}</p>
          <p>This is a critical failure. Please check the browser's developer console (F12) for more details.</p>
        </div>
      `;
    }
  }
}

document.addEventListener('DOMContentLoaded', initializeTerminal);
