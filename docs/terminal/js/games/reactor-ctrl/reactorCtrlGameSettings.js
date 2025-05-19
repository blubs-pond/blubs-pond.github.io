import { parseMapString } from './reactorCtrlGameLogic.js'; // Import the parsing function

const facilityMapString = `
+-------------+ +---+ +-------+ +-------------------------+ +-------+ +---+  +-------------+
|             | |<5>| |       | |                         | |       | |<6>|  |             |
|             | |   | |       | |                         | |       | |   |  |             |
|             | |   | | <PC>  | |                         | |       | |   |  |             |
|             +-+   | |       | |                         | |       | |   |  |             |
|    <CP>           | +--+ +--+ |                         | |       | |   +--+             |
|             +-+   | +--+ +--+ |                         +-+       | |           <BW>     |
|             | |   | |       | |          <RR>               <TR>  | |   +--+             |
|             | |   | |       | |                         +-+       | |   |  |             |
|             | |   | |       +-+                         | |       | |   |  |             |
+-------------+ |   | | <SF>                              | |       | |   |  +-------------+
+-------------+ |   | |       +-+                         | |       | |   |                 
|             | |   | |       | |                         | |       | |   |  +-------------+
|             +-+   | |       | |                         | |       | |   |  |             |
|   <Vent>          | +-------+ +-----------+ +-----------+ +-------+ |   |  |             |
|             +-+   |                       |x|                       |   |  |             |
|             | |   +-----------------------+ +-----------------------+   +--+             |
+-------------+ |<D>                        <C>                        <E>        <CA>     |
+-------------+ |   +-----------+   +-----------------+   +-----------+   +--+             |
|             | |   | +-------+ |   | +-------------+ |   | +-------+ |   |  |             |
|             | |   | |       | |   | |             | |   | |       | |   |  |             |
|             | |   | |       | |   | |             | |   | |       | |   |  |             |
|             | |   | |       | |   | |             | |   | |       | |   |  |             |
|             | |   | |       +-+   +-+             +-+   +-+       | |   |  +-------------+
|             | |   | |          <A>  x             x  <B>          | |   |                 
|             +-+   | | <GR>  +-+   +-+    <CR>     +-+   +-+  <SR> | |   |  +-------------+
|    <LAB>     x    | |       | |   | |             | |   | |       | |   |  |             |
|             +-+   | |       | |   | |      @      | |   | |       | |   |  |             |
|             | |   | |       | |   | |             | |   | |       | |   |  |             |
|             | |   | |       | |<1>| |             | |<2>| |       | |   +--+             |
|             | |   | +-------+ +---+ +-----+ +-----+ +---+ +-------+ |          <Elect>   |
|             | |<3>|                       |x|                       |   +--+             |
|             | +---+ +---------------------+ +---------------------+ |   |  |             |
|             +-------+                                             | |   |  |             |
|             x <DCR> x                     <B>                     | |   |  |             |
|             +-------+                                             | |<4>|  |             |
+-------------+       +---------------------------------------------+ +---+  +-------------+`;

const adjacentcyMatrix = {
  "CP":    ["PC"],
  "PC":    ["CP", "SF"],
  "SF":    ["PC", "RR"],
  "RR":    ["SF", "TR"],
  "TR":    ["RR", "BW"],
  "BW":    ["TR", "CA"],
  "CA":    ["BW", "Elect", "E"],
  "Elect": ["CA", "SR"],
  "SR":    ["Elect", "CR", "B"],
  "CR":    ["SR", "GR", "A", "B"],
  "GR":    ["CR", "LAB", "A"],
  "LAB":   ["GR", "DCR", "Vent"],
  "Vent":  ["LAB"],
  "DCR":   ["LAB", "D"],
  "D":     ["DCR", "C"],
  "C":     ["D", "E"],
  "E":     ["C", "CA"],
  "A":     ["CR", "GR"],
  "B":     ["CR", "SR"]
};

