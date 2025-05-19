# Ren'Py to Web Migration To-Do List

This list outlines the key tasks required to migrate the game from Ren'Py to a dynamic web application using HTML, CSS, and JavaScript, with a command-line interface (CLI) style and ASCII art.

## Phase 1: Setup and Core Structure

- [x] Create a new folder for the game within your `blubs-pond.github.io` repository (e.g., `reactor-game/`).
- [x] Create the basic project structure within the game folder:
    - `r-ctrl.html` (main game page)
    - `style.css` (for styling the CLI interface)
    - `script.js` (main game logic)
- [x] Set up a basic HTML layout in `r-ctrl.html` with a container for text output and an input area for player commands.
- [x] Apply CSS styling in `style.css` to create a terminal-like appearance (background color, text color, font, input field style).
- [x] Create a simple JavaScript file (`script.js`) that loads and runs a basic function to confirm the setup is working and perhaps displays a welcome message in the output area.
- [x] Ensure all file paths within your HTML, CSS, and JavaScript are relative to the game folder (e.g., `style.css`, `script.js`).
- [ ] (W3.CSS is optional now, but can still be used for basic layout if desired) - *This is optional and won't be marked as completed.*

## Phase 2: Core Text-Based Output and Input

- [x] Implement a system for displaying text output (dialogue, game information, ASCII art) in the output area. (Likely using `appendOutput` function)
- [x] Implement a system for capturing player input from the input area.
- [x] Implement a command parser in JavaScript to understand player commands. (Basic parsing is in `main.js`)
- [ ] Implement a system for displaying ASCII art.

## Phase 3: Game State Management

- [ ] Define JavaScript variables to hold the game state (current scene, inventory, resources, game time, monster states, etc.).
- [ ] Implement functions to update the game state based on player commands and game events.
- [ ] **(Removed) Implement a save game functionality.**
- [ ] **(Removed) Implement a load game functionality.** - *Marked as removed as per analysis.*

## Phase 4: Implementing Game Mechanics (Migrate from Ren'Py Logic)

- [x] Game Loop: Implement a game loop using `requestAnimationFrame` or intervals to handle continuous updates (like time progression, reactor simulation, and monster movement). (Implemented in `gameLogic.js`)
- [x] Time System: Implement the in-game time system (hours, minutes). (Implemented in `gameLogic.js`)
- [ ] Reactor Simulation:
    - Translate the Ren'Py logic for reactor parameters (temperature, pressure, power) into JavaScript.
    - [ ] Implement the rate changes and interactions between parameters.
    - [ ] Implement the power generation and consumption logic.
- [ ] Monster System:
    - [x] Migrate the monster data and properties (location, hostile, etc.). (Initial data in `gameState.js`)
    - Implement the monster movement logic (updating monster locations based on game time or events).
    - Implement monster interactions with the environment (described in text).
    - Implement monster-specific mechanics (described in text output).
- [ ] Door System:
    - Implement the door states (open, closed, held, damaged).
    - Implement functions to control the doors based on player commands and monster interactions.
    - Implement door durability and breaking logic (described in text output).
- [ ] Inventory and Resource Management:
    - Implement functions to add, remove, and track player inventory items (rations, coffee/tea, crucifixes).
    - Implement the spoilage mechanic for rations (described in text output).
    - Implement the effects of coffee/tea on sanity or other stats (described in text output).
- [ ] Sanity System:
    - [x] Implement the sanity variable and its decrease/increase logic. (Basic sanity variable and drain in `gameState.js` and `gameLogic.js`)
    - Implement the effects of low sanity (described in text output).
- [ ] Game Over Conditions:
    - [x] Implement checks for all game over conditions based on the updated game state. (Basic sanity game over in `gameLogic.js`)
    - Display the game over message and ASCII art.

## Phase 5: Visuals (Text-Based) and Audio

- [ ] Create or find ASCII art for game elements (monsters, locations, UI elements).
- [ ] Implement functions to display the appropriate ASCII art based on the game state. (This is part of the text output system, but specifically for ASCII art)
- [ ] Integrate sound effects and background music (if desired, though less common for pure CLI style).
- [ ] Implement text-based visual and audio cues for monster presence and actions.
- [ ] Refine the text output formatting for readability.

## Phase 6: Testing and Deployment

- [ ] Thoroughly test all game mechanics and systems through text commands.
- [ ] **(Removed) Test the save/load functionality.** - *Marked as removed.*
- [ ] Test on different browsers to ensure compatibility.
- [ ] Deploy the game to GitHub Pages (as a subpage or standalone).
- [ ] Test the deployed game on GitHub Pages.
