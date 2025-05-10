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
    },
    generatorState: {
        power: 0,
        fuel: 100
    },
    monsterState: [], // Array of monster objects
    monsters: { // Object to track individual monster states
        "Shadow": { location: null, state: "dormant", isNearPlayer: false } // Initial state for Shadow, added isNearPlayer
    },
    doorState: {
        door1: { state: 'closed', durability: 100 },
        door2: { state: 'closed', durability: 100 }
    },
    oilCans: 2,
    lubricantKits: 1,
    rations: 0, // Assuming rations start at 0 based on the Ren'Py script example
    coffeeTea: 0, // Assuming coffee/tea starts at 0
    repairToolDurability: 100.0, // Assuming a starting repair tool
    hungerLevel: 0.0,
    insomniaLevel: 0.0,
    sanity: 100,
    caffeineEffectTimer: 0.0,
    caffeineCrashTimer: 0.0,
    caffeineOverdosed: false,
    hidingAbuseCounter: 0.0,
    isHiding: false,
    experimentEntryTimer: -1.0, // -1.0 if not in room
    doorBeingHeld: "none", // Tracks which door is being held ('door1', 'door2', or 'none')
    cameraState: { // Object to track the state of cameras
    "camera1": { isDistorted: false }, // Example state property
    "camera2": { isDistorted: false }
    },
    shadowVisible: false, // Track if the Shadow is currently visible on a camera
    
    gameFlags: {} // Object to store boolean flags
};