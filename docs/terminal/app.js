import { CentralTerminal, BootCheck, VOS, RpsAddon, EditorAddon } from '@clockworksproduction-studio/cwp-open-terminal-emulator';

document.addEventListener('DOMContentLoaded', async () => {
  const rootElement = '#pseudo-terminal';
  
  try {
    const term = new CentralTerminal(rootElement, {
      inputSelector: '#terminal-command-input',
      outputSelector: '#terminalOutput',
      promptSelector: '#terminal-prompt'
    });

    // Import the file system structure
    // Correct way to load the VFS from JSON
    try {
      const response = await fetch('./js/file-system.json');
      const vfsData = await response.json();
      // Assign a NEW VOS instance created from the JSON to the terminal
      term.vOS = VOS.fromJSON(vfsData);
    } catch (error) {
      console.error('Failed to load Virtual File System:', error);
    }

    // --- Register Addons ---
    term.registerAddon(new EditorAddon());
    term.registerAddon(new RpsAddon());

    // --- Boot the Terminal ---
    await term.boot();

    // --- Post-Boot Welcome Message ---
    term._print("Type 'help' to see available commands.\n");

  } catch (err) {
    console.error("Fatal: Failed to initialize terminal:", err);
    const root = document.querySelector(rootElement);
    if(root) {
      root.innerHTML = '<div style="color: #ff4d4d; font-family: monospace; padding: 1em;"><strong>FATAL ERROR</strong><br>Could not initialize terminal.<br>See browser console (F12) for technical details.</div>__';
    }
  }
});