const gameSettings = {
    soundEnabled: true,
    musicEnabled: true,
    showGameName: true,
    doorHoldHungerCostPerSecond: 0.5,
    shadowLookSanityDrain: 5,

    // Store the map as a matrix
    facilityMatrix: parseMapString(facilityMapString),

    tasks: {
        // Example tasks (replace with actual game data)
        "repair_reactor_pump": {
            description: "Repair the primary reactor coolant pump.",
            location: "ReactorRoom",
            requiredItem: "wrench",
            isCompleted: false
        },
        "restore_power": {
            description: "Restore auxiliary power to the server room.",
            location: "ServerRoom",
            requiredAction: "flip_switch",
            isCompleted: false
        }
    },

    oil_consumption_rate: 0.1, // Base oil consumption rate for generator
    oil_leak_multiplier: 1.0, // Multiplier for oil consumption (for leaks)

        machines: {
            "reactor": {
                location: "ReactorRoom",
                description: "The main reactor core.",
                isOperational: true, // New attribute: is the machine running?
                damageLevel: 0, // New attribute: damage level of the machine (0-100)
                powerOutput: 1000 // New attribute: power output in MW
            },
            "control_panel_ca": {
                location: "ControlArchives",
                description: "Control panel for the Control Archives.",
                isOperational: true,
                damageLevel: 0,
                powerConsumption: 50 // New attribute: power consumption of the machine
            }
        },

        blastDoors: {
            "door_CR_left": {
                location: "ControlRoom",
                exit: "HallwayA",
                isOpen: true,
                durability: 100,
                isLocked: false // New attribute: Is the door locked?
            },
            "door_CR_center": {
                location: "ControlRoom",
                exit: "HallwayC",
                isOpen: true,
                durability: 100,
                isLocked: true // New attribute: Door is locked until a key is found
            },
            "door_CR_right": {
                location: "ControlRoom",
                exit: "HallwayB",
                isOpen: true,
                durability: 100,
                isLocked: false
            },
            "door_DCR_entry": {
                location: "DecontaminationRoom",
                exit: "Bunker",
                isOpen: true,
                durability: 100,
                isLocked: false
            },
            "door_DCR_exit": {
                location: "DecontaminationRoom",
                exit: "HallwayC",
                isOpen: true,
                durability: 100,
                isLocked: false
            },
            "door_LAB": {
                location: "Laboratory",
                exit: "HallwayA",
                isOpen: true,
                durability: 100,
                isLocked: false
            },
            "door_C_1": {
                location: "HallwayA",
                exit: "HallwayC",
                isOpen: true,
                durability: 100,
                isLocked: false
            },
            "door_C_2": {
                location: "HallwayB",
                exit: "HallwayC",
                isOpen: true,
                durability: 100,
                isLocked: false
            },
            "door_RR_to_D": {
                location: "ReactorRoom",
                exit: "HallwayD",
                isOpen: true,
                durability: 100,
                isLocked: false
            },
            "door_D_to_CR": {
                location: "HallwayD",
                exit: "ControlRoom",
                isOpen: true,
                durability: 100,
                isLocked: false
            },
            "door_E_CP": {
                location: "HallwayE",
                exit: "CoolantPumpStation",
                isOpen: true,
                durability: 100,
                isLocked: false
            },
            "door_E_Vent": {
                location: "HallwayE",
                exit: "VentilationSystems",
                isOpen: true,
                durability: 100,
                isLocked: false
            },
            "door_E_PC": {
                location: "HallwayE",
                exit: "PowerConverterRoom",
                isOpen: true,
                durability: 100,
                isLocked: false
            },
            "door_E_GR": {
                location: "HallwayE",
                exit: "GeneratorRoom",
                isOpen: true,
                durability: 100,
                isLocked: false
            }
        },

        cameras: {
            "camera1": {
                mapMarker: "<1>",
                description: "A view of the junction in Hallway 1.",
                isDistorted: false,
                location: "HallwayA",
                batteryLife: 100, // New attribute: battery life as a percentage
                status: "active" // New attribute: camera status (active, malfunctioning, off)
            },
            "camera2": {
                mapMarker: "<2>",
                description: "Monitoring a section of Hallway 2.",
                isDistorted: false,
                location: "HallwayB",
                batteryLife: 85,
                status: "active"
            },
            "camera3": {
                mapMarker: "<3>",
                description: "Overlooking the entrance to the Laboratory.",
                isDistorted: false,
                location: "Laboratory",
                batteryLife: 75,
                status: "active"
            },
            "camera4": {
                mapMarker: "<4>",
                description: "Providing a view of the area near the Bunker entrance.",
                isDistorted: false,
                location: "Bunker",
                batteryLife: 50,
                status: "active"
            },
            "camera5": {
                mapMarker: "<5>",
                description: "A camera view near the Power Converter Room.",
                isDistorted: false,
                location: "PowerConverterRoom",
                batteryLife: 60,
                status: "active"
            },
            "camera6": {
                mapMarker: "<6>",
                description: "Monitoring the area near the Turbine Room.",
                isDistorted: false,
                location: "TurbineRoom",
                batteryLife: 90,
                status: "active"
            }
        },

        locations: {
            "ControlRoom": {
                friendlyName: "Control Room",
                description: "You are in the main Control Room. Various consoles and monitors display the reactor's status.",
                mapMarker: "<CR>",
                exits: {
                    "HallwayA": "HallwayA",
                    "HallwayB": "HallwayB",
                    "HallwayC": "HallwayC"
                },
                securityLevel: 3, // New attribute: level of security (1-5)
                hasCreature: false, // New attribute: does this location contain hostile creatures?
                hazardLevel: 2 // New attribute: the level of hazard (1-5)
            },
            "ReactorRoom": {
                friendlyName: "Reactor Room",
                description: "The heart of the facility. The reactor core is visible behind a reinforced viewport.",
                mapMarker: "<RR>",
                exits: {
                    "HallwayD": "HallwayD",
                    "SpentFuelStorage": "SpentFuelStorage"
                },
                securityLevel: 5,
                hasCreature: true, // New attribute: creatures might be lurking here
                hazardLevel: 5 // New attribute: highly hazardous due to radiation
            },
            "TurbineRoom": {
                friendlyName: "Turbine Room",
                description: "Massive turbines generate power from the reactor's heat.",
                mapMarker: "<TR>",
                exits: {
                    "HallwayD": "HallwayD",
                    "HallwayB": "HallwayB"
                },
                securityLevel: 4,
                hasCreature: false,
                hazardLevel: 3
            },
            "SpentFuelStorage": {
                friendlyName: "Spent Fuel Storage",
                description: "Containers of spent nuclear fuel rods are stored here.",
                mapMarker: "<SF>",
                exits: {
                    "ReactorRoom": "ReactorRoom"
                },
                securityLevel: 5,
                hasCreature: true,
                hazardLevel: 5
            },
            "GeneratorRoom": {
                friendlyName: "Generator Room",
                description: "Backup generators are housed here, providing emergency power.",
                mapMarker: "<GR>",
                exits: {
                    "HallwayA": "HallwayA"
                },
                securityLevel: 3,
                hasCreature: false,
                hazardLevel: 2
            },
            "ServerRoom": {
                friendlyName: "Server Room",
                description: "Rows of servers manage the facility's data and systems.",
                mapMarker: "<SR>",
                exits: {
                    "HallwayB": "HallwayB"
                },
                securityLevel: 4,
                hasCreature: false,
                hazardLevel: 2
            },
            "Laboratory": {
                friendlyName: "Laboratory",
                description: "A small lab for testing and analysis.",
                mapMarker: "<LAB>",
                exits: {
                    "HallwayA": "HallwayA"
                },
                securityLevel: 2,
                hasCreature: false,
                hazardLevel: 2
            },
            "Bunker": {
                friendlyName: "Bunker",
                description: "A reinforced bunker for emergencies.",
                mapMarker: "<B>",
                exits: {
                    "HallwayC": "HallwayC",
                    "DecontaminationRoom": "DecontaminationRoom"
                },
                securityLevel: 5,
                hasCreature: true,
                hazardLevel: 4
            },
            "DecontaminationRoom": {
                friendlyName: "Decontamination Room",
                description: "This room is used for decontaminating personnel and equipment.",
                mapMarker: "<DCR>",
                exits: {
                    "HallwayC": "HallwayC",
                    "Bunker": "Bunker"
                },
                securityLevel: 4,
                hasCreature: false,
                hazardLevel: 3
            },
            "CoolantPumpStation": {
                friendlyName: "Coolant Pump Station",
                description: "Houses the critical coolant pumps.",
                mapMarker: "<CP>",
                exits: {
                    "HallwayE": "HallwayE"
                },
                securityLevel: 3,
                hasCreature: false,
                hazardLevel: 3
            },
            "VentilationSystems": {
                friendlyName: "Ventilation Systems",
                description: "Complex network of vents and air handlers.",
                mapMarker: "<Vent>",
                exits: {
                    "HallwayE": "HallwayE"
                },
                securityLevel: 3,
                hasCreature: false,
                hazardLevel: 3
            },
            "ElectricalSwitchyard": {
                friendlyName: "Electrical Switchyard",
                description: "High-voltage equipment for external power distribution.",
                // Changed map marker to fit within the character limit per grid cell
                mapMarker: "<E>",
                exits: {
                    "HallwayD": "HallwayD"
                },
                securityLevel: 4,
                hasCreature: false,
                hazardLevel: 4
            },
            "WaterTreatmentFacility": {
                friendlyName: "Water Treatment Facility",
                description: "Processes and treats water for the facility.",
                mapMarker: "<BW>",
                exits: {
                    "HallwayB": "HallwayB"
                },
                securityLevel: 2,
                hasCreature: false,
                hazardLevel: 3
            },
            "ControlArchives": {
                friendlyName: "Control Archives",
                description: "A room storing archived control data and auxiliary panels.",
                mapMarker: "<CA>",
                exits: {
                    "HallwayC": "HallwayC"
                },
                securityLevel: 3,
                hasCreature: false,
                hazardLevel: 2
            },

            "HallwayA": {
                friendlyName: "Hallway 1",
                description: "A vertical corridor connecting the west side of the facility.",
                mapMarker: "<A>",
                exits: {
                    "Laboratory": "Laboratory",
                    "GeneratorRoom": "GeneratorRoom",
                    "ControlRoom": "ControlRoom",
                    "Bunker": "Bunker",
                    "HallwayC": "HallwayC"
                }
            },

            "HallwayB": {
                friendlyName: "Hallway 2",
                description: "A vertical corridor connecting the east side of the facility.",
                mapMarker: "<B>",
                exits: {
                    "ServerRoom": "ServerRoom",
                    "ControlRoom": "ControlRoom",
                    "TurbineRoom": "TurbineRoom",
                    "HallwayC": "HallwayC"
                }
            },

            "HallwayC": {
                friendlyName: "Hallway 3",
                description: "A horizontal corridor connecting Hallways 1 and 2, leading towards the Decontamination Room and Bunker.",
                mapMarker: "<C>",
                exits: {
                    "HallwayA": "HallwayA",
                    "HallwayB": "HallwayB",
                    "HallwayD": "HallwayD",
                    "HallwayE": "HallwayE",
                    "DecontaminationRoom": "DecontaminationRoom",
                    "Bunker": "Bunker",
                    "ControlArchives": "ControlArchives"
                }
            },

            "HallwayD": {
                friendlyName: "Hallway 4",
                description: "A horizontal corridor connecting the Reactor Room and Turbine Room areas.",
                mapMarker: "<D>",
                exits: {
                    "ReactorRoom": "ReactorRoom",
                    "TurbineRoom": "TurbineRoom",
                    "HallwayC": "HallwayC",
                    "ControlRoom": "ControlRoom"
                }
            },

            "HallwayE": {
                friendlyName: "Hallway 5",
                description: "A passageway near the Backup Systems and Pump Station.",
                mapMarker: "<E>",
                exits: {
                    "CoolantPumpStation": "CoolantPumpStation",
                    "VentilationSystems": "VentilationSystems",
                    "PowerConverterRoom": "PowerConverterRoom",
                    "GeneratorRoom": "GeneratorRoom"
                }
            }
        }
    };

// Make gameSettings globally accessible (or import where needed)
export {
  facilityMapString, gameSettings, adjacentcyMatrix
};