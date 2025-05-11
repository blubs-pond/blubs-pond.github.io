let gameSettings = {
    failedDevices: {
        "device1": { line: 7, column: 18 },
        "device2": { line: 14, column: 65 }
    },

    tasks: {
        "task1": { line: 28, column: 38 },
        "task2": { line: 37, column: 45 }
    },

    soundEnabled: true,
    musicEnabled: true,
    showGameName: true,
    doorHoldHungerCostPerSecond: 0.5,
    shadowLookSanityDrain: 5,
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
        "reactor": { line: 9, column: 47 }
    },

    blastDoors: {
        // Control Room doors
        "door_CR_left":  { line: 26, column: 17, isOpen: true },
        "door_CR_center": { line: 27, column: 20, isOpen: true },
        "door_CR_right": { line: 26, column: 64, isOpen: true },

        // Decontamination Room doors
        "door_DCR_entry": { line: 36, column: 17, isOpen: true },
        "door_DCR_exit":  { line: 38, column: 17, isOpen: true },

        // Laboratory door
        "door_LAB": { line: 33, column: 17, isOpen: true },

        // Hallway 3 door (between Hallway 1 and Hallway 2)
        "door_HW3": { line: 40, column: 18, isOpen: true },

        // Reactor Room door (to Hallway 4)
        "door_RR_to_HW4": { line: 9, column: 48, isOpen: true },

        // Hallway 5 door
        "door_HW5": { line: 42, column: 18, isOpen: true }
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
    },

    locations: {
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
                "Hallway3": "Hallway3",
                "DecontaminationRoom": "DecontaminationRoom"
            }
        },
        "DecontaminationRoom": {
            friendlyName: "Decontamination Room",
            description: "This room is used for decontaminating personnel and equipment.",
            mapMarker: "<DCR>",
            exits: {
                "Hallway3": "Hallway3",
                "Bunker": "Bunker"
            }
        },
        "CoolantPumpStation": {
            friendlyName: "Coolant Pump Station",
            description: "Houses the critical coolant pumps.",
            mapMarker: "<CP>",
            exits: {
                "Hallway5": "Hallway5"
            }
        },
        "VentilationSystems": {
            friendlyName: "Ventilation Systems",
            description: "Complex network of vents and air handlers.",
            mapMarker: "<Vent>",
            exits: {
                "Hallway5": "Hallway5"
            }
        },
        "ElectricalSwitchyard": {
            friendlyName: "Electrical Switchyard",
            description: "High-voltage equipment for external power distribution.",
            mapMarker: "<Elect>",
            exits: {
                "Hallway4": "Hallway4"
            }
        },
        "WaterTreatmentFacility": {
            friendlyName: "Water Treatment Facility",
            description: "Processes and treats water for the facility.",
            mapMarker: "<BW>",
            exits: {
                "Hallway2": "Hallway2"
            }
        },

        "Hallway1": {
            friendlyName: "Hallway 1",
            description: "A vertical corridor connecting the west side of the facility.",
            mapMarker: "<HW1>",
            exits: {
                "Laboratory": "Laboratory",
                "GeneratorRoom": "GeneratorRoom",
                "ControlRoom": "ControlRoom",
                "Bunker": "Bunker",
                "Hallway3": "Hallway3"
            }
        },

        "Hallway2": {
            friendlyName: "Hallway 2",
            description: "A vertical corridor connecting the east side of the facility.",
            mapMarker: "<HW2>",
            exits: {
                "ServerRoom": "ServerRoom",
                "ControlRoom": "ControlRoom",
                "TurbineRoom": "TurbineRoom",
                "Hallway3": "Hallway3"
            }
        },

        "Hallway3": {
            friendlyName: "Hallway 3",
            description: "A horizontal corridor connecting Hallways 1 and 2, leading towards the Decontamination Room and Bunker.",
            mapMarker: "<HW3>",
            exits: {
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
            mapMarker: "<HW4>",
            exits: {
                "ReactorRoom": "ReactorRoom",
                "TurbineRoom": "TurbineRoom",
                "Hallway3": "Hallway3",
                "ControlRoom": "ControlRoom"
            }
        },

        "Hallway5": {
            friendlyName: "Hallway 5",
            description: "A passageway near the Backup Systems and Pump Station.",
            mapMarker: "<HW5>",
            exits: {
                "CoolantPumpStation": "CoolantPumpStation",
                "VentilationSystems": "VentilationSystems",
                "PowerConverterRoom": "PowerConverterRoom",
                "GeneratorRoom": "GeneratorRoom"
            }
        }
    }
};
