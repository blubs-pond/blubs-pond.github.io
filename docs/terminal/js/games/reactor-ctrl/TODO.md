# Reactor Control Game - TODO List

This file outlines the tasks that need to be completed to rebuild and enhance the Reactor Control Game.

## Core Structure

*   [x] Define initial game state in `gameState.js`.
*   [x] Define game settings and configurations in `gameSettings.js`.
*   [x] Implement core game loop and update functions in `gameLogic.js` (e.g., update time, handle phase transitions, update reactor temp, update ventilation, update generator oil, update control archives).
*   [x] Implement command logic in `commands.js` (e.g., go, look, stat, fix, reboot, flush, cam, settings, about, exit, peak, start).
*   [ ] Implement UI update functions in `ui.js` (e.g., display map, update status displays).
*   [x] Integrate game logic and command processing in `main.js`.

## Game Features and Logic

*   Implement win/lose conditions.
*   Add monster behavior and interactions.
*   Add inventory and item usage.
*   Refine game balance and pacing.

## Specific Implementations

*   Complete the Control Archives breakdown and fixing logic.
*   Refine the `calculateCriticalTempIncreaseRate` function with specific values based on broken critical panels.
*   Implement the calling of `calculateCriticalTempIncreaseRate` when critical panels are fixed.
*   Flesh out specific command implementations (e.g., parameters for `fix`, `reboot`, `cam`, `settings`, `stat`).
*   Implement the visual display of the map in `ui.js`.
*   Implement the status displays for `stat` command in `ui.js`.

## Polish and Refinement

*   Add more detailed descriptions for locations and events.
*   Implement sound and music toggling based on settings.
*   Improve error handling and user feedback for invalid commands.
*   Review and refine game settings for balancing.