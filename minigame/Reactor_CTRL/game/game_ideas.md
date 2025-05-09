# FNAF 1-like Game Ideas in Ren'Py

## Core Concept

Players are a technician maintaining a critical reactor facility under unusual circumstances. The core loop involves managing reactor parameters, maintaining a backup generator, dealing with system breakdowns (potentially caused by external factors), managing personal survival needs (hunger, insomnia, sanity), and interacting with a terminal interface. Survival through multiple in-game days is the primary goal.

## Ren'Py Strengths and Limitations for this project

**Strengths:**

*   **Visuals:** Excellent handling of static images and scene transitions, ideal for displaying camera feeds, office views, and jump scares.
*   **Interface:** Screen language allows for creating complex interactive terminal interfaces.
*   **Scripting:** Ren'Py's scripting is well-suited for managing the flow of the game (time progression, event triggers, game over states).
*   **Audio:** Strong support for background music, ambient sounds, and crucial sound effects for animatronic movements and jump scares.
*   **Choices:** Can be used for simple interactions like checking cameras or using doors/lights.

**Limitations:**

*   **Real-time Interaction:** Not designed for rapid, precise real-time input or physics-based interactions. Implementing the quick reflexes needed for doors and lights will require creative scripting.
*   **Animation:** Limited built-in support for complex character animations.
*   **Complex Game Logic:** Managing multiple independent animatronic AI states, timers, and resource consumption will heavily rely on integrating Python code.

## Key Game Mechanics

*   **Three-Phase Game Loop:** The game is divided into three distinct phases cycling over a 24-hour in-game day:
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

*   **Static Images:** Used for the facility environment, terminal interface, and potentially visual cues for survival penalties or events.
*   **Visual Effects:** Screen overlays or effects to represent survival penalties (e.g., blur for hunger, flickering for insomnia, distortion for paranoia/overdose).
*   **Sound Design:** Crucial for atmosphere, alerts, system sounds, and potential creature noises.
*   **Power Management:** A power meter that constantly decreases over time and when using lights or doors. Running out of power leads to a game over.
*   **Animatronic AI (Basic):** Each animatronic will have a predefined path or set of possible locations. Their movement will be based on timers, randomness, and potentially player actions. When an animatronic reaches the office doors, it becomes a threat.

## Visuals and Audio

*   **Static Images:** High-quality static images will be used for all camera views, office views (with doors open/closed, lights on/off), and animatronic positions.
*   **Jump Scares:** Full-screen, sudden static images of animatronics accompanied by loud, jarring sound effects.
*   **Sound Design:** Crucial for atmosphere and player cues. Includes ambient office sounds, camera static, animatronic movements (footsteps, noises), door/light sounds, and jump scare audio.
*   **Music:** Sparse, tense background music during the night, transitioning to more intense music or silence during critical moments.

## Potential Challenges

*   Implementing robust and believable animatronic AI using Python.
*   Creating a convincing sense of real-time pressure and reaction time within Ren'Py's turn-based nature.
*   Managing the various timers and states for multiple animatronics and the power meter simultaneously.
*   Acquiring or creating all the necessary visual and audio assets.

## Ideas for Ren'Py Implementation

*   **Python for Logic:** Extensive use of Python within `init python` to manage all game state variables, calculations (reactor, generator, survival), event triggers, and terminal command parsing.
*   **Real-time Updates:** Use `renpy.update(realtime=True)` within a game loop label to handle continuous time progression and trigger updates to game state variables based on elapsed real time (`dt`).
*   **Screen Language:** Use Ren'Py's Screen Language to create the UI elements for the camera map, camera view display, power meter, and door/light buttons.
*   **Image Changes:** Use `show` and `hide` statements with different image variants (e.g., `show office_door_left_closed`, `show camera_hallway_foxy`) based on game state.
*   **Sound Channels:** Use different audio channels for background music, ambient sounds, and character-specific sound effects.
*   **Persistent Data:** Use `persistent` variables to track progress across nights.