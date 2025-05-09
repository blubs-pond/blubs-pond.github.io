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
    import random # Import the random module for breakdown chance

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

    # Player resources
    player_money = 1000.0 # Starting money
    rations = 0
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
    # Add variables for hunger/insomnia increase rates
    hunger_increase_rate = 0.1 # Hunger increase per real-life minute
    insomnia_increase_rate = 0.05 # Insomnia increase per real-life minute

    # Game Time (Initial Values)
    game_time_in_hours = 0 # In-game hours
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
        "pump_reinforced": 0.0,
        "pipe_upgraded": 0, # 0% reduction if not installed
        "reservoir_upgraded": 0,
        "gauge_upgraded": 0,
        "pump_upgraded": 0,
        "pipe_reinforced": 0, # 0% reduction if not installed
        "reservoir_reinforced": 0,
        "gauge_reinforced": 0,
        "pump_reinforced": 0,
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

    # Define the breakdown reduction percentage for each part type
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

    def update_reactor_temp(self):
        global reactor_temp, pump_speed, core_active, game_over, meltdown_rate, generator_status

       if not core_active:
       # Temperature might slowly decrease when core is off, or stay stable
       # For now, let's assume it stays relatively stable or decreases slowly
       # reactor_temp -= 0.05 # Optional: slow cooling when off
            return

       # Temperature increases over time
        reactor_temp += self.temp_increase_rate

       # Temperature cooling based on pump speed
        cooling_effect = self.pump_speed * self.temp_cool_rate_multiplier
        reactor_temp -= cooling_effect

       # Ensure temperature doesn't go below a minimum
        reactor_temp = max(reactor_temp, 0)

       # Check for power cutout (temperature too low)
        if reactor_temp < self.temp_power_cutout_threshold:
            self.core_active = False
            # Trigger power cutout event (need to add this later)
            renpy.notify("Power cutout! Reactor offline.")
            # Game over if power cuts out and generator is broken
            if self.generator_status == "broken":
                self.game_over = True
                renpy.notify("Power lost! Meltdown imminent.")


       # Check for core shutdown (pump speed too high for temperature)
        if self.pump_speed > self.pump_speed_overspeed_threshold and reactor_temp < self.temp_core_shutdown_overspeed_threshold:
            self.core_active = False
            # Trigger core shutdown event (need to add this later)
            renpy.notify("Core shutdown due to overspeed! Reactor offline.")
            # Game over if core shuts down and generator is broken
            if self.generator_status == "broken":
                self.game_over = True
                renpy.notify("Power lost! Meltdown imminent.")


       # Check for meltdown (temperature too high)
        if reactor_temp >= self.temp_meltdown_threshold:
            # Enter meltdown state
            reactor_temp += self.meltdown_rate # Accelerate temp increase
            if reactor_temp >= self.temp_meltdown_threshold + 50: # Example: Game over after a certain point in meltdown
                self.game_over = True
                # Trigger game over event (need to add this later)


    def set_pump_speed(self, speed):
        global pump_speed
       # Add logic to limit pump speed to a valid range (e.g., 0-100)
        self.pump_speed = max(0, min(100, speed))
        renpy.notify("Pump speed set to: " + str(self.pump_speed))

    def restart_core(self):
        global core_active, backup_generator_oil, generator_status
        if not self.core_active and self.backup_generator_oil > 0 and self.generator_status != "broken":
            self.core_active = True
            self.backup_generator_oil -= 10 # Example: Restarting uses generator oil
            renpy.notify("Core restarting...")
       # Add a timer for the restart process if needed
        elif not self.core_active and self.generator_status == "broken":
            renpy.notify("Cannot restart core: Generator is broken.")
        elif not self.core_active and self.backup_generator_oil <= 0:
            renpy.notify("Cannot restart core: Generator oil is low.")
        else:
            renpy.notify("Core is already active.")

    # Function to install a generator part
    def install_generator_part(self, part_type):
        pass # Implementation coming later


       # Placeholder for pipe sabotage logic
       def sabotage_pipe(self, pipe_id):
              pass # Implementation coming later

       # Placeholder for pipe repair logic
       def repair_pipe(self, pipe_id):
              pass # Implementation coming later

       # Placeholder for updating coolant levels
       def update_coolant_level(self):
              pass # Implementation coming later (will factor in leaks)

    # Function to refuel generator oil
       # Placeholder for refilling generator oil
       def refill_generator_oil(self):
              pass # Implementation coming later (will consume oil cans)

    def calculate_total_breakdown_reduction(self):
        """Calculates the total breakdown chance reduction from installed parts based on their durability."""
        total_reduction = 0.0
        for part_type, current_durability in self.installed_generator_parts.items():
            if current_durability > 0 and part_type in self.part_breakdown_reduction and part_type in self.max_part_durability:
                # The reduction is proportional to the remaining durability
                reduction_factor = current_durability / self.max_part_durability[part_type]
                total_reduction += self.part_breakdown_reduction[part_type] * reduction_factor
 return total_reduction

    def calculate_and_earn_wage(self):
        global player_money, reactor_power_output, baseline_power_consumption, money_per_excess_power_unit

        excess_power = max(0.0, self.reactor_power_output - self.baseline_power_consumption)
        wage_earned = excess_power * self.money_per_excess_power_unit

        self.player_money += wage_earned
        renpy.notify(f"Earned ${wage_earned:.2f} in wages.")

       def update_lubricant(self, current_real_time):
              global generator_lubricant_cycles, lubricant_replacement_threshold, generator_status, last_day_increment_time, real_life_hours_after_day_3, breakdown_chance_per_hour, game_over
 # import random # Already imported at the top

              # Check if an in-game day has passed (48 real-life minutes)
              if current_real_time - self.last_day_increment_time >= 48.0:
                     self.generator_lubricant_cycles += 1
                     self.last_day_increment_time = current_real_time # Update the last increment time

            # Calculate and earn daily wage
            self.calculate_and_earn_wage()

 # Check if lubricant needs replacement
 if self.generator_lubricant_cycles >= self.lubricant_replacement_threshold:
                            self.generator_status = "needs_lubricant"
                            renpy.notify("Generator lubricant needs replacement!")

        # Calculate real-life hours after day 3
        if self.generator_lubricant_cycles >= 4:
            total_real_life_minutes = self.game_time_in_minutes_real
            minutes_in_first_3_days = 3 * 48.0
            if total_real_life_minutes > minutes_in_first_3_days:
                 self.real_life_hours_after_day_3 = (total_real_life_minutes - minutes_in_first_3_days) / 60.0
            else:
                 self.real_life_hours_after_day_3 = 0.0 # Ensure it's not negative before day 4


            # Calculate base breakdown chance based on time
            base_breakdown_chance = self.real_life_hours_after_day_3 * self.breakdown_chance_per_hour

            # Calculate total reduction from installed parts
            parts_reduction = self.calculate_total_breakdown_reduction()

            # Apply reduction to get the final breakdown chance
            current_breakdown_chance = max(0.0, base_breakdown_chance - parts_reduction)


            # Ensure breakdown chance doesn't exceed 100%
            current_breakdown_chance = min(current_breakdown_chance, 100.0)

            # Check for breakdown
            if self.generator_status != "broken": # Only calculate chance if not already broken
                if random.random() * 100 < current_breakdown_chance:
                    self.generator_status = "broken"
                    renpy.notify("The generator has broken down!")
                    # Game over if core is off when generator breaks
                    if not self.core_active:
                        self.game_over = True
                        renpy.notify("Power lost! Meltdown imminent.")

       def replace_lubricant(self):
              global lubricant_kits, generator_lubricant_cycles, generator_status, core_active

              if self.lubricant_kits > 0:
                     self.lubricant_kits -= 1
                     self.generator_lubricant_cycles = 0

                     # Determine the new generator status based on the core's state
                     if not self.core_active:
                            self.generator_status = "running"
                     else:
                            self.generator_status = "idle"

                     renpy.notify("Generator lubricant replaced.")
              else:
                     renpy.notify("You don't have any lubricant kits.")

    # Add functions for survival item consumption
    def consume_ration(self):
        global rations, hunger_level
        if self.rations > 0:
            self.rations -= 1
            self.hunger_level = max(0.0, self.hunger_level - 30.0) # Example: Reduce hunger by 30
            renpy.notify("Consumed a ration. Feeling less hungry.")
        else:
            renpy.notify("You don't have any rations.")

    def use_coffee_tea(self):
        global coffee_tea, coffee_tea_uses_left, insomnia_level, caffeine_effect_timer, caffeine_crash_timer
        if self.coffee_tea > 0 or self.coffee_tea_uses_left > 0:
            if self.coffee_tea_uses_left == 0: # Starting a new coffee/tea item
                 self.coffee_tea -= 1
                 self.coffee_tea_uses_left = 3 # Set uses for the new item

            if self.coffee_tea_uses_left > 0:
                 self.coffee_tea_uses_left -= 1
                 self.insomnia_level = max(0.0, self.insomnia_level - 20.0) # Example: Reduce insomnia by 20
                 self.caffeine_effect_timer = 60.0 # Example: Caffeine effect lasts 60 real-life minutes
                 self.caffeine_crash_timer = self.caffeine_effect_timer + 30.0 # Example: Crash occurs 30 mins after effect ends
                 renpy.notify("Drank some coffee/tea. Feeling more alert.")
            else:
                renpy.notify("The coffee/tea is empty.")
        else:
            renpy.notify("You don't have any coffee or tea.")


    # Function to update survival stats over time
    def update_survival_stats(self, dt):
        global hunger_level, insomnia_level, caffeine_effect_timer, caffeine_crash_timer, hunger_increase_rate, insomnia_increase_rate

        # Increase hunger and insomnia over time
        self.hunger_level += self.hunger_increase_rate * (dt / 60.0) # dt is in seconds, convert to minutes
        self.insomnia_level += self.insomnia_increase_rate * (dt / 60.0)

        # Update caffeine timers (implementation to be added later)

       # Function to update reactor power output
       def update_reactor_power_output(self):
              global reactor_temp, reactor_pressure, reactor_power_output, core_active

              if self.core_active:
              # Calculate power output based on reactor parameters
              # This is a simplified example; you'll refine this formula
              output = 100.0 # Base output when active
              if self.reactor_temp > 150 or self.reactor_pressure > 15: # Example: Reduced output at high temp/pressure
                     output *= 0.5
              elif self.reactor_temp < 30 or self.reactor_pressure < 5: # Example: Reduced output at low temp/pressure
                     output *= 0.75

              self.reactor_power_output = max(0, min(100, output)) # Ensure output is within a range
              else:
              self.reactor_power_output = 0 # No significant power output when core is off

       def update_generator_oil(self):
              global backup_generator_oil, core_active, game_over, generator_lubricant_cycles, oil_consumption_rate, oil_leak_multiplier, generator_status, lubricant_aging_oil_multiplier
              # Generator is running, consume oil
        if not self.core_active and self.generator_status != "broken": # Only consume oil if core is off and generator is not broken

            # Increase consumption based on lubricant aging
            aging_multiplier = self.generator_lubricant_cycles * self.lubricant_aging_oil_multiplier
            consumption *= (1 + aging_multiplier) # Apply aging multiplier

              consumption = self.oil_consumption_rate
              # Add oil consumption due to leaks (we'll add pipe leak tracking later)
              # if pipes_leaking: # Placeholder for leak check
              #     consumption *= self.oil_leak_multiplier

            # Add oil consumption due to worn generator parts (implement later)
            # worn_part_oil_multiplier = self.calculate_worn_part_oil_consumption_multiplier() # Need to create this function
            # consumption *= (1 + worn_part_oil_multiplier)


              self.backup_generator_oil -= consumption
              self.backup_generator_oil = max(0, self.backup_generator_oil) # Ensure it doesn't go below 0

              # Check for game over if oil runs out while core is off
              if self.backup_generator_oil <= 0:
                     self.game_over = True
                     # Trigger game over event (oil depleted while core off)
                     renpy.notify("Generator out of oil! Meltdown imminent.")
       # --------------------

       def update_game_state(self, dt):
 # dt is the time elapsed since the last update (in seconds)
 # We need to track total real-life minutes
 global game_time_in_minutes_real, game_over
 if game_over: # Stop updates if the game is over
 return

        self.game_time_in_minutes_real += dt / 60.0 # Convert seconds to minutes

        # Update lubricant based on real-life time and check for breakdown
        self.update_lubricant(self.game_time_in_minutes_real)

        # Update generator oil if the core is off and generator is not broken
        self.update_generator_oil()

        # Update survival stats
        self.update_survival_stats(dt)

        # Update reactor temperature
        self.update_reactor_temp()

        # Update reactor power output
        self.update_reactor_power_output()

        # ... other game state updates like creature movement, etc. ...

       label start:

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
