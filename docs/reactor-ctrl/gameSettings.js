let gameSettings = {
    failedDevices: {
        // Dummy data: replace with actual device IDs and coordinates
        "device1": { line: 7, column: 18 }, // Example coordinate in Spent Fuel Storage
        "device2": { line: 14, column: 65 }, // Example coordinate in Turbine Room
    },

    tasks: {
        // Dummy data: replace with actual task IDs and coordinates
        "task1": { line: 28, column: 38 }, // Example coordinate in Control Room
        "task2": { line: 37, column: 45 }, // Example coordinate in Bunker
    },
    soundEnabled: true,
    musicEnabled: true,
    showGameName: true, // Example setting based on gui.show_name
    doorHoldHungerCostPerSecond: 0.5, // Example cost, adjust as needed
    shadowLookSanityDrain: 5, // Example sanity drain when looking at Shadow
    facilityMap: `
+-------------+ +---+ +-------+ +-------------------------+ +-------+ +---+  +-------------+
|             | |<5>| |       | |                         | |       | |<6>|  |             |
|             | |   | |       | |                         | |       | |   |  |             |
|             | |   | | <PC>  | |                         | |       | |   |  |             |
|             +-+   | |       | |                         | |       | |   |  |             |
|    <CP>     <HW4> | +-+   +-+ |                         | |       | |   +--+             |
|             +-+   | +-+   +-+ |                         +-+       | | <HW5>     <BW>     |
|             | |   | |       | |          <RR>               <TR>  | |   +--+             |
|             | |   | |       | |                         +-+       | |   |  |             |
|             | |   | |       +-+                         | |       | |   |  |             |
+-------------+ |   | | <SF>                              | |       | |   |  +-------------+
+-------------+ |   | |       +-+                         | |       | |   |                 
|             | |   | |       | |                         | |       | |   |  +-------------+
|             +-+   | |       | |                         | |       | |   |  |             |
|   <Vent>          | +-------+ +----------+xxx+----------+ +-------+ |   |  |             |
|             +-+   |                      |   |                      |   |  |             |
|             | |   +----------------------+xxx+----------------------+   +--+             |
+-------------+ |                          <HW3>                                  <CA>     |
+-------------+ |   +-----------+   +-----------------+   +-----------+   +--+             |
|             | |   | +-------+ |   | +-------------+ |   | +-------+ |   |  |             |
|             | |   | |       | |   | |             | |   | |       | |   |  |             |
|             | |   | |       | |   | |             | |   | |       | |   |  |             |
|             | |   | |       | |   | |             | |   | |       | |   |  |             |
|             | |   | |       +-+   +-+             +-+   +-+       | |   |  +-------------+
|             +-+   | |         <HW1> x             x <HW2>         | |   |                 
|             x x   | | <GR>  +-+   +-+    <CR>     +-+   +-+  <SR> | |   |  +-------------+
|    <LAB>    x x   | |       | |   | |             | |   | |       | |   |  |             |
|             x x   | |       | |   | |      @      | |   | |       | |   |  |             |
|             +-+   | |       | |   | |             | |   | |       | |   |  |             |
|             | |   | |       | |<1>| |             | |<2>| |       | |   +--+             |
|             | |   | +-------+ +---+ +----+xxx+----+ +---+ +-------+ |          <Elect>   |
|             | |<3>|                      |   |                      |   +--+             |
|             | +---+ +--------------------+   +--------------------+ |   |  |             |
|             +-------+                                             | |   |  |             |
|             x <DCR> x                     <B>                     | |   |  |             |
|             +-------+                                             | |<4>|  |             |
+-------------+       +---------------------------------------------+ +---+  +-------------+
`,

	machines: {
        // Dummy data: replace with actual machine IDs and coordinates
        "reactor": { line: 9, column: 47 } // Example coordinate in Reactor Room
    },

	blastDoors: {
		// Approximate coordinates based on the map 'x' markers
		"door26_17_HW1": { line: 26, column: 17, isOpen: true }, // Hallway 1 section
		"door27_18_HW1": { line: 27, column: 18, isOpen: true }, // Hallway 1 section
		"door28_18_HW1": { line: 28, column: 18, isOpen: true }, // Hallway 1 section
		"door29_18_HW1": { line: 29, column: 18, isOpen: true }, // Hallway 1 section
		"door30_18_HW1": { line: 30, column: 18, isOpen: true }, // Hallway 1 section
		"door26_64_HW2": { line: 26, column: 64, isOpen: true }, // Hallway 2 section
		"door27_63_HW2": { line: 27, column: 63, isOpen: true }, // Hallway 2 section
		"door36_17_DCR": { line: 36, column: 17, isOpen: true }, // Decontamination Room entrance
		"door37_17_DCR": { line: 37, column: 17, isOpen: true }, // Decontamination Room section
		"door38_17_DCR": { line: 38, column: 17, isOpen: true }, // Decontamination Room exit
    },
    locations: {
        // Rooms
        "PowerConverterRoom": {
            friendlyName: "Power Converter Room",
            description: "The hum of electrical energy fills this room, housing the main power converters.",
            mapMarker: "<PC>",
            exits: {
                "Hallway5": "Hallway5"
            }
        },
        "ReactorRoom": {
            friendlyName: "Reactor Room",
            description: "The heart of the facility. The reactor core is visible behind a reinforced viewport.",
            mapMarker: "<RR>",
            exits: {
                "Hallway4": "Hallway4",
                "SpentFuelStorage": "SpentFuelStorage"
            }
        },
        "TurbineRoom": {
            friendlyName: "Turbine Room",
            description: "Massive turbines generate power from the reactor's heat.",
            mapMarker: "<TR>",
            exits: {
                "Hallway4": "Hallway4",
                "Hallway2": "Hallway2"
            }
        },
        "SpentFuelStorage": {
            friendlyName: "Spent Fuel Storage",
            description: "Containers of spent nuclear fuel rods are stored here.",
            mapMarker: "<SF>",
            exits: {
                "ReactorRoom": "ReactorRoom"
            }
        },
        "ControlRoom": {
            friendlyName: "Control Room",
            description: "You are in the main Control Room. Various consoles and monitors display the reactor's status.",
            mapMarker: "<CR>",
            exits: {
                "Hallway1": "Hallway1",
                "Hallway2": "Hallway2",
                "Hallway3": "Hallway3"
            }
        },
        "GeneratorRoom": {
            friendlyName: "Generator Room",
            description: "Backup generators are housed here, providing emergency power.",
            mapMarker: "<GR>",
            exits: {
                "Hallway1": "Hallway1"
            }
        },
        "ServerRoom": {
            friendlyName: "Server Room",
            description: "Rows of servers manage the facility's data and systems.",
            mapMarker: "<SR>",
            exits: {
                "Hallway2": "Hallway2"
            }
        },
        "Laboratory": {
            friendlyName: "Laboratory",
            description: "A small lab for testing and analysis.",
            mapMarker: "<LAB>",
            exits: {
                "Hallway1": "Hallway1"
            }
        },
        "Bunker": {
            friendlyName: "Bunker",
            description: "A reinforced bunker for emergencies.",
            mapMarker: "<B>",
            exits: {
                "Hallway3": "Hallway3", // Assuming connection via Hallway 3
                "DecontaminationRoom": "DecontaminationRoom" // Assuming direct connection
            }
        },
        "DecontaminationRoom": {
            friendlyName: "Decontamination Room",
            description: "This room is used for decontaminating personnel and equipment.",
            mapMarker: "<DCR>",
            exits: {
                "Hallway3": "Hallway3", // Assuming connection via Hallway 3
                "Bunker": "Bunker" // Assuming direct connection
            }
        },
        "CoolantPumpStation": {
            friendlyName: "Coolant Pump Station",
            description: "Houses the critical coolant pumps.",
            mapMarker: "<CP>",
            exits: {
                "Hallway5": "Hallway5" // Assuming connection to the upper hallway
            }
        },
        "VentilationSystems": {
            friendlyName: "Ventilation Systems",
            description: "Complex network of vents and air handlers.",
            mapMarker: "<Vent>",
            exits: {
                "Hallway5": "Hallway5" // Assuming connection to the upper hallway
            }
        },
        "ElectricalSwitchyard": {
            friendlyName: "Electrical Switchyard",
            description: "High-voltage equipment for external power distribution.",
            mapMarker: "<Elect>",
            exits: {
                // Define exits based on the map - looks like it connects to a hallway section
                 "Hallway4": "Hallway4" // Example connection
            }
        },
        "WaterTreatmentFacility": { // Added based on <BW> marker
            friendlyName: "Water Treatment Facility",
            description: "Processes and treats water for the facility.",
            mapMarker: "<BW>",
            exits: {
                 "Hallway2": "Hallway2" // Example connection
            }
        },

        // Hallways
        "Hallway1": {
            friendlyName: "Hallway 1",
            description: "A vertical corridor connecting the west side of the facility.",
            mapMarker: "<HW1>", // Using <HW1> as the representative marker
            exits: {
                "Laboratory": "Laboratory",
                "GeneratorRoom": "GeneratorRoom",
                "ControlRoom": "ControlRoom",
                "Bunker": "Bunker",
                "Hallway3": "Hallway3" // Connection to horizontal hallway
            }
        },
        "Hallway2": {
            friendlyName: "Hallway 2",
            description: "A vertical corridor connecting the east side of the facility.",
            mapMarker: "<HW2>", // Using <HW2> as the representative marker
            exits: {
                "ServerRoom": "ServerRoom",
                "ControlRoom": "ControlRoom",
                "TurbineRoom": "TurbineRoom",
                "Hallway3": "Hallway3" // Connection to horizontal hallway
            }
        },
        "Hallway3": {
            friendlyName: "Hallway 3",
            description: "A horizontal corridor connecting Hallways 1 and 2, leading towards the Decontamination Room and Bunker.",
            mapMarker: null, // No specific marker for the whole hallway
            exits: { // Corrected exits based on map
                "Hallway1": "Hallway1",
                "Hallway2": "Hallway2",
                "Hallway4": "Hallway4",
                "Hallway5": "Hallway5",
                "DecontaminationRoom": "DecontaminationRoom",
                "Bunker": "Bunker"
            }
        },
         "Hallway4": {
            friendlyName: "Hallway 4",
            description: "A horizontal corridor connecting the Reactor Room and Turbine Room areas.",
            mapMarker: null, // No specific marker for the whole hallway
            exits: { // Corrected exits based on map
                "ReactorRoom": "ReactorRoom",
                "TurbineRoom": "TurbineRoom",
                "Hallway3": "Hallway3",
                "Hallway2": "Hallway2",
                "ElectricalSwitchyard": "ElectricalSwitchyard" // Example connection
                // Potentially other connections via the 'xxx' sections
            }
        },
         "Hallway5": {
            friendlyName: "Hallway 5",
            description: "An upper horizontal corridor in the northern part of the facility.",
            mapMarker: null, // No specific marker for the whole hallway
            exits: {
                "PowerConverterRoom": "PowerConverterRoom",
                "CoolantPumpStation": "CoolantPumpStation",
                "VentilationSystems": "VentilationSystems"
                 // Potentially connections to the areas with cameras <5> and <6>
            }
        }
    },

    blastDoors: {
        // You will need to manually add entries for each blast door ('x')
        // with their correct line and column coordinates from the map.
        // Example:
        "door_44_17": { line: 44, column: 17, isOpen: true }, // Example coordinates
        "door_44_21": { line: 44, column: 21, isOpen: true }, // Example coordinates
         // Add all other blast doors here
    },

    cameras: {
        "camera1": {
            mapMarker: "<1>",
            description: "A view of the junction in Hallway 1.",
            isDistorted: false
        },
        "camera2": {
            mapMarker: "<2>",
            description: "Monitoring a section of Hallway 2.",
            isDistorted: false
        },
        "camera3": {
            mapMarker: "<3>",
            description: "Overlooking the entrance to the Laboratory.",
            isDistorted: false
        },
        "camera4": {
            mapMarker: "<4>",
            description: "Providing a view of the area near the Bunker entrance.",
            isDistorted: false
        },
        "camera5": {
            mapMarker: "<5>",
            description: "A camera view near the Power Converter Room.",
            isDistorted: false
        },
        "camera6": {
            mapMarker: "<6>",
            description: "Monitoring the area near the Turbine Room.",
            isDistorted: false
        }
    }
};

// Helper to get user-friendly location name
function getUserFriendlyLocationName(locationId) {
return gameSettings.locations[locationId]?.friendlyName || locationId;
};