# The script of the game goes in this file.

# --------------------
# Character Definition
# --------------------
# Define characters used by this game here. Even for a FNAF-like game,
# you might define the protagonist or creatures for certain Ren'Py features.

define e = Character("Eileen")


# --------------------
# Initialization
# --------------------
# Initialize Python variables and game state here.
init python:
    import random

    # Define possible locations in the facility
    locations = {
    "ControlRoom": "The central control room. Your only safe haven.",
    "ReactorHall": "The dangerous area directly above the reactor core. High radiation.",
    "TurbineHall": "Contains the massive turbines and generators.",
    "CoolantPumpStation": "Houses the critical coolant pumps.",
    "WaterTreatmentFacility": "Area for processing water for the cooling system.",
    "ElectricalSwitchyard": "Connects the facility to the power grid.",
    "UsedFuelStorage": "Area for storing spent nuclear fuel. Extremely radioactive.",
    "VentilationSystems": "Essential for air circulation and filtering.",
    "CablingRoomA": "A complex network of cables and conduits.",
    "MaintenanceWorkshop": "Contains tools and equipment for repairs.",
    "StaffQuarters": "A small area for staff to rest and eat.",
    "HallwayA": "A long corridor connecting different sections.",
    "HallwayB": "Another corridor, potentially with less traffic.",
    "Camera1": "Camera feed from a specific location.",
    "Camera2": "Camera feed from another location."}

    loss_active = True # Flag to indicate if the Loss is an active threat
    # Define predefined monster movement paths
    monster_paths = {
    "Runner": ["HallwayA", "HallwayB", "ControlRoom"],
    "Experiment": ["Camera1", "HallwayA", "ControlRoom"]
    }

    # Door states
    left_door_state = "open" # Can be "open", "closed", or "holding"
    right_door_state = "open"
    door_being_held = "none" # Can be "none", "left", or "right"
    door_hold_hunger_cost_per_second = 0.5 # Example cost, adjust as needed

    # Hiding mechanics
    is_hiding = False
    hiding_abuse_counter = 0.0
    hiding_abuse_increase_rate = 1.0 # Rate at which abuse counter increases while hiding
    hiding_abuse_decay_rate = 0.5 # Rate at which abuse counter decays when not hiding
    hide_monster_appear_chance_per_abuse = 0.01 # Chance of Hide appearing per unit of abuse counter

    # Experiment Containment
    experiment_containment_level = 100.0 # Percentage of containment
    experiment_decay_rate_per_second = 0.1 # Rate at which containment drops if not powered
    power_allocated_to_experiment = False # Boolean to indicate if power is allocated
    experiment_transformation_threshold = 10.0 # Threshold below which Experiment becomes Loss

    # Door Durability and Experiment Encounter
    door_max_durability = 100 # Example max durability, adjust as needed
    left_door_durability = door_max_durability
    right_door_durability = door_max_durability
    experiment_encounter_duration = 10.0 # Duration of Experiment's encounter with a door
    experiment_held_door_hit_damage = 1 # Damage per hit when door is held
    experiment_unheld_door_hit_damage = 2 # Damage per hit when door is not held
    experiment_hit_rate_per_second = 1.0 # How many times Experiment hits per second during encounter

    # Loss Sanity Drain
    haunted_deterioration_multiplier = 2.0 # Adjust the multiplier for faster decay
    loss_sanity_drain_rate_per_second = 1.0 # Adjust the rate as needed

    # Shadow monster mechanics
    shadow_active = False # Is the Shadow currently active/can appear?
    shadow_visible = False # Is the Shadow currently visible to the player?
    shadow_location = None # Where is the Shadow currently?
    shadow_appearance_sanity_threshold = 20.0 # Sanity level below which Shadow can appear
    shadow_harm_sanity_threshold = 10.0 # Sanity level below which Shadow can harm
    shadow_look_sanity_drain = 1.0 # Amount of sanity drained each time player looks at Shadow
    shadow_manifestation_chance_per_update = 0.02 # Chance for Shadow to manifest if conditions met


    def check_look_at_shadow(location_viewed):
        global shadow_active, shadow_location, shadow_visible, sanity, shadow_look_sanity_drain

        # Check if Shadow is active, has a location, and that location is being viewed via camera
        if shadow_active and shadow_location is not None and shadow_location == location_viewed:
            # Shadow is visible because the player is looking at its location
            shadow_visible = True
            # Drain sanity from looking at it
            sanity = max(0.0, sanity - shadow_look_sanity_drain)
            # Placeholder for visual/auditory cue when seeing Shadow on camera
            # renpy.notify("You see something disturbing on the camera...") # Optional notification

        else:
            # Shadow is not in the location being viewed, or is not active
            shadow_visible = False

    def update_shadow_state(dt):
        global shadow_active, shadow_location, sanity, shadow_harm_sanity_threshold, in_game_hour, game_over, shadow_manifestation_chance_per_update

        if shadow_active:
            # Shadow Movement (simple random movement for now)
            if shadow_location is None or renpy.random.random() < 0.01: # Chance to move or if no location yet
                available_locations = [loc for loc in locations if loc != shadow_location]
                if available_locations:
                    shadow_location = renpy.random.choice(available_locations)
                    # Optional: Notification when Shadow moves (for testing)
                    # renpy.notify(f"The Shadow shifts in the darkness...")

        # Shadow Manifestation/Attack
        if sanity < shadow_harm_sanity_threshold and (in_game_hour >= 18 or in_game_hour < 5):
                # Chance to manifest and attack if sanity is very low during dark hours
                if renpy.random.random() < shadow_manifestation_chance_per_update * dt: # Scale chance by time delta
                    renpy.notify("The Shadow manifests!")
                    # --- Start Shadow Attack Placeholder ---
                    game_over = True # Game over placeholder for attack
                    renpy.notify("The Shadow consumed you! Game Over.")
                    # Example: Show a scary image, play a sound
                    # show shadow_attack_image at full_screen
                    # play sound "shadow_attack_sound.ogg"
                    # --- End Shadow Attack Placeholder ---


    # Experiment entry timer
    experiment_entry_timer = -1.0 # Tracks time since Experiment entered Control Room (-1.0 if not in room)

    # Machine components and their states (Example structure)
    reactor_components = {
        "coolant_pump": {"condition": 100, "haunted": False},
        "moderator_rod_drive": {"condition": 100, "haunted": False},
        # Add other machines as needed
    }

    def check_hide_monster():
        global hiding_abuse_counter, hide_monster_appear_chance_per_abuse, game_over
        if hiding_abuse_counter > 0 and not game_over:
            # Calculate the chance of Hide appearing based on abuse counter
            appear_chance = hiding_abuse_counter * hide_monster_appear_chance_per_abuse
            if renpy.random.random() < appear_chance:
                renpy.notify("Something is under the floorboards with you!")
                # Trigger Hide monster attack (for now, set game over)
                game_over = True
                renpy.notify("The Hide monster attacked! Game Over.")
    # Define monsters and their initial state

    def update_experiment_containment(dt):
        global experiment_containment_level, experiment_decay_rate_per_second, power_allocated_to_experiment, experiment_transformation_threshold, monsters

        # Decay containment if power is not allocated and Experiment still exists
        if not power_allocated_to_experiment and "Experiment" in monsters:
            experiment_containment_level = max(0.0, experiment_containment_level - experiment_decay_rate_per_second * dt)

            # Check for transformation
            if experiment_containment_level <= experiment_transformation_threshold and "Experiment" in monsters:

    monsters = {
        "Shadow": {"location": ""}, # Shadow doesn't have a fixed physical location
        "Runner": {"location": "HallwayA"},
        "Experiment": {"location": "Camera1"},
        "Loss": {"location": ""}, # Loss might not have a fixed physical location either
        "Abomination1": {"location": "Camera2", "hostile": False}, # Added HallwayB to locations for Abomination2
        "Abomination2": {"location": "HallwayA", "hostile": True} # Note: HallwayA is also a location
    }

    # Game state variables (power, reactor parameters, creature locations, etc.)

    # Reactor Parameters (Initial Values)
    reactor_temp = 50.0 # Temperature in some arbitrary unit (e.g., Celsius)
    reactor_pressure = 10.0 # Pressure in some arbitrary unit (e.g., MPa)
    coolant_level = 100.0 # Coolant level as a percentage
    radiation_level = 0.0 # Radiation level in some arbitrary unit
    backup_generator_oil = 100.0 # Backup generator oil level as a percentage

    # Generator and Lubricant Variables
    generator_lubricant_cycles = 0
    lubricant_replacement_threshold = 7 # In-game cycles/days
    oil_consumption_rate = 0.2 # Base oil consumption per time unit (when generator is running)
    oil_leak_multiplier = 2.0 # Multiplier for oil consumption when there's a leak
    last_day_increment_time = 0.0 # Real-life minutes when the last in-game day increment occurred


    # Variables for Pipe Sabotage and Resources
    pipes_sabotaged = {} # Dictionary to track sabotaged pipes (e.g., {pipe_id: True/False})
    oil_cans = 2 # Initial number of oil cans
    lubricant_kits = 1 # Initial number of lubricant kits
    generator_status = "idle" # Possible states: "idle", "running", "needs_lubricant", "broken"

    # Reactor Power Output
    reactor_power_output = 100.0 # Initial power output (e.g., in MW or a relative unit)

    # Game Time (Initial Values)
    game_time_in_hours = 0 # In-game hours
    in_game_hour = 6 # Assuming the game starts at 6:00
    in_game_minute = 0
    game_time_in_minutes_real = 0.0 # Real-life minutes elapsed

    # Game Over Flag
    game_over = False # Set to True when a game over condition is met

    # Pump speed (e.g., 0-100)
    pump_speed = 50

    # Temperature change rate modifiers
    temp_increase_rate = 0.1 # Base rate temperature increases over time
    temp_cool_rate_multiplier = 0.05 # How much pump speed affects cooling

    # Thresholds
    temp_meltdown_threshold = 200.0
    temp_power_cutout_threshold = 20.0
    temp_core_shutdown_overspeed_threshold = 80.0 # Temp above which high speed is safe
    pump_speed_overspeed_threshold = 80 # Pump speed that can cause shutdown at low temp

    # Core state
    core_active = True
    meltdown_rate = 0.5 # How fast temp increases during meltdown

    # Generator breakdown mechanic variables
    real_life_hours_after_day_3 = 0.0
    breakdown_chance_per_hour = 0.5 # Percentage chance increase per real-life hour after day 3

    # Player resources
    player_money = 1000.0 # Starting money
    rations = [] # Changed to a list to track individual rations
    ration_spoilage_time = 1440.0 # 24 hours in real-life minutes for spoilage
    coffee_tea = 0 # Number of coffee/tea items
    coffee_tea_uses_left = 0 # Uses left on the current coffee/tea item

    # Variables for power-based wage
    baseline_power_consumption = 50.0 # Example: Baseline power needed to run the facility
    money_per_excess_power_unit = 5.0 # Example: How much money earned per unit of excess power

    # Survival variables
    hunger_level = 0.0 # Increases over time, reduced by rations
    insomnia_level = 0.0 # Increases over time, reduced by coffee/tea and sleep
    caffeine_effect_timer = 0.0 # Timer for the caffeine buff duration
    caffeine_crash_timer = 0.0 # Timer for when the caffeine crash occurs
    caffeine_overdosed = False # Flag to indicate if the player is currently overdosed on caffeine
    sanity = 100.0 # Player's sanity level (starts at 100, game over at 0)
    consecutive_coffee_tea_uses = 0 # Track consecutive coffee/tea uses for overdose
    # Add variables for hunger/insomnia increase rates
    hunger_increase_rate = 0.1 # Hunger increase per real-life minute
    insomnia_increase_rate = 0.05 # Insomnia increase per real-life minute


    # Tool durability (Example: a repair tool)
    repair_tool_durability = 100.0
    max_repair_tool_durability = 100.0
    repair_tool_decay_per_use = 10.0 # How much durability is lost per use

    # Use a dictionary to track installed generator parts and their CURRENT durability
    installed_generator_parts = {
        "pipe_basic": 0.0, # Current durability (0 if not installed)
        "reservoir_basic": 0.0,
        "gauge_basic": 0.0,
        "pump_basic": 0.0,
        "pipe_upgraded": 0.0,
        "reservoir_upgraded": 0.0,
        "gauge_upgraded": 0.0,
        "pump_upgraded": 0.0,
        "pipe_reinforced": 0.0,
        "reservoir_reinforced": 0.0,
        "gauge_reinforced": 0.0,
        "pump_reinforced": 0.0
    }

    # Define the MAXIMUM durability for each part type
    max_part_durability = {
        "pipe_basic": 100.0,
        "reservoir_basic": 100.0,
        "gauge_basic": 100.0,
        "pump_basic": 100.0,
        "pipe_upgraded": 150.0, # Upgraded parts have more durability
        "reservoir_upgraded": 150.0,
        "gauge_upgraded": 150.0,
        "pump_upgraded": 150.0,
        "pipe_reinforced": 200.0, # Reinforced parts have even more
        "reservoir_reinforced": 200.0,
        "gauge_reinforced": 200.0,
        "pump_reinforced": 200.0,
    }

    # Define the breakdown reduction percentage for each part type (still needed for the bonus)
    part_breakdown_reduction = {
        "pipe_basic": 5.0, # Example: Basic pipe reduces chance by 5%
        "reservoir_basic": 5.0,
        "gauge_basic": 5.0,
        "pump_basic": 5.0,
        "pipe_upgraded": 10.0,
        "reservoir_upgraded": 10.0,
        "gauge_upgraded": 10.0,
        "pump_upgraded": 10.0,
        "pipe_reinforced": 15.0,
        "reservoir_reinforced": 15.0,
        "gauge_reinforced": 15.0,
        "pump_reinforced": 15.0,
    }

    # Add a variable for lubricant aging impact on oil consumption
    lubricant_aging_oil_multiplier = 0.1 # How much each lubricant cycle increases oil consumption

    # Generator part durability decay
    generator_part_decay_per_minute = 0.05 # Example: Lose 0.05 durability per real-life minute of generator use

    # Oil and lubricant consumption increase from broken parts
    broken_part_oil_increase = {
        "pipe_basic": 0.1, # Example: Broken basic pipe increases oil consumption by 0.1 per minute
        "reservoir_basic": 0.1,
        "gauge_basic": 0.1,
        # Motor parts don't increase oil/lube loss this way
        "pipe_upgraded": 0.08, # Upgraded parts have less impact when broken
        "reservoir_upgraded": 0.08,
        "gauge_upgraded": 0.08,
        "pipe_reinforced": 0.05, # Reinforced parts have even less impact
        "reservoir_reinforced": 0.05,
        "gauge_reinforced": 0.05,
    }

    broken_part_lubricant_increase_rate = {
        "pipe_basic": 0.2, # Example: Broken basic pipe increases lubricant aging rate
        "reservoir_basic": 0.2,
        "gauge_basic": 0.2,
        # Motor parts don't increase oil/lube loss this way
        "pipe_upgraded": 0.15,
        "reservoir_upgraded": 0.15,
        "gauge_upgraded": 0.15,
        "pipe_reinforced": 0.1,
        "reservoir_reinforced": 0.1,
        "gauge_reinforced": 0.1,
    }

    # Shop item costs
    item_costs = {
        "oil_can": 50.0,
        "lubricant_kit": 100.0,
        "ration": 20.0,
        "coffee_tea": 30.0,
        "pipe_basic": 150.0,
        "reservoir_basic": 150.0,
        "gauge_basic": 150.0,
        "pump_basic": 200.0, # Motor parts might be more expensive
        "pipe_upgraded": 300.0,
        "reservoir_upgraded": 300.0,
        "gauge_upgraded": 300.0,
        "pump_upgraded": 400.0,
        "pipe_reinforced": 500.0,
        "reservoir_reinforced": 500.0,
        "gauge_reinforced": 500.0,
        "pump_reinforced": 700.0,
    }

    # Terminal output variable
    latest_terminal_output = ""

    # Action Point variables
    max_action_points = 10 # Maximum action points per fixing phase
    action_points = 0 # Current action points
    current_phase = "survival" # Assume starting in survival phase

    def start_fixing_phase():
        global action_points, max_action_points, hunger_level
        # Calculate action points based on hunger level
        action_points = max_action_points - (hunger_level * 0.1)
        # Ensure action points don't go below 0
        action_points = max(0, action_points)
        renpy.notify(f"Fixing phase starts. You have {action_points:.1f} action points.")


    def rest_in_control_room():
        global insomnia_level, sanity, hunger_level, game_time_in_minutes_real, in_game_hour, in_game_minute, current_phase

        # Apply stat changes
        insomnia_level = max(0.0, insomnia_level - 50.0)
        sanity = min(100.0, sanity + 20.0)
        hunger_level += 30.0 # Resting might make you a bit hungry

        # Calculate real-life minutes to skip until midnight (assuming 48 real minutes = 1 in-game day, 1440 in-game minutes per day)
        # The ratio of real minutes to in-game minutes is 48 / 1440 = 1/30
        in_game_minutes_until_midnight = (24 - in_game_hour) * 60 - in_game_minute
        real_minutes_to_skip = in_game_minutes_until_midnight * (48.0 / 1440.0) # Or * (1.0 / 30.0)

        # Update game_time_in_minutes_real
        game_time_in_minutes_real += real_minutes_to_skip

        # Force in-game time to midnight (start of survival phase)
        in_game_hour = 0
        in_game_minute = 0
        # The game loop's next iteration will detect the phase change to "survival" and handle its start logic.

    def display_terminal_output(self, message):

    def close_left_door(): # Added functions for left door control
        global left_door_state, door_being_held
        if left_door_state != "holding":
            left_door_state = "closed"
            renpy.notify("Left door closed.")
        else:
            renpy.notify("Cannot close the left door while holding it.")
    def open_left_door():
        global left_door_state, door_being_held
        if left_door_state != "holding":
            left_door_state = "open"
            renpy.notify("Left door opened.")
        else:
            renpy.notify("Cannot open the left door while holding it.")
    def hold_left_door():
        global left_door_state, door_being_held
        if door_being_held == "none":
            left_door_state = "holding"
            door_being_held = "left"
            renpy.notify("Holding the left door.")
        elif door_being_held == "left":
            # Already holding this door, perhaps a message or no action
            pass # Or renpy.notify("You are already holding the left door.")
        else:
            renpy.notify("You are already holding the right door.")
    def stop_holding_left_door():
        global left_door_state, door_being_held
        if left_door_state == "holding":
            left_door_state = "closed" # Door closes when you stop holding
            door_being_held = "none"
            renpy.notify("Stopped holding the left door.")

    def close_right_door(): # Added functions for right door control
        global right_door_state, door_being_held
        if right_door_state != "holding":
            right_door_state = "closed"
            renpy.notify("Right door closed.")
        else:
            renpy.notify("Cannot close the right door while holding it.")

    def open_right_door():
        global right_door_state, door_being_held
        if right_door_state != "holding":
            right_door_state = "open"
            renpy.notify("Right door opened.")
        else:
            renpy.notify("Cannot open the right door while holding it.")

    def hold_right_door():
        global right_door_state, door_being_held
        if door_being_held == "none":
            right_door_state = "holding"
            door_being_held = "right"
            renpy.notify("Holding the right door.")
        elif door_being_held == "right":
            pass
        else:
            renpy.notify("You are already holding the left door.")

    def stop_holding_right_door():
        global right_door_state, door_being_held
        if right_door_state == "holding":
            right_door_state = "closed"
            door_being_held = "none"
            global latest_terminal_output
            latest_terminal_output = message

    def update_reactor_temp(self):
        global reactor_temp, pump_speed, core_active, game_over, meltdown_rate, generator_status

        if not core_active:
            # Temperature might slowly decrease when core is off, or stay stable
            # For now, let's assume it stays relatively stable or decreases slowly
            reactor_temp -= 0.05 # Optional: slow cooling when off
            return

        # Temperature increases over time
        reactor_temp += temp_increase_rate

        # Temperature cooling based on pump speed
        cooling_effect = pump_speed * temp_cool_rate_multiplier
        reactor_temp -= cooling_effect

        # Ensure temperature doesn't go below a minimum
        reactor_temp = max(reactor_temp, 0.0)

        # Check for power cutout (temperature too low)
        if reactor_temp < temp_power_cutout_threshold:
            core_active = False
            # Trigger power cutout event (need to add this later)
            renpy.notify("Power cutout! Reactor offline.")
            # Game over if power cuts out and generator is broken
            if generator_status == "broken":
                game_over = True
                renpy.notify("Power lost! Meltdown imminent.")


        # Check for core shutdown (pump speed too high for temperature)
        if pump_speed > pump_speed_overspeed_threshold and reactor_temp < temp_core_shutdown_overspeed_threshold and core_active:
            core_active = False
            # Trigger core shutdown event (need to add this later)
            renpy.notify("Core shutdown due to overspeed! Reactor offline.")
            # Game over if core shuts down and generator is broken
            if generator_status == "broken":
                game_over = True
                renpy.notify("Power lost! Meltdown imminent.")


        # Check for meltdown (temperature too high)
        if reactor_temp >= temp_meltdown_threshold:
            # Enter meltdown state
            reactor_temp += meltdown_rate # Accelerate temp increase
            if reactor_temp >= temp_meltdown_threshold + 50: # Example: Game over after a certain point in meltdown
                game_over = True
                # Trigger game over event (need to add this later)


    def set_pump_speed(speed):
        global pump_speed
        # Add logic to limit pump speed to a valid range (e.g., 0-100)
        pump_speed = max(0.0, min(100.0, speed))
        renpy.notify("Pump speed set to: " + str(pump_speed))

    def restart_core():
        global core_active, backup_generator_oil, generator_status
        if not core_active and backup_generator_oil > 0 and generator_status != "broken":
            core_active = True
            backup_generator_oil -= 10 # Example: Restarting uses generator oil
            renpy.notify("Core restarting...")
            # Add a timer for the restart process if needed
        elif not core_active and backup_generator_oil <= 0:
            renpy.notify("Cannot restart core: Generator oil is low.")
        elif not core_active and generator_status == "broken":
            renpy.notify("Cannot restart core: Generator is broken.")
        else:
            renpy.notify("Core is already active.")

    # Placeholder for pipe sabotage logic
    def sabotage_pipe(pipe_id):
        pass # Implementation coming later

    # Placeholder for pipe repair logic
    def repair_pipe(pipe_id):
        pass # Implementation coming later

    # Placeholder for updating coolant levels
    def update_coolant_level():
        pass # Implementation coming later (will factor in leaks)
    
    # Placeholder for refilling generator oil
    def refill_generator_oil():
        pass # Implementation coming later (will consume oil cans)


    def calculate_total_breakdown_reduction(): # calculate total breakdown reduction
        """Calculates the total breakdown chance reduction from installed parts based on their durability."""
        total_reduction = 0.0
        for part_type, current_durability in installed_generator_parts.items():
            if current_durability > 0 and part_type in part_breakdown_reduction and part_type in max_part_durability:
                # The reduction is proportional to the remaining durability
                reduction_factor = current_durability / max_part_durability[part_type]
                total_reduction += part_breakdown_reduction[part_type] * reduction_factor
        return total_reduction

    def calculate_and_earn_wage():
        global player_money, reactor_power_output, baseline_power_consumption, money_per_excess_power_unit

        excess_power = max(0.0, reactor_power_output - baseline_power_consumption)
        wage_earned = excess_power * money_per_excess_power_unit

        player_money += wage_earned
        renpy.notify(f"Earned ${wage_earned:.2f} in wages.")


    def calculate_broken_part_oil_increase():
        total_increase = 0.0
        for part_type, current_durability in installed_generator_parts.items():
            # Check if the part is broken and is a non-motor part
            if current_durability <= 0 and part_type in broken_part_oil_increase:
                total_increase += broken_part_oil_increase[part_type]
        return total_increase

    def calculate_broken_part_lubricant_increase():
        total_increase = 0.0
        for part_type, current_durability in installed_generator_parts.items():
            # Check if the part is broken and is a non-motor part
            if current_durability <= 0 and part_type in broken_part_lubricant_increase_rate:
                total_increase += broken_part_lubricant_increase_rate[part_type]
        return total_increase


    def update_lubricant(current_real_time):
        global generator_lubricant_cycles, lubricant_replacement_threshold, generator_status, last_day_increment_time, real_life_hours_after_day_3, breakdown_chance_per_hour, game_over
        import random

        # Check if any motor part is broken
        motor_parts = ["pump_basic", "pump_upgraded", "pump_reinforced"] # Assuming 'pump' is the motor part
        for motor_part in motor_parts:
            # Use .get with a default of 0.0 in case a part isn't in the dictionary
            if installed_generator_parts.get(motor_part, 0.0) <= 0 and generator_status != "broken":
                generator_status = "broken"
                renpy.notify(f"The {motor_part.replace('_', ' ')} is broken! The generator has stopped.")
                # Game over if core is off when generator breaks due to motor
                if not core_active:
                        game_over = True
                        renpy.notify("Power lost! Meltdown imminent.")
                return # Stop lubricant updates if the generator is broken


        # Check if an in-game day has passed (48 real-life minutes)
        if current_real_time - last_day_increment_time >= 48.0:
            # Increase lubricant aging based on broken non-motor parts
            aging_increase = calculate_broken_part_lubricant_increase()
            generator_lubricant_cycles += (1 + aging_increase) # Aging increases faster with broken parts


            last_day_increment_time = current_real_time # Update the last increment time

            # Calculate and earn daily wage
            calculate_and_earn_wage()


            # Check if lubricant needs replacement
            # Note: Lubricant might need replacement faster now due to increased aging
            if generator_lubricant_cycles >= lubricant_replacement_threshold:
                generator_status = "needs_lubricant"
                renpy.notify("Generator lubricant needs replacement.")

        # Calculate real-life hours after day 3
        if generator_lubricant_cycles >= 3: # Start breakdown chance increase after day 3 (lubricant cycle 4)
            total_real_life_minutes = game_time_in_minutes_real
            minutes_in_first_3_days = 3 * 48.0
            if total_real_life_minutes > minutes_in_first_3_days:
                real_life_hours_after_day_3 = (total_real_life_minutes - minutes_in_first_3_days) / 60.0
            else:
                real_life_hours_after_day_3 = 0.0 # Ensure it's not negative before day 4


            # Calculate base breakdown chance based on time
            base_breakdown_chance = real_life_hours_after_day_3 * breakdown_chance_per_hour

            # Calculate total reduction from installed parts
            parts_reduction = calculate_total_breakdown_reduction()

            # Apply reduction to get the final breakdown chance
            current_breakdown_chance = max(0.0, base_breakdown_chance - parts_reduction)


            # Ensure breakdown chance doesn't exceed 100%
            current_breakdown_chance = min(current_breakdown_chance, 100.0)
            # renpy.notify(f"Breakdown chance: {current_breakdown_chance:.2f}%") # Debugging line
            # Check for breakdown
            if generator_status != "broken": # Only calculate chance if not already broken
                if random.random() * 100 < current_breakdown_chance:
                    generator_status = "broken"
                    renpy.notify("The generator has broken down!")
                    # Game over if core is off when generator breaks
                    if not core_active:
                        game_over = True
                        renpy.notify("Power lost! Meltdown imminent.")
        elif generator_lubricant_cycles < 3 and generator_status != "broken": # Ensure it's explicitly 0 before day 4 if not already broken
            current_breakdown_chance = 0.0 # Ensure it's explicitly 0 before day 4


    def replace_lubricant():
        global lubricant_kits, generator_lubricant_cycles, generator_status, core_active

        if lubricant_kits > 0:
            lubricant_kits -= 1
            generator_lubricant_cycles = 0

            # Determine the new generator status based on the core's state
            # If the core is off, the generator should start running. If the core is on, it should be idle.
            if not core_active:
                # Check if the motor is broken. If so, replacing lubricant won't fix it.
                motor_parts = ["pump_basic", "pump_upgraded", "pump_reinforced"]
                motor_broken = False
                for motor_part in motor_parts:
                    if installed_generator_parts.get(motor_part, 0.0) <= 0:
                        motor_broken = True
                        break

                if not motor_broken:
                    generator_status = "running"
                    renpy.notify("Generator lubricant replaced. Generator starting.")
                else:
                    generator_status = "broken" # Still broken if motor is
                    renpy.notify("Generator lubricant replaced, but the motor is broken. Generator cannot start.")
            else:
                generator_status = "idle"
                renpy.notify("Generator lubricant replaced.")

        else:
            renpy.notify("You don't have any lubricant kits.")

    # Add functions for survival item consumption
    def consume_ration():
        global rations, hunger_level
        if rations > 0:
            rations -= 1
            hunger_level = max(0.0, hunger_level - 30.0) # Example: Reduce hunger by 30
            renpy.notify("Consumed a ration. Feeling less hungry.")
        else:
            renpy.notify("You don't have any rations.")

    def use_coffee_tea():
        global coffee_tea, coffee_tea_uses_left, insomnia_level, caffeine_effect_timer, caffeine_crash_timer, consecutive_coffee_tea_uses
        if coffee_tea > 0 or coffee_tea_uses_left > 0:
            if coffee_tea_uses_left == 0: # Starting a new coffee/tea item
                if coffee_tea > 0:
                    coffee_tea -= 1
                    coffee_tea_uses_left = 3 # Set uses for the new item
                else:
                    renpy.notify("You don't have any coffee or tea.")
                    return

            if coffee_tea_uses_left > 0:
                coffee_tea_uses_left -= 1
                insomnia_level = max(0.0, insomnia_level - 20.0) # Example: Reduce insomnia by 20
                caffeine_effect_timer = 60.0 # Example: Caffeine effect lasts 60 real-life minutes
                caffeine_crash_timer = caffeine_effect_timer + 30.0 # Example: Crash occurs 30 mins after effect ends
                renpy.notify("Drank some coffee/tea. Feeling more alert.")
                consecutive_coffee_tea_uses += 1 # Increment consecutive use count

                if consecutive_coffee_tea_uses >= 10:
                    renpy.notify("Caffeine overdose!") # Temporary notification
                    caffeine_overdosed = True # Set overdose flag
                    consecutive_coffee_tea_uses = 0 # Reset consecutive use count on overdose

            # The else case for coffee_tea_uses_left == 0 inside the outer if is handled by the initial coffee_tea > 0 check
        else:
            renpy.notify("You don't have any coffee or tea.")


    def update_monster_positions(): # Update monster positions
        global monsters, locations, monster_paths, left_door_state, right_door_state, left_door_durability, right_door_durability, door_max_durability, experiment_encounter_duration, experiment_held_door_hit_damage, experiment_unheld_door_hit_damage, experiment_hit_rate_per_second, left_door_experiment_timer, right_door_experiment_timer # Added door states and experiment encounter variables
        global placed_crucifixes, total_placed_crucifixes # Added crucifix variables
        for monster_name, monster_data in monsters.items():
            # Check if monster exists and has a location for movement
            if "location" not in monster_data or not monster_data["location"]:
                continue # Skip monsters without a defined location

            if monster_name == "Loss":
                # Loss movement and haunting logic
                # (Existing code for Loss movement and haunting goes here)
                current_location = monster_data["location"]
                # Determine a potential new location for the Loss
                possible_locations = [loc for loc in locations if loc != current_location]
                if possible_locations:
                    new_location = random.choice(possible_locations)

                    # Check if the new location has placed crucifixes
                    if new_location in placed_crucifixes and placed_crucifixes[new_location] > 0:
                    # Loss encounters crucifixes - repel and consume
                    num_crucifixes = placed_crucifixes[new_location]
                    consumed = min(num_crucifixes, 1) # Consume at least 1 crucifix, maybe more later
                    placed_crucifixes[new_location] -= consumed
                    global total_placed_crucifixes
                    total_placed_crucifixes -= consumed
                    renpy.notify(f"A crucifix in {new_location} repelled the Loss!")

                    # Loss moves to a random location different from the current and blocked location
                    # Ensure there are valid locations to move to
                    available_locations = [loc for loc in locations if loc != current_location and loc != new_location]
                    if available_locations:
                        monster_data["location"] = random.choice(available_locations)
                    else:
                        # If no other locations, perhaps it just stays put or is temporarily banished
                        pass # Or set a banished state

            elif monster_name in ["Runner", "Experiment"]: # Only move these along paths for now
                # Move Runner and Experiment along their paths
                current_location = monster_data["location"]
                if current_location != "ControlRoom": # Don't move if they reached the control room (handled separately)
                    path = monster_paths.get(monster_name, [])
                    if path:
                        try:
                            current_index = path.index(current_location)
                            next_index = (current_index + 1) % len(path) # Loop back to the beginning
                            new_location = path[next_index]

                            # Check if the new location is the Control Room and if the corresponding door is open
                            can_move_to_control_room = True
                            if new_location == "ControlRoom":
                                # Assume left door for Runner, right for Experiment for this example. Adjust as needed.
                                if monster_name == "Runner" and left_door_state != "open":
                                    can_move_to_control_room = False
                                elif monster_name == "Experiment" and right_door_state != "open":
                                    can_move_to_control_room = False

                            if can_move_to_control_room: # If the door is open or it's not a door location
                                # Implement a chance to move
                                if random.random() < 0.3: # 30% chance to move
                                    monster_data["location"] = new_location
                                    # Check if the monster entered the Control Room
                                    if new_location == "ControlRoom":
                                        renpy.notify(f"{monster_name} entered the Control Room!")
                                        # Handle consequences of monster entering the Control Room
                                        if monster_name == "Experiment":
                                            global experiment_entry_timer
                                            experiment_entry_timer = 10.0 # Start the 10-second timer for Experiment
                                            renpy.notify("The Experiment is in the Control Room! You have 10 seconds to hide.")
                                        # Runner causes instant game over if not hiding
                                        elif monster_name == "Runner": # Check for Runner after it enters Control Room
                                            global game_over, is_hiding
                                            if not is_hiding:
                                                game_over = True
                                                renpy.notify("The Runner caught you! Game Over.")
                                    elif new_location != "ControlRoom": # Only notify if moving to a non-ControlRoom location
                                        renpy.notify(f"{monster_name} moved to {new_location}.")
                            else:
                                # Monster is blocked at the door - Start/Reset Experiment encounter timer
                                if monster_name == "Experiment":
                                    door_being_attacked = "left" if monster_data["location"] == "LeftDoor" else "right"
                                    if door_being_attacked == "left":
                                        left_door_experiment_timer = experiment_encounter_duration
                                        renpy.notify("The Experiment is at the left door!")
                                    else:
                                        right_door_experiment_timer = experiment_encounter_duration
                                        renpy.notify("The Experiment is at the right door!")

                        except ValueError:
                            # Monster not on its defined path, maybe handle this error or reset
                            pass

            else:
                # Keep existing movement logic for other monsters (Abominations, etc.) here if not path-based
                pass # Assuming Abomination movement is handled elsewhere or is random without path



    # Function to update survival stats over time
    def update_survival_stats(dt):
        global hunger_level, insomnia_level, caffeine_effect_timer, caffeine_crash_timer, hunger_increase_rate, insomnia_increase_rate, consecutive_coffee_tea_uses, sanity, caffeine_overdosed, hiding_abuse_counter, hiding_abuse_increase_rate, hiding_abuse_decay_rate, is_hiding, experiment_entry_timer, game_over, monsters, loss_sanity_drain_rate_per_second, placed_crucifixes, sanity_increase_per_placed_crucifix_per_second # Added experiment_entry_timer, game_over, monsters, loss_sanity_drain_rate_per_second

        # Update caffeine timers
        if caffeine_effect_timer > 0:
            caffeine_effect_timer = max(0.0, caffeine_effect_timer - (dt / 60.0))
            # Reset consecutive uses if caffeine effect wears off naturally
            if caffeine_effect_timer == 0:
                renpy.notify("The caffeine effect is wearing off.")
                consecutive_coffee_tea_uses = 0
                # Reset overdose flag when effect timer ends (if crash timer is also done)
                if caffeine_crash_timer <= 0:
                    caffeine_overdosed = False
        elif caffeine_crash_timer > 0: # Only count down if crash timer is active after effect
            caffeine_crash_timer = max(0.0, caffeine_crash_timer - (dt / 60.0))
            if caffeine_crash_timer == 0:
                # Implement caffeine crash penalty
                renpy.notify("Experiencing a caffeine crash!")
                # Example: Increase insomnia significantly
                insomnia_level += 40.0 # Example crash penalty
                caffeine_overdosed = False # Also reset overdose flag here

        # Increase hunger and insomnia over time
        # Apply increased hunger cost if holding a door
        current_hunger_increase_rate = hunger_increase_rate
        if door_being_held != "none":
            current_hunger_increase_rate += door_hold_hunger_cost_per_second # Add holding cost to base rate

        hunger_level += current_hunger_increase_rate * (dt / 60.0)
        insomnia_level += insomnia_increase_rate * (dt / 60.0)

        # Increase hunger if holding a door during survival phase
        # This is handled by the current_hunger_increase_rate logic above now
        # if door_being_held != "none":
        #     hunger_level += door_hold_hunger_cost_per_second * (dt / 60.0)

        # Activate Shadow if sanity is low enough during darker hours
        global shadow_active, sanity, shadow_appearance_sanity_threshold, in_game_hour
        if sanity < shadow_appearance_sanity_threshold and (in_game_hour >= 18 or in_game_hour < 5):
            shadow_active = True
            # Optional: Add a notification the first time Shadow becomes active
            if not shadow_active: # You'd need a separate flag to track first activation
                renpy.notify("You feel a presence in the darkness...")
        else:
            shadow_active = False # Deactivate if sanity is high enough or not dark hours


        # Add penalties for high hunger/insomnia (will implement effects later)
        # Add sanity reduction during overdose
        if caffeine_overdosed:
            # Sanity decreases over time during overdose
            sanity = max(0.0, sanity - (0.05 * (dt / 60.0))) # Decrease sanity by 0.05 per real-life minute
            # Add hunger penalties
        if insomnia_level >= 100:
            renpy.notify("You are severely sleep deprived!")
            # Add insomnia penalties

        # Update hiding abuse counter
        if is_hiding:
            hiding_abuse_counter += hiding_abuse_increase_rate * (dt / 60.0)
        else:
            hiding_abuse_counter = max(0.0, hiding_abuse_counter - hiding_abuse_decay_rate * (dt / 60.0))

        # Update Experiment entry timer
        if experiment_entry_timer > 0:
            experiment_entry_timer -= dt # Decrease timer by real-life seconds
            if experiment_entry_timer <= 0:
                # Timer ran out, check if player is hiding
                if not is_hiding:
                    game_over = True
                    renpy.notify("The Experiment caught you! Game Over.")

        # Sanity drain from Loss (only active during darker hours)
        if "Loss" in monsters and monsters["Loss"]["location"] == "ControlRoom" and (in_game_hour >= 18 or in_game_hour < 5):
            sanity = max(0.0, sanity - loss_sanity_drain_rate_per_second * (dt / 60.0))
            # renpy.notify(f"Loss is nearby! Sanity draining. Sanity: {sanity:.1f}") # Debugging line

        # Sanity increase from placed crucifixes (in the current location)
        current_location = "ControlRoom" # Assuming player is in Control Room
        if current_location in placed_crucifixes:
            sanity_increase = placed_crucifixes[current_location] * sanity_increase_per_placed_crucifix_per_second * (dt / 60.0)
            sanity = min(100.0, sanity + sanity_increase) # Assuming max sanity is 100


    def update_reactor_power_output():
        global reactor_temp, reactor_pressure, reactor_power_output, core_active

        if core_active:
            # Calculate power output based on reactor parameters
            # This is a simplified example; you'll refine this formula
            output = 100.0 # Base output when active
            if reactor_temp > 150 or reactor_pressure > 15: # Example: Reduced output at high temp/pressure
                output *= 0.5
            elif reactor_temp < 30 or reactor_pressure < 5: # Example: Reduced output at low temp/pressure
                output *= 0.75

            reactor_power_output = max(0.0, min(100.0, output)) # Ensure output is within a range
        else:
            reactor_power_output = 0.0 # No significant power output when core is off


    def update_generator_oil():
        global backup_generator_oil, core_active, game_over, generator_lubricant_cycles, oil_consumption_rate, oil_leak_multiplier, generator_status, lubricant_aging_oil_multiplier
        if not core_active and generator_status != "broken": # Only consume oil if core is off and generator is not broken
            # Base consumption
            consumption = oil_consumption_rate

            # Increase consumption based on lubricant aging
            aging_multiplier = generator_lubricant_cycles * lubricant_aging_oil_multiplier
            consumption *= (1 + aging_multiplier) # Apply aging multiplier

            # Add oil consumption due to leaks (will be implemented later)
            # if pipes_leaking: # Placeholder for leak check
            #     consumption *= oil_leak_multiplier

            # Add oil consumption due to broken non-motor parts
            consumption += calculate_broken_part_oil_increase()


            backup_generator_oil -= consumption
            backup_generator_oil = max(0.0, backup_generator_oil) # Ensure it doesn't go below 0

            # Check for game over if oil runs out while core is off
            if backup_generator_oil <= 0:
                game_over = True
                # Trigger game over event (oil depleted while core off)
                renpy.notify("Generator out of oil! Meltdown imminent.")
    # --------------------

    def update_game_state(dt):
        # dt is the time elapsed since the last update (in seconds)
        # We need to track total real-life minutes
        global game_time_in_minutes_real, game_over, generator_status, core_active

        if game_over: # Stop updates if the game is over
            return

        if sanity <= 0.0:
            game_over = True
            renpy.notify("You have gone insane. Game Over.")

        real_life_minutes_elapsed = dt / 60.0 # Convert seconds to minutes
        game_time_in_minutes_real += real_life_minutes_elapsed # This will track the total real-life time elapsed

        # Update lubricant based on real-life time and check for breakdown
        update_lubricant(game_time_in_minutes_real)

        # Update generator oil if the core is off and generator is not broken
        update_generator_oil()

        # Update survival stats
        update_survival_stats(dt)

        # Update Shadow state (movement and manifestation)
        # This should run whether the Shadow is active or not to reset its state when inactive
        update_shadow_state(dt)


        # Decay durability of installed generator parts if the generator is running
        if not core_active and generator_status == "running":
            for part_type in installed_generator_parts:
                if installed_generator_parts[part_type] > 0: # Only decay if the part is installed
                    installed_generator_parts[part_type] -= generator_part_decay_per_minute * real_life_minutes_elapsed
                    # Ensure durability doesn't go below 0
                    installed_generator_parts[part_type] = max(0.0, installed_generator_parts[part_type])
                    # Note: Checking for a part breaking (durability == 0) is handled in update_lubricant for the motor
                    # and will need to be handled when we implement the effects of other broken parts.


        # Update reactor temperature
        update_reactor_temp()

        # Update reactor power output
        update_reactor_power_output()



        # ... other game state updates like creature movement, etc. ...

    def handle_terminal_command(command):
        global player_money, oil_cans, lubricant_kits, rations, coffee_tea, installed_generator_parts, max_part_durability, latest_terminal_output, left_door_durability, right_door_durability, door_max_durability, repair_tool_durability, max_repair_tool_durability, repair_tool_decay_per_use # Added door and repair variables

        command_parts = command.lower().split()

        if not command_parts:
            display_terminal_output("Enter a command.")
            return

        action = command_parts[0]

        if action == "buy":
            # ... (existing buy logic) ...
            pass # Placeholder for buy logic

        elif action == "shop":
            # ... (existing shop list logic) ...
            pass # Placeholder for shop logic

        elif action == "repair":
            if len(command_parts) < 2:
                display_terminal_output("Usage: repair [left_door | right_door]")
                return

            target = command_parts[1]
            door_to_repair_durability = None
            door_to_repair_state = None
            door_name = None

            if target == "left_door":
                door_to_repair_durability = left_door_durability
                door_to_repair_state = left_door_state
                door_name = "left door"
            elif target == "right_door":
                door_to_repair_durability = right_door_durability
                door_to_repair_state = right_door_state
                door_name = "right door"
            else:
                display_terminal_output("Invalid repair target. Use 'left_door' or 'right_door'.")
                return
        global player_money, oil_cans, lubricant_kits, rations, coffee_tea, installed_generator_parts, max_part_durability, latest_terminal_output # Added latest_terminal_output

        command_parts = command.lower().split()

        if not command_parts:
            display_terminal_output("Enter a command.")
            return

        action = command_parts[0]

        if action == "buy":
            if len(command_parts) < 2:
                display_terminal_output("Usage: buy [item_name]")
                return

            item_name = command_parts[1]

            if item_name in item_costs:
                cost = item_costs[item_name]
                if player_money >= cost:
                    player_money -= cost
                    # Add the item to inventory or install the part
                    if item_name == "oil_can":
                        oil_cans += 1
                        display_terminal_output(f"Purchased an oil can for ${cost:.2f}.")
                    elif item_name == "lubricant_kit":
                        lubricant_kits += 1
                        display_terminal_output(f"Purchased a lubricant kit for ${cost:.2f}.")
                    elif item_name == "ration":
                        rations += 1
                        display_terminal_output(f"Purchased a ration for ${cost:.2f}.")
                    elif item_name == "coffee_tea":
                        coffee_tea += 1
                        display_terminal_output(f"Purchased coffee/tea for ${cost:.2f}.")
                    elif item_name in installed_generator_parts:
                        # When buying a part, it's installed with max durability
                        installed_generator_parts[item_name] = max_part_durability.get(item_name, 100.0) # Default to 100 if not in max_part_durability
                        display_terminal_output(f"Purchased and installed a {item_name.replace('_', ' ')} for ${cost:.2f}.")
                    else:
                        # Should not happen if item_name is in item_costs
                        display_terminal_output(f"Unknown item: {item_name}")

                else:
                    display_terminal_output(f"Not enough money to buy {item_name}. Costs ${cost:.2f}, you have ${player_money:.2f}.")
            else:
                display_terminal_output(f"Unknown item: {item_name}. Type 'shop list' to see available items.")

        elif action == "shop":
            if len(command_parts) > 1 and command_parts[1] == "list":
                output = "--- Available Items ---\n"
                for item, cost in item_costs.items():
                    output += f"{item.replace('_', ' ').title()}: ${cost:.2f}\n"
                output += "-----------------------"
                display_terminal_output(output)
            else:
                display_terminal_output("Usage: shop list")

        elif action == "repair":
            if repair_tool_durability <= 0:
                display_terminal_output("Your repair tool is broken.")
                return

            if door_to_repair_state == "broken":
                display_terminal_output(f"The {door_name} is broken and cannot be repaired with a wrench.")
                return

            if door_to_repair_durability >= door_max_durability:
                display_terminal_output(f"The {door_name} is already at full durability.")
                return

            # Apply repair
            repair_amount = 20 # Example: Repair 20 durability per use, adjust as needed
            new_durability = min(door_max_durability, door_to_repair_durability + repair_amount)

            if target == "left_door":
                left_door_durability = new_durability
            else:
                right_door_durability = new_durability

            repair_tool_durability -= repair_tool_decay_per_use # Decrease tool durability
            repair_tool_durability = max(0.0, repair_tool_durability)
            display_terminal_output(f"Repaired the {door_name}. Durability: {new_durability}/{door_max_durability}. Repair tool durability: {repair_tool_durability:.1f}/{max_repair_tool_durability:.1f}")

        elif action == "place":
        if len(args) > 0 and args[0].lower() == "crucifix":
            global crucifix_inventory, placed_crucifixes, total_placed_crucifixes, max_placed_crucifixes
            current_location = "ControlRoom"  # Assuming player is in Control Room for now

            if crucifix_inventory > 0 and total_placed_crucifixes < max_placed_crucifixes:
                crucifix_inventory -= 1
                placed_crucifixes[current_location] = placed_crucifixes.get(current_location, 0) + 1
                total_placed_crucifixes += 1
                renpy.notify("You placed a crucifix in the Control Room.")
            elif crucifix_inventory == 0:
                renpy.notify("You don't have any crucifixes.")
            else:
                renpy.notify("You have placed the maximum number of crucifixes.")
                # Add else for other placeable items later

            # Remove haunting from machines in this location
            current_location = "ControlRoom" # Assuming player is in Control Room
            # You'll need your mapping of locations to machines here
            # Example placeholder: Get machines in the current location
            machines_in_location = ["coolant_pump", "moderator_rod_drive"] # Replace with your logic to get machines in current_location

            for machine_name in machines_in_location:
                if machine_name in reactor_components and reactor_components[machine_name]["haunted"]:
                    reactor_components[machine_name]["haunted"] = False
                    renpy.notify(f"The {machine_name} is no longer haunted.") # Notification

        elif action == "use": # Added 'use' command
            if len(command_parts) < 2:
                display_terminal_output("Usage: use [item_name]")
                return

            item_to_use = command_parts[1]
            if item_to_use == "ration":
                consume_ration()
            elif item_to_use == "coffee_tea":
                use_coffee_tea()
            elif item_to_use == "oil_can": # Add using oil cans
                # Need to implement refill_generator_oil function to
            elif action == "hide":
                    # Added hide command logic
                        global is_hiding
                if not is_hiding:
                    is_hiding = True
                    renpy.notify("You are now hiding under the floorboards.")
                else:
                    display_terminal_output("You are already hiding.")
            elif action == "unhide":
                # Added unhide command logic
            if is_hiding:
                is_hiding = False
                renpy.notify("You are no longer hiding.")
            else:
                display_terminal_output("You are not hiding.")

            display_terminal_output(f"Unknown item: {item_to_use}")
            # Note: Need to uncomment and implement refill_generator_oil logic here


        else: # Corrected indentation for the final else of the 'use' block
            display_terminal_output(f"Unknown item: {item_to_use}")
                    elif action == "rest":
                        if current_phase == "rest_payment":
                            rest_in_control_room()
                        else:
                            display_terminal_output("You can only rest during the Rest and Payment phase.")


