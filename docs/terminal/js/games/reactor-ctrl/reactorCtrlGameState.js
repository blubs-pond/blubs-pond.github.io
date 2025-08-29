/**
 * @typedef {Object} GameState - Represents the overall state of the game.
 * @property {string} currentScene - The current scene of the game.
 * @property {Object} gameTime - The current game time.
 * @property {number} gameTime.hours - The hour of the day (0-23).
 * @property {number} gameTime.minutes - The minute of the hour (0-59).
 * @property {number} lastUpdateTime - The timestamp of the last game update.
 * @property {number} gameTimeInMinutesReal - Accumulated real time passed in minutes.
 * @property {string} currentPhase - The current game phase (survival, fixing, rest_payment).
 * @property {boolean} awaitingExitConfirmation - Flag to track if the game is awaiting exit confirmation.
 * @property {number} playerMoney - The player's current money.
 * @property {Array<string>} failedDevices - Array of device IDs that have failed.
 * @property {Object} player - Object holding player-specific state.
 * @property {string} player.location - Player's current location key.
 * @property {Array<string>} player.inventory - Array of item strings.
 * @property {Object} player.stats - Player stats.
 * @property {number} player.stats.hunger - Hunger level (0-100).
 * @property {number} player.stats.insomnia - Insomnia level (0-100).
 * @property {number} player.stats.sanity - Sanity level (0-100).
 * @property {number} player.hungerLevel - Player's hunger level.
 * @property {number} player.insomniaLevel - Player's insomnia level.
 * @property {number} player.caffeineEffectTimer - Timer for caffeine effect.
 * @property {number} player.caffeineCrashTimer - Timer for caffeine crash.
 * @property {boolean} player.caffeineOverdosed - Flag indicating caffeine overdose.
 * @property {number} player.hidingAbuseCounter - Counter for hiding abuse.
 * @property {boolean} player.isHiding - Flag indicating if the player is hiding.
 * @property {number} player.experimentEntryTimer - Timer for experiment entry.
 * @property {string} player.doorBeingHeld - Tracks which door is being held ('door1', 'door2', or 'none').
 * @property {Object} reactorState - Reactor-related variables.
 * @property {number} reactorState.reactor_temp - Temperature of the reactor.
 * @property {number} reactorState.reactor_pressure - Pressure of the reactor.
 * @property {number} reactorState.coolant_level - Coolant level of the reactor.
 * @property {number} reactorState.radiation_level - Radiation level of the reactor.
 * @property {number} reactorState.reactor_power_output - Power output of the reactor.
 * @property {number} reactorState.stability - Stability of the reactor (percentage).
 * @property {Object} machines - Object containing machine states.
 * @property {Object} tasks - Object containing task descriptions and completion status.
 * @property {Object} generatorState - Generator-related states.
 * @property {number} generatorState.power - Power level of the generator.
 * @property {number} generatorState.fuel - Fuel level of the generator.
 * @property {Object} monsters - Object containing monster states.
 * @property {number} backup_generator_oil - Backup generator oil level.
 * @property {number} pump_speed - Pump speed (0-100).
 * @property {number} temp_increase_rate - Base rate temperature increases.
 * @property {number} temp_cool_rate_multiplier - How much pump speed affects cooling.
 * @property {number} temp_meltdown_threshold - Temperature for meltdown.
 * @property {number} temp_power_cutout_threshold - Temperature for power cutout.
 * @property {number} temp_core_shutdown_overspeed_threshold - Temp above which high speed is safe.
 * @property {number} pump_speed_overspeed_threshold - Pump speed causing shutdown at low temp.
 * @property {Object} doorState - Door states.
 * @property {number} oilCans - Number of oil cans in inventory.
 * @property {number} lubricantKits - Number of lubricant kits in inventory.
 * @property {number} rations - Number of rations in inventory.
 * @property {number} coffeeTea - Number of coffee/tea items in inventory.
 * @property {number} repairToolDurability - Durability of the repair tool.
 * @property {Object} cameraState - Camera system states.
 * @property {boolean} shadowVisible - Track if the Shadow is currently visible on a camera.
 * @property {Object} gameFlags - Object to store boolean flags.
 * @property {boolean} recentHallwayMovement - Track if there's been recent monster movement in hallways.
 * @property {string} ventilationStatus - Ventilation system status ('working' or 'blocked').
 * @property {number} ventilationBlockageLevel - Ventilation blockage level (0-100).
 * @property {number} ventilationBlockedTimer - Tracks how long ventilation has been blocked.
 * @property {string} caPanelStatus - Control Archives panel status ('working' or 'broken').
 * @property {Object} roomPanelStatus - Status for panels in specific rooms controlled by CA.
 * @property {number} rebootAllCaCooldown - Cooldown timer for 'reboot ca all' command.
 * @property {Object} rebootRoomCaProgress - Progress for individual room CA reboots.
 * @property {number} criticalReactorTempIncreaseRate - Increased temperature rate when critical panels are broken.
 */
