// gameSettings.js

let gameSettings = {
    facilityMap: `
┌─────────────┐ ┌───┐ ┌───────┐ ┌─────────────────────────┐ ┌───────┐ ┌───┐  ┌─────────────┐
│             │ │<5>│ │       │ │                         │ │       │ │<6>│  │             │
│             │ │   │ │       │ │                         │ │       │ │   │  │             │
│             │ │   │ │ <PC>  │ │                         │ │       │ │   │  │             │
│             └─┘   │ │       │ │                         │ │       │ │   │  │             │
│    <CP>           │ └─┐   ┌─┘ │                         └─┘       │ │   └──┘             │
│             ┌─┐   │ ┌─┘   └─┐ │                                   │ │           <BW>     │
│             │ │   │ │       │ │          <RR>               <TR>  │ │   ┌──┐             │
│             │ │   │ │       │ │                         ┌─┐       │ │   │  │             │
│             │ │   │ │       └─┘                         │ │       │ │   │  │             │
└─────────────┘ │   │ │ <SF>                              │ │       │ │   │  └─────────────┘
┌─────────────┐ │   │ │       ┌─┐                         │ │       │ │   │                 
│             │ │   │ │       │ │                         │ │       │ │   │  ┌─────────────┐
│             └─┘   │ │       │ │                         │ │       │ │   │  │             │
│   <Vent>          │ └───────┘ └──────────┬xxx┬──────────┘ └───────┘ │   │  │             │
│             ┌─┐   │                      │   │                      │   │  │             │
│             │ │   └──────────────────────┴xxx┴──────────────────────┘   └──┘             │
└─────────────┘ │                                                                 <CA>     │
┌─────────────┐ │   ┌───────────┐   ┌─────────────────┐   ┌───────────┐   ┌──┐             │
│             │ │   │ ┌───────┐ │   │ ┌─────────────┐ │   │ ┌───────┐ │   │  │             │
│             │ │   │ │       │ │   │ │             │ │   │ │       │ │   │  │             │
│             │ │   │ │       │ │   │ │             │ │   │ │       │ │   │  │             │
│             │ │   │ │       │ │   │ │             │ │   │ │       │ │   │  │             │
│             │ │   │ │       └─┘   └─┤             ├─┘   └─┘       │ │   │  └─────────────┘
│             ├─┤   │ │         <HW1> x             x <HW2>         │ │   │                 
│             x x   │ │ <GR>  ┌─┐   ┌─┤    <CR>     ├─┐   ┌─┐  <SR> │ │   │  ┌─────────────┐
│    <LAB>    x x   │ │       │ │   │ │             │ │   │ │       │ │   │  │             │
│             x x   │ │       │ │   │ │      @      │ │   │ │       │ │   │  │             │
│             ├─┤   │ │       │ │   │ │             │ │   │ │       │ │   │  │             │
│             │ │   │ │       │ │<1>│ │             │ │<2>│ │       │ │   └──┘             │
│             │ │   │ └───────┘ └───┘ └────┬xxx┬────┘ └───┘ └───────┘ │          <Elect>   │
│             │ │<3>│                      │   │                      │   ┌──┐             │
│             │ └───┘ ┌────────────────────┘   └────────────────────┐ │   │  │             │
│             ├───────┤                                             │ │   │  │             │
│             x <DCR> x                     <B>                     │ │   │  │             │
│             ├───────┤                                             │ │<4>│  │             │
└─────────────┘       └─────────────────────────────────────────────┘ └───┘  └─────────────┘
`,
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
                "DecontaminationRoom": "DecontaminationRoom"
            }
        },
        "DecontaminationRoom": {
            friendlyName: "Decontamination Room",
            description: "This room is used for decontaminating personnel and equipment.",
            mapMarker: "<DCR>",
            exits: { // Assuming connection via Hallway 3 and direct to Bunker
                "Hallway3": "Hallway3",
                "Bunker": "Bunker"
            }
        },
        "CoolantPumpStation": {
            friendlyName: "Coolant Pump Station",
            description: "Houses the critical coolant pumps.",
            mapMarker: "<CP>",
            exits: { // Assuming connection to the upper hallway
                "Hallway5": "Hallway5"
            }
        },
        "VentilationSystems": {
            friendlyName: "Ventilation Systems",
            description: "Complex network of vents and air handlers.",
            mapMarker: "<Vent>",
            exits: { // Assuming connection to the upper hallway
                "Hallway5": "Hallway5"
            }
        },
        "ElectricalSwitchyard": {
            friendlyName: "Electrical Switchyard",
            description: "High-voltage equipment for external power distribution.",
            mapMarker: "<Elect>",
            exits: { // Define exits based on the map - looks like it connects to a hallway section
                 // Define exits based on the map
            }
        },
        "WaterTreatmentFacility": {
            friendlyName: "Water Treatment Facility",
            description: "Processes and treats water for the facility.",
            mapMarker: "<BW>",
            exits: { // Define exits based on the map
                 // Define exits based on the map
            }
        },

        // Hallways
        "Hallway1": {
            friendlyName: "Hallway 1",
            description: "A vertical corridor connecting the west side of the facility.",
            mapMarker: "<HW1>",
            exits: { // Connection to horizontal hallway
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
            exits: { // Connection to horizontal hallway
                "ServerRoom": "ServerRoom",
                "ControlRoom": "ControlRoom",
                "TurbineRoom": "TurbineRoom",
                "Hallway3": "Hallway3"
            }
        },
        "Hallway3": {
            friendlyName: "Hallway 3",
            description: "A horizontal corridor connecting Hallways 1 and 2, leading towards the Decontamination Room and Bunker.",
            mapMarker: null,
            exits: { // Connections to other parts of the hallway network and rooms
                "Hallway1": "Hallway1",
                "Hallway2": "Hallway2",
                "DecontaminationRoom": "DecontaminationRoom",
                "Bunker": "Bunker"
            }
        },
         "Hallway4": {
            friendlyName: "Hallway 4",
            description: "A horizontal corridor connecting the Reactor Room and Turbine Room areas.",
            mapMarker: null,
            exits: { // Connections based on the map
                "ReactorRoom": "ReactorRoom",
                "TurbineRoom": "TurbineRoom"
            }
        },
         "Hallway5": {
            friendlyName: "Hallway 5",
            description: "An upper horizontal corridor in the northern part of the facility.",
            mapMarker: null,
            exits: {
                "PowerConverterRoom": "PowerConverterRoom",
                "CoolantPumpStation": "CoolantPumpStation",
                "VentilationSystems": "VentilationSystems"
            }
        }
    },

    // Camera settings
    cameras: {
        "camera1": {
            mapMarker: "<1>",
            description: "A view of the junction in Hallway 1."
        }
    }
};