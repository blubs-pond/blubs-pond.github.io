<!-- This document outlines the design and core concepts for the Reactor-CTRL terminal game. -->

# Reactor-CTRL Game Design Document

Players are a technician maintaining a critical reactor facility under unusual circumstances. The core loop involves managing reactor parameters, maintaining a backup generator, dealing with system breakdowns (potentially caused by external factors), managing personal survival needs (hunger, insomnia, sanity), and interacting with a terminal interface. Survival through multiple in-game days is the primary goal.

## Ren'Py Strengths and Limitations for this project

## Core Game Mechanics
    *   **Survival Phase (00:00 - 06:00):** The most dangerous period. Focus on managing survival stats (hunger, insomnia, sanity). Random events, potential monster activity, and system failures are more likely. Real-time updates are crucial for stat degradation.
    *   **Fixing Phase (06:00 - 13:00):** Time for maintenance and repairs. Player has a limited pool of Action Points (AP) to perform actions like repairing equipment. Hunger level negatively impacts the maximum available AP at the start of this phase. Less danger than the Survival phase.
    *   **Rest and Payment Phase (13:00 - 00:00):** A relatively safe period for preparation and recovery. No major hostile events. Players receive their wage based on reactor performance. Allows for managing inventory and potentially recovering survival stats.
*   **Reactor Control:** Players monitor and adjust reactor parameters (temperature, pressure, coolant) via a terminal. Failure to maintain parameters can lead to power loss or meltdown (game over).
*   **Backup Generator:** Provides power when the reactor is offline. Requires fuel (oil cans) and maintenance (lubricant kits, part replacement). Can break down, especially after extended use or if parts are damaged/worn.
*   **System Breakdowns & Repair:** Various parts of the facility (e.g., pipes, generator components) can break or be sabotaged. Players use a repair tool (with durability) to fix them. The Fixing Phase is the primary time for repairs using Action Points.
*   **Terminal Interface:** The primary method of interaction for monitoring systems, controlling parameters, buying items, and receiving information/alerts. Commands like `status`, `buy`, `use`, `repair`, `set_pump_speed`, `restart_core`.
*   **Survival Stats:**
    *   **Hunger:** Increases over time. Reduced by consuming rations. High hunger reduces Action Points in the Fixing Phase.
    *   **Insomnia:** Increases over time. Reduced by using coffee/tea or resting (in the Rest phase). High insomnia can cause visual/gameplay penalties.
    *   **Sanity:** Decreases due to certain events, high insomnia, or specific penalties. Reaching zero sanity results in a game over (player goes insane).
*   **Resource Management:** Players must manage limited resources like oil cans, lubricant kits, rations, coffee/tea, money, and repair tool durability.
*   **Shop System:** Players can purchase resources and generator parts using money earned.
*   **Ration Spoilage:** Rations have a limited shelf life and will spoil over time (real-life or in-game minutes). Consuming spoiled rations could have negative effects on survival stats.
*   **Caffeine Mechanic:** Coffee/tea reduces insomnia and provides a temporary alertness boost.
*   **Caffeine Overdose:** Using coffee/tea too frequently (consecutively) can lead to an overdose state. This causes in-game time dilation (time appears slower) and a reduction in sanity, alongside other potential penalties.
*   **Wage System:** Players earn money based on the reactor's power output during the Rest and Payment Phase. This money is used to buy supplies.
*   **Creature/External Threat (Planned):** An external threat (monsters, saboteurs) is intended to be the cause of some system breakdowns and add danger during the Survival phase. Their actions will interact with the facility systems and player survival.

## Visuals and Audio
*   **Terminal Interface:** The primary visual element. Game state, messages, and command input are all displayed within the terminal.
*   **Visual Effects:** Screen overlays or effects to represent survival penalties (e.g., blur for hunger, flickering for insomnia, distortion for paranoia/overdose).
*   **Sound Design:** Crucial for atmosphere, alerts, system sounds, and potential creature noises.
*   **Power Management:** A power meter that constantly decreases over time and when using lights or doors. Running out of power leads to a game over.
*   **Creature Presence Cues:** Sound effects or subtle terminal messages to indicate creature proximity or actions.

## Potential Challenges

*   Implementing robust and believable creature AI within JavaScript.
*   Managing the various timers and states for multiple systems and creatures simultaneously.
*   Acquiring or creating all the necessary visual and audio assets.
*   Creating a compelling narrative and progression through multiple in-game days.

## JavaScript Implementation Structure

The game logic is structured across several JavaScript files:

*   `reactorCtrlMain.js`: The main entry point and orchestrator of the game loop. Handles user input events and initiates the game.
*   `reactorCtrlGameLogic.js`: Contains the core game update logic, including time progression, system state changes, monster movements, and survival stat management.
*   `reactorCtrlCommands.js`: Parses and processes player commands entered in the terminal, calling appropriate functions in `reactorCtrlGameLogic.js`.
*   `reactorCtrlGameState.js`: Defines and manages the central `gameState` object, holding all dynamic information about the player, facility, and creatures.
*   `reactorCtrlGameSettings.js`: Stores static game data and configuration, such as location details, adjacency matrix, and game parameters.
*   `../../ui.js` and `../../cmd.js`: Handle the terminal user interface, including displaying output and capturing player input.