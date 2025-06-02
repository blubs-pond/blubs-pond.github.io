# Reactor Control (Terminal-Based) Game Plan

This document outlines the plan for developing a terminal-based game, blending elements of Iron Lung and a work simulation, set in an alternative Chernobyl universe.

## Core Concept and Setting

*   **Concept:** Survive and manage a deteriorating nuclear reactor facility under unusual circumstances. The reactor is on an inevitable path to meltdown; the goal is to last as long as possible against increasingly difficult odds. Players are a technician maintaining the facility.
*   **Setting:** A text-based, terminal interface representing a claustrophobic reactor control room. The game relies on descriptive text and potentially ASCII art to convey the environment.
*   **Art Style:** Primarily text-based, with potential use of ASCII art for visual representation of the reactor, creatures, and environment. Dark, atmospheric, and gritty descriptions will evoke a similar feel to Iron Lung.

## Core Game Mechanics

1.  **Reactor Management (Work Sim):**
    *   **Functionality:** Monitor critical reactor parameters (e.g., temperature, pressure, coolant levels, radiation) displayed via the terminal.
    *   **Interaction:** Use terminal commands to adjust parameters and counteract negative changes caused by time or external factors.  Commands like `set_pump_speed`, `restart_core`.
    *   **Deterioration:** Parameters naturally worsen over time, accelerating the meltdown process.
2.  **External Factors & Potential Creatures:**
    *   **Threats:** System breakdowns potentially caused by external factors. An external threat (monsters, saboteurs) is intended to be the cause of some system breakdowns and add danger during the Survival phase. Their actions will interact with the facility systems and player survival.
3.  **Backup Generator:**
    *   **Functionality:** Provides power when the reactor is offline.
    *   **Requirements:** Requires fuel (oil cans) and maintenance (lubricant kits, part replacement).
    *   **Failure:** Can break down, especially after extended use or if parts are damaged/worn.
4.  **System Breakdowns & Repair:**
    *   **Occurrence:** Various parts of the facility (e.g., pipes, generator components) can break or be sabotaged.
    *   **Repair:** Players use a repair tool (with durability) to fix them using the `repair` command. The Fixing Phase is the primary time for repairs using Action Points.
5.  **Terminal Interface:**
    *   **Primary Interaction:** The primary method of interaction for monitoring systems, controlling parameters, buying items, and receiving information/alerts.
    *   **Commands:** Examples include `status`, `buy`, `use`, `repair`, `set_pump_speed`, `restart_core`, `help`, `look`, `go`, `inventory`, `examine`, `stat`.
6.  **Survival Stats:**
    *   **Hunger:**
        *   Increases over time.
        *   Reduced by consuming rations (`use rations`).
        *   High hunger reduces Action Points in the Fixing Phase.
    *   **Insomnia:**
        *   Increases over time.
        *   Reduced by using coffee/tea (`use coffee` or `use tea`) or resting (in the Rest phase).
        *   High insomnia can cause visual/gameplay penalties.
    *   **Sanity:**
        *   Decreases due to certain events, high insomnia, or specific penalties.
        *   Reaching zero sanity results in a game over (player goes insane).
7.  **Resource Management:**
    *   **Limited Resources:** Players must manage limited resources like oil cans, lubricant kits, rations, coffee/tea, money, and repair tool durability.
8.  **Shop System:**
    *   **Functionality:** Players can purchase resources and generator parts using money earned via the `buy` command.
9.  **Ration Spoilage:**
    *   **Mechanic:** Rations have a limited shelf life and will spoil over time (real-life or in-game minutes).
    *   **Consequences:** Consuming spoiled rations could have negative effects on survival stats.
10. **Caffeine Mechanic:**
    *   **Functionality:** Coffee/tea reduces insomnia and provides a temporary alertness boost.
11. **Caffeine Overdose:**
    *   **Mechanic:** Using coffee/tea too frequently (consecutively) can lead to an overdose state.
    *   **Consequences:** This causes in-game time dilation (time appears slower) and a reduction in sanity, alongside other potential penalties.