# The game starts here.
    label start:

        # Example game loop structure
        label game_loop:
        python:
        dt = renpy.update(realtime=True)

        # Apply time dilation if overdosed
        if caffeine_overdosed:
            dt *= 1.5

        game_time_in_minutes_real += dt / 60.0
        # Convert real minutes to in-game time (assuming 48 real minutes = 1 in-game day)
        # This will need adjustment based on your desired time scale

        # Determine the current phase
        new_phase = "survival" # Default to survival
        if 6 <= in_game_hour < 13:
            new_phase = "fixing"
        elif 13 <= in_game_hour < 24:
            new_phase = "rest_payment"

        # Check for phase transition
        if new_phase != current_phase:
            current_phase = new_phase
        # Call phase-specific start functions here
            if current_phase == "fixing":
                start_fixing_phase()
            elif current_phase == "rest_payment":
                # Call function to start rest and payment phase
                renpy.notify("Entering Rest and Payment Phase.") # Temporary notification
            elif current_phase == "survival":
                # Call function to start survival phase
                renpy.notify("Entering Survival Phase.") # Temporary notification

        # Convert real minutes to in-game time (after applying potential time dilation for updates)
        total_in_game_minutes = (game_time_in_minutes_real / 48.0) * (24 * 60)
        in_game_hour = int((total_in_game_minutes / 60) % 24)
        in_game_minute = int(total_in_game_minutes % 60)

        # Update Experiment containment (runs in every iteration regardless of phase)
        update_experiment_containment(dt)

        # Handle Experiment door encounters
        # Left Door
        if left_door_experiment_timer > 0:
            left_door_experiment_timer -= dt
            if left_door_experiment_timer <= 0:
                left_door_experiment_timer = -1.0 # End encounter
                # Add logic here to make the Experiment move away from the door
                renpy.notify("The Experiment moved away from the left door.")
            else:
                # Apply damage during encounter
                hits_this_update = experiment_hit_rate_per_second * dt
                damage_to_deal = experiment_held_door_hit_damage if left_door_state == "holding" else experiment_unheld_door_hit_damage
                damage_applied = damage_to_deal * hits_this_update
                left_door_durability -= damage_applied
                left_door_durability = max(0, left_door_durability)

                # Check if the door is broken
                if left_door_durability <= 0 and left_door_state != "broken":
                    left_door_state = "broken"
                    renpy.notify("The left door is broken!")
                    # Add logic here to allow Experiment to enter (will need to modify update_monster_positions)

        # Right Door
        if right_door_experiment_timer > 0:
            right_door_experiment_timer -= dt
            if right_door_experiment_timer <= 0:
                right_door_experiment_timer = -1.0 # End encounter
                # Add logic here to make the Experiment move away from the door
                renpy.notify("The Experiment moved away from the right door.")
            else:
                # Apply damage during encounter
                hits_this_update = experiment_hit_rate_per_second * dt
                damage_to_deal = experiment_held_door_hit_damage if right_door_state == "holding" else experiment_unheld_door_hit_damage
                damage_applied = damage_to_deal * hits_this_update
                right_door_durability -= damage_applied
                right_door_durability = max(0, right_door_durability)


        # Update monster positions during the survival phase
        if current_phase == "survival":
            update_monster_positions() # Call the new monster update function
            check_hide_monster() # Check for the Hide monster during the survival phase
            # update_survival_stats is called within the survival phase logic
        jump game_loop


    # Initial scene setup (control room background)
    scene black # Start with a black screen or your initial control room image

    # Call the main game UI screen
    # call screen game_ui # Placeholder - define this screen below

    # Game loop will run here (or within the screen logic)
    # For now, just a return to end if not using a persistent screen
# The game loop will likely involve calling update_game_state periodically

# Example of a simple loop structure (will need a way to exit)
    return
    # --------------------
    # Game UI Screen Definition
    # --------------------
    # Define your main game UI screen here using Ren'Py Screen Language.
    # This will include camera buttons, power meter, reactor controls, etc.
    screen game_ui:
    tag menu # Optional: tag the screen

    # Add UI elements here

    # Placeholder for screen elements
    pass

    # --------------------
    # Game Logic (Python Functions)
    # --------------------
    # Define your Python functions for game mechanics here.
    def move_creatures():
    pass # Placeholder for creature movement logic


# --------------------
# End of Script
# --------------------