import { locations } from "./reactorCtrlGameSettings.js";


let gameState = {
    currentScene: 'start',
    gameTime: { hours: 0, minutes: 0 },
    lastUpdateTime: 0,
    gameTimeInMinutesReal: 0,
    currentPhase: "survival",
    awaitingExitConfirmation: false,
    playerMoney: 1000,
    failedDevices: [],

    player: {
        location: "CR",
        inventory: [],
        stats: {
            hunger: 0,
            insomnia: 0,
            sanity: 100
        },
        hungerLevel: 0.0,
        insomniaLevel: 0.0,
        caffeineEffectTimer: 0.0,
        caffeineCrashTimer: 0.0,
        caffeineOverdosed: false,
        hidingAbuseCounter: 0.0,
        isHiding: false,
        experimentEntryTimer: -1.0,
        doorBeingHeld: "none",
    },

    reactorState: {
        reactor_temp: 50.0,
        reactor_pressure: 10.0,
        coolant_level: 100.0,
        radiation_level: 0.0,
        reactor_power_output: 100.0,
        stability: 90
    },

    machines: {},
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

    generatorState: {
        power: 0,
        fuel: 100
    },

    monsters: {
        "Template": {
            state: "dormant",
            isNearPlayer: false,
            isHostile: true,
            canNoClip: false,
            hp: 100,
            target: null,
            goal: [],
            path: [],
            location: null
        },
        "Shadow": {
            state: "dormant",
            isNearPlayer: false,
            isHostile: true,
            canNoClip: true,
            hp: 100,
            target: null,
            goal: [], // Pathfinding goal (e.g., player location, specific room)
            path: [], // Current path to goal
            location: null // Current location shorthand key
        },
        "Hide": {
            location: "BR",
            state: "dormant",
            isNearPlayer: false,
            isHostile: false,
            canNoClip: false,
            hp: 10000,
            target: null,
            goal: [],
            path: []
    },
        "Abomination": {
            location: null,
            state: "active",
            isNearPlayer: false,
            isHostile: true,
            canNoClip: false,
            hp: 100,
            target: null,
            goal: [],
            path: []
    },
        "Loss": {
            location: null,
            state: "active",
            isNearPlayer: false,
            isHostile: false,
            canNoClip: true,
            hp: 100,
            target: null,
            goal: [],
            path: []
    }
},

    backup_generator_oil: 100.0,
    pump_speed: 50,
    temp_increase_rate: 0.1,
    temp_cool_rate_multiplier: 0.05,
    temp_meltdown_threshold: 200.0,
    temp_power_cutout_threshold: 20.0,
    temp_core_shutdown_overspeed_threshold: 80.0,
    pump_speed_overspeed_threshold: 80,

    doorState: {
        door1: { state: 'closed', durability: 100 },
        door2: { state: 'closed', durability: 100 }
    },

    oilCans: 2,
    lubricantKits: 1,
    rations: 0,
    coffeeTea: 0,
    repairToolDurability: 100.0,

    cameraState: {
        "camera1": { isDistorted: false },
        "camera2": { isDistorted: false }
    },
    shadowVisible: false,

    gameFlags: {},
    recentHallwayMovement: false,

    ventilationStatus: 'working',
    ventilationBlockageLevel: 0,
    ventilationBlockedTimer: 0,

    caPanelStatus: 'working',
    roomPanelStatus: {
        'RR': 'working',
        'CP': 'working',
        'BW': 'working'
    },
    rebootAllCaCooldown: 0,
    rebootRoomCaProgress: {
        'RR': 0,
        'CP': 0,
        'BW': 0
    },
    criticalReactorTempIncreaseRate: 0
};

export { gameState};