12. **Wage System:**
    *   **Functionality:** Players earn money based on the reactor's power output during the Rest and Payment Phase. This money is used to buy supplies.
13. **Game Phases (Time-Based):**
    *   **Survival Phase (00:00 - 06:00):** The most dangerous period. Focus on managing survival stats (hunger, insomnia, sanity). Random events and system failures are more likely. Real-time updates are crucial for stat degradation.
    *   **Fixing Phase (06:00 - 13:00):** Time for maintenance and repairs. Player has a limited pool of Action Points (AP) to perform actions like repairing equipment. Hunger level negatively impacts the maximum available AP at the start of this phase. Less danger than the Survival phase.
    *   **Rest and Payment Phase (13:00 - 00:00):** A relatively safe period for preparation and recovery. No major hostile events. Players receive their wage based on reactor performance. Allows for managing inventory and potentially recovering survival stats.
14. **Meltdown Progression:**
    *   **Mechanism:** The game's progression is tied to the worsening state of the reactor parameters.
    *   **Sabotage Impact:** Creature actions directly and significantly worsen reactor parameters, accelerating the inevitable meltdown.
    *   **Game End:** The game ends when critical reactor parameters reach dangerous levels, resulting in a meltdown and an uncertain fate for the protagonist.
15. **Game Over Conditions:**
    *   Reactor Meltdown (primary).
    *   Sanity Depletion (player goes insane).

## JavaScript Implementation Structure

The game logic is structured across several JavaScript files:

*   `reactorCtrlMain.js`: The main entry point and orchestrator of the game loop. Handles user input events and initiates the game.
*   `reactorCtrlGameLogic.js`: Contains the core game update logic, including time progression, system state changes, and survival stat management.  Also includes command handlers.
*   `reactorCtrlCommands.js`: Parses and processes player commands entered in the terminal, calling appropriate functions in `reactorCtrlGameLogic.js`.
*   `reactorCtrlGameState.js`: Defines and manages the central `gameState` object, holding all dynamic information about the player, facility, and .
*   `reactorCtrlGameSettings.js`: Stores static game data and configuration, such as location details, and game parameters.
*   `../../ui.js`: Handles the terminal user interface, including displaying output and capturing player input.

## Development Phases

1.  **Phase 1: Core Mechanics and Terminal Interface**
    *   Implement the core game loop and time progression.
    *   Create the basic terminal interface for displaying information and accepting commands.
    *   Implement the reactor parameter monitoring and basic deterioration.
    *   Implement the survival stats (hunger, insomnia, sanity) and their basic degradation.
2.  **Phase 2: Command Processing and Basic Interactions**
    *   Implement the command parser and basic commands (`status`, `help`, `look`).
    *   Implement the `set_pump_speed` command to control a reactor parameter.
    *   Implement the `use` command for rations and coffee/tea.
3.  **Phase 3: Resource Management and System Breakdowns**
    *   Implement the resource management system (oil cans, lubricant kits, repair tool).
    *   Implement the backup generator and its fuel/maintenance requirements.
    *   Implement system breakdowns and the `repair` command.
    *   Implement the shop system and the `buy` command.
4.  **Phase 4: Game Phases and Wage System**
    *   Implement the game phases (Survival, Fixing, Rest).
    *   Implement the Action Point system for the Fixing phase.
    *   Implement the wage system and its dependence on reactor performance.
5.  **Phase 5: External Factors and Balancing**
    *   Implement external factors that cause system breakdowns.
    *   Balance the game difficulty by adjusting parameters such as resource costs, degradation rates, and breakdown frequency.
6.  **Phase 6: Polish and Refinement**
    *   Refine the terminal interface and text descriptions.
    *   Add ASCII art for visual elements.
    *   Improve error handling and user feedback.
    *   Thoroughly test for bugs and gameplay issues.

This plan provides a structured approach to building the game, starting with core mechanics and gradually adding complexity and content. Remember that iterative development and testing will be crucial for balancing the gameplay and ensuring everything works together smoothly.
