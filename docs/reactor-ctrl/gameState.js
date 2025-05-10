let gameState = {
    currentScene: 'start', // Start at a 'start' scene
    gameTime: { hours: 0, minutes: 0 },
    playerInventory: [], // Array of item strings
    reactorState: {
        // Placeholder reactor state properties
        coreTemperature: 500, // Degrees Celsius
        pressure: 1000, // PSI
        coolantLevel: 80, // Percentage
        powerOutput: 100, // Percentage
        stability: 90 // Percentage
    },
    playerLocation: "ControlRoom", // Player's current location key
    playerStats: {
        hunger: 0, // 0-100, 100 is starving
        insomnia: 0, // 0-100, 100 is critical insomnia
        sanity: 100 // 0-100, 0 is critical
    },
    playerMoney: 1000, // Starting money
    monsters: {
        // Dummy monster data: replace with actual monster types, positions, and states
        "monster1": {
            type: "basic_android",
            mapPosition: { line: -1, column: -1 }, // Will be updated based on map
            state: "idle", // idle, moving, attacking, disabled
            target: null // Location key or player if attacking
        },
        "monster2": {
             type: "security_bot",
            mapPosition: { line: -1, column: -1 }, // Will be updated based on map
            state: "patrolling", // idle, moving, attacking, disabled
            patrolRoute: ["Hallway1", "Hallway2", "ControlRoom"], // Example route
            currentTargetIndex: 0
        }
    },
    failedDevices: [], // Array of device IDs that have failed
    tasks: {
        // Tasks the player needs to complete
        // Dummy data: replace with actual tasks, states, and required items/actions
        "repairReactor": {
            description: "Repair the primary reactor coolant pump.",
            location: "ReactorRoom",
            requiredItem: "wrench",
            isCompleted: false
        },
         "restorePower": {
            description: "Restore auxiliary power to the server room.",
            location: "ServerRoom",
            requiredAction: "flip_switch",
            isCompleted: false
        }
    }
};