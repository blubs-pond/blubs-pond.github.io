# Ren'Py Reactor Control (FNAF-like) Game Plan

This document outlines the plan for developing a FNAF-like game in Ren'Py, blending elements of Iron Lung and a work simulation, set in an alternative Chernobyl universe.

## Core Concept and Setting

*   **Concept:** Survive and manage a deteriorating nuclear reactor in a Chernobyl alternative universe while fending off mutated creatures that attempt to sabotage the operation. The reactor is on an inevitable path to meltdown; the goal is to last as long as possible against increasingly difficult odds.
*   **Setting:** A claustrophobic and visually grim reactor control room. Multiple camera views will show different areas outside the control room where mutated creatures roam.
*   **Art Style:** Dark, atmospheric, and gritty, drawing inspiration from the visual style of Iron Lung. Primarily uses static images for backgrounds and creature appearances.

## Key Game Mechanics

1.  **Reactor Management (Work Sim):**
    *   **Functionality:** Monitor critical reactor parameters (e.g., temperature, pressure, coolant levels, radiation) displayed on UI elements.
    *   **Interaction:** Use on-screen controls (buttons, sliders - simulated) to adjust parameters and counteract negative changes caused by time or creature actions.
    *   **Deterioration:** Parameters naturally worsen over time, accelerating the meltdown process.
2.  **Mutated Creature Mechanics (FNAF 1 Style Movement/Monitoring):**
    *   **Movement:** Multiple mutated creatures move through predefined paths in areas viewable via cameras.
    *   **Detection:** Player must use the camera system to track creature locations and predict their approach.
    *   **Threats:** Creatures move towards the control room to directly attack the player or target specific reactor systems to sabotage them.
3.  **Camera System (FNAF 1 Style):**
    *   **Interface:** UI elements (buttons, map) to switch between different static camera views.
    *   **Monitoring:** Display background images for each camera location and overlay creature images if a creature is present in that location.
    *   **Limited Usage:** Potentially consumes power or has other limitations (e.g., distortion, delay).
4.  **Door and Light Mechanics (FNAF 1 Style):**
    *   **Functionality:** UI buttons to control doors and lights for adjacent areas or control room entrances.
    *   **Defense:** Doors block creature entry but consume resources (power).
    *   **Detection:** Lights briefly illuminate areas to check for creature presence, also consuming resources (power).
5.  **Resource Management (Primarily Power, potentially others):**
    *   **Power:** A core resource that constantly drains. Using lights, doors, and potentially some reactor controls accelerates power consumption. Running out of power is critical.
    *   **Other Resources:** Could include coolant, repair parts, or other consumables needed for reactor maintenance.
6.  **Meltdown Progression:**
    *   **Mechanism:** The game's progression is tied to the worsening state of the reactor parameters.
    *   **Sabotage Impact:** Creature actions directly and significantly worsen reactor parameters, accelerating the inevitable meltdown.
    *   **Game End:** The game ends when critical reactor parameters reach dangerous levels, resulting in a meltdown and an uncertain fate for the protagonist.
7.  **Jump Scares:**
    *   **Triggers:** Activated when a creature successfully reaches the player or a specific failure state is met.
    *   **Execution:** Sudden, full-screen visual (image or short animation) accompanied by loud audio.
8.  **Game Over Conditions:**
    *   Reactor Meltdown (primary).
    *   Creature successfully attacking the player.

## Implementation Strategy (Using Ren'Py and Python)

*   **Core Logic:** Implement the majority of the game's mechanics (timers, creature AI movement, resource management, reactor parameter changes, win/loss conditions) using **Python** within `init python:` blocks and `python:` blocks in the Ren'Py script.
*   **User Interface (UI):** Use **Ren'Py Screen Language** to create the control room interface, including:
    *   Displaying reactor parameters.
    *   Buttons for camera views, doors, lights, and reactor controls.
    *   Resource meters (power).
    *   Overlays for creature appearances on camera views.
*   **Visuals and Audio:** Use standard Ren'Py statements (`image`, `scene`, `show`, `hide`, `play sound`, `play music`) to manage the display of static assets and playback audio.
*   **Timing and Events:** Utilize `renpy.timeout()` for periodic events like power drain and creature movement ticks. Use Ren'Py labels and jumps to control game flow based on events and conditions.

## Development Phases

1.  **Phase 1: Basic Structure and UI (Core Loop)**
    *   Set up the Ren'Py project structure.
    *   Create a basic control room screen with placeholders for key UI elements.
    *   Implement a simple power variable and a timer to decrease it, displaying it on the UI.
    *   Create a basic camera switching system between a few static backgrounds.
2.  **Phase 2: Core Mechanics - Reactor and Creatures (Single)**
    *   Implement basic Python variables for a couple of reactor parameters.
    *   Add simple controls to affect these parameters.
    *   Create Python logic for one creature with a basic path and timer-based movement.
    *   Display the creature on camera views when it's in a visible location.
3.  **Phase 3: Interaction and Consequences**
    *   Implement door and light buttons and their visual changes.
    *   Connect doors/lights to power consumption.
    *   Implement basic creature interaction with doors (being blocked).
    *   Add basic creature sabotage that affects a reactor parameter.
4.  **Phase 4: Adding Complexity and Content**
    *   Add more mutated creatures with different paths and behaviors.
    *   Expand the reactor management with more parameters and interactions.
    *   Implement different types of creature sabotage.
    *   Create and integrate all necessary visual assets (backgrounds, creature states, jump scares).
    *   Create and integrate audio assets (ambient, creature sounds, jump scare sounds).
5.  **Phase 5: Game Over and Balancing**
    *   Implement the meltdown game over condition based on reactor parameters.
    *   Implement creature attack game over condition.
    *   Implement jump scare triggers and execution.
    *   Balance creature movement speeds, sabotage frequency, power consumption, and reactor parameter deterioration for desired difficulty.
6.  **Phase 6: Polish and Refinement**
    *   Refine UI aesthetics and responsiveness.
    *   Add visual effects and transitions.
    *   Implement save/load functionality (if desired, though for this concept it might not be necessary if runs are short).
    *   Thoroughly test for bugs and gameplay issues.

This plan provides a structured approach to building your game, starting with core mechanics and gradually adding complexity and content. Remember that iterative development and testing will be crucial for balancing the gameplay and ensuring everything works together smoothly.


renpy
screen game_ui():
    # ... other UI elements ...

    # Example button calling a door function
    textbutton "Close Left Door":
        xpos ... ypos ...
        action Python("close_left_door()")

    textbutton "Open Left Door":
        xpos ... ypos ...
        action Python("open_left_door()")

    textbutton "Hold Left Door":
        xpos ... ypos ...
        action Python("hold_left_door()")

    # Add buttons for the right door as well
    textbutton "Close Right Door":
        xpos ... ypos ...
        action Python("close_right_door()")

    # ... and so on for open_right_door and hold_right_door
