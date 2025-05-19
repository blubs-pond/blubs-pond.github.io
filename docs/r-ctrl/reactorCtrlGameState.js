let gameState = {
    currentScene: 'start', // Start at a 'start' scene
    gameTime: { hours: 0, minutes: 0 },
    // playerInventory: [], // Moved to player object
    // playerLocation: "ControlRoom", // Moved to player object
    playerMoney: 1000, // Starting money
    failedDevices: [], // Array of device IDs that have failed

    // Player object to hold player-specific state
    player: {
        location: "ControlRoom", // Player's current location key
        inventory: [], // Array of item strings
        stats: { // Player stats (moved from playerStats)
            hunger: 0, // 0-100, 100 is starving
            insomnia: 0, // 0-100, 100 is critical insomnia
            sanity: 100 // 0-100, 0 is critical
        },
        // Add other player-specific properties here as needed
        hungerLevel: 0.0, // Moved from playerStats
        insomniaLevel: 0.0, // Moved from playerStats
        caffeineEffectTimer: 0.0, // Moved from playerStats
        caffeineCrashTimer: 0.0, // Moved from playerStats
        caffeineOverdosed: false, // Moved from playerStats
        hidingAbuseCounter: 0.0, // Moved from playerStats
        isHiding: false, // Moved from playerStats
        experimentEntryTimer: -1.0, // Moved from playerStats
        doorBeingHeld: "none", // Moved from playerStats
    },


    // Reactor-related variables
    reactorState: {
        reactor_temp: 50.0, // Temperature
        reactor_pressure: 10.0, // Pressure
        coolant_level: 100.0, // Coolant level
        radiation_level: 0.0, // Radiation level
        reactor_power_output: 100.0, // Power Output
        stability: 90 // Percentage
    },

    // playerStats: { // Removed as stats are now in the player object
    //     hunger: 0, // 0-100, 100 is starving
    //     insomnia: 0, // 0-100, 100 is critical insomnia
    //     sanity: 100 // 0-100, 0 is critical
    // },

    tasks: {
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

    // Generator and pump-related states
    generatorState: {
        power: 0,
        fuel: 100
    },

    // Monster state
    monsterState: [],
    monsters: {
        "Shadow": { location: null, state: "dormant", isNearPlayer: false } // Initial state for Shadow
    },

    // Reactor-related parameters for temperature and pump management
    backup_generator_oil: 100.0, // Backup generator oil level
    pump_speed: 50, // Pump speed (0-100)
    temp_increase_rate: 0.1, // Base rate temperature increases
    temp_cool_rate_multiplier: 0.05, // How much pump speed affects cooling
    temp_meltdown_threshold: 200.0, // Temperature for meltdown
    temp_power_cutout_threshold: 20.0, // Temperature for power cutout
    temp_core_shutdown_overspeed_threshold: 80.0, // Temp above which high speed is safe
    pump_speed_overspeed_threshold: 80, // Pump speed causing shutdown at low temp

    // Door states
    doorState: {
        door1: { state: 'closed', durability: 100 },
        door2: { state: 'closed', durability: 100 }
    },

    // Inventory items
    oilCans: 2,
    lubricantKits: 1,
    rations: 0, // Assuming rations start at 0
    coffeeTea: 0, // Assuming coffee/tea starts at 0
    repairToolDurability: 100.0, // Starting repair tool durability

    // Player-specific states - These are now moved INSIDE the player object
    // hungerLevel: 0.0,
    // insomniaLevel: 0.0,
    // sanity: 100,
    // caffeineEffectTimer: 0.0,
    // caffeineCrashTimer: 0.0,
    // caffeineOverdosed: false,
    // hidingAbuseCounter: 0.0,
    // isHiding: false,
    // experimentEntryTimer: -1.0, // -1.0 if not in room
    // doorBeingHeld: "none", // Tracks which door is being held ('door1', 'door2', or 'none')


    // Camera system
    cameraState: {
        "camera1": { isDistorted: false },
        "camera2": { isDistorted: false }
    },
    shadowVisible: false, // Track if the Shadow is currently visible on a camera

    // Flags and states for specific conditions
    gameFlags: {}, // Object to store boolean flags
    recentHallwayMovement: false, // Track if there's been recent monster movement in hallways

    // Ventilation System
    ventilationStatus: 'working', // 'working' or 'blocked'
    ventilationBlockageLevel: 0, // 0-100, 100 is fully blocked
    ventilationBlockedTimer: 0, // Tracks how long ventilation has been blocked

    // Control Archives and Panel Status
    caPanelStatus: 'working', // 'working' or 'broken'
    roomPanelStatus: { // Status for panels in specific rooms controlled by CA
        'RR': 'working',
        'CP': 'working',
        'BW': 'working'
    },
    rebootAllCaCooldown: 0, // Cooldown timer for 'reboot ca all' command
    rebootRoomCaProgress: { // Progress for individual room CA reboots
        'RR': 0,
        'CP': 0,
        'BW': 0
    },
    criticalReactorTempIncreaseRate: 0 // Increased temperature rate when critical panels are broken
};


export { gameState };