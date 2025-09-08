
import { CentralTerminal, EditorAddon, RpsAddon } from '@clockworksproduction-studio/cwp-open-terminal-emulator';
import { populateFileSystem } from './filesystem_addon.js';
import { ReactorAddon } from './games/rctrl.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const term = new CentralTerminal('#central-terminal-container');

    term.registerAddon(new EditorAddon());
    term.registerAddon(new RpsAddon());
    term.registerAddon(new ReactorAddon());

    populateFileSystem(term.vfs);

    await term.boot();

    term._print("\nCWP Open Terminal Emulator v5.1.4");
    term._print("(c) 2025 ClockWorks Production Studio");
    term._print("Type 'help' to see available commands.\n");

  } catch (error) {
    console.error("Failed to initialize terminal:", error);
    const container = document.querySelector('#central-terminal-container');
    if (container) {
      container.innerHTML = `
        <div style="color: red; font-family: monospace; padding: 1em;">
          <h2>Error Initializing Terminal</h2>
          <p><strong>Error:</strong> ${error.message}</p>
          <p>Please check the console for more details.</p>
        </div>
      `;
    }
  }
});


