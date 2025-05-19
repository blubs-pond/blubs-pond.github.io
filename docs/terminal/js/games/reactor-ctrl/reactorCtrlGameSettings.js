import { parseMapString } from './reactorCtrlGameLogic.js';

// Facility map as a template string
const facilityMapString = `
┌─────────────┐ ┌───┐ ┌───────┐ ┌─────────────────────────┐ ┌───────┐ ┌───┐  ┌─────────────┐
│             │ │<5>│ │       │ │                         │ │       │ │<6>│  │             │
│             │ │   │ │       │ │                         │ │       │ │   │  │             │
│             │ │   │ │ <PC>  │ │                         │ │       │ │   │  │             │
│             └─┘   │ │       │ │                         │ │       │ │   │  │             │
│    <CP>           │ └──┐ ┌──┘ │                         │ │       │ │   └──┘             │
│             ┌─┐   │ ┌──┘ └──┐ │                         └─┘       │ │           <BW>     │
│             │ │   │ │       │ │          <RR>               <TR>  │ │   ┌──┐             │
│             │ │   │ │       │ │                         ┌─┐       │ │   │  │             │
│             │ │   │ │       └─┘                         │ │       │ │   │  │             │
└─────────────┘ │   │ │ <SF>                              │ │       │ │   │  └─────────────┘
┌─────────────┐ │   │ │       ┌─┐                         │ │       │ │   │                 
│             │ │   │ │       │ │                         │ │       │ │   │  ┌─────────────┐
│             └─┘   │ │       │ │                         │ │       │ │   │  │             │
│   <Vent>          │ └───────┘ └───────────┐ ┌───────────┘ └───────┘ │   │  │             │
│             ┌─┐   │                       ├x┤                       │   │  │             │
│             │ │   └───────────────────────┘ └───────────────────────┘   └──┘             │
└─────────────┘ │<D>                        <C>                        <E>        <CA>     │
┌─────────────┐ │   ┌───────────┐   ┌─────────────────┐   ┌───────────┐   ┌──┐             │
│             │ │   │ ┌───────┐ │   │ ┌─────────────┐ │   │ ┌───────┐ │   │  │             │
│             │ │   │ │       │ │   │ │             │ │   │ │       │ │   │  │             │
│             │ │   │ │       │ │   │ │             │ │   │ │       │ │   │  │             │
│             │ │   │ │       │ │   │ │             │ │   │ │       │ │   │  │             │
│             │ │   │ │       └─┘   └─┤             ├─┘   └─┘       │ │   │  └─────────────┘
│             │ │   │ │          <A>  x             x  <B>          │ │   │                 
│             └─┘   │ │ <GR>  ┌─┐   ┌─┤    <CR>     ├─┐   ┌─┐  <SR> │ │   │  ┌─────────────┐
│    <LAB>     x    │ │       │ │   │ │             │ │   │ │       │ │   │  │             │
│             ┌─┐   │ │       │ │   │ │      @      │ │   │ │       │ │   │  │             │
│             │ │   │ │       │ │   │ │             │ │   │ │       │ │   │  │             │
│             │ │   │ │       │ │<1>│ │             │ │<2>│ │       │ │   └──┘             │
│             │ │   │ └───────┘ └───┘ └─────┐ ┌─────┘ └───┘ └───────┘ │          <Elect>   │
│             │ │<3>│                       ├x┤                       │   ┌──┐             │
│             │ └───┘ ┌─────────────────────┘ └─────────────────────┐ │   │  │             │
│             ├───────┤                                             │ │   │  │             │
│             x <DCR> x                     <B>                     │ │   │  │             │
│             ├───────┤                                             │ │<4>│  │             │
└─────────────┘       └─────────────────────────────────────────────┘ └───┘  └─────────────┘`;

// Adjacency matrix for facility navigation
const adjacencyMatrix = {
    CP: ["D"],
    PC: ["SF"],
    SF: ["PC", "RR"],
    RR: ["SF", "TR", "C"],
    TR: ["RR", "BW"],
    BW: ["TR"],
    CA: ["E"],
    Elect: ["E"],
    SR: ["B"],
    CR: ["A", "B"],
    GR: ["A"],
    LAB: ["D", "DCR"],
    Vent: ["D"],
    DCR: ["LAB", "BU"],
    BU: ["DCR", "LAB", "CR"],
    A: ["CR", "GR", "C"],
    B: ["CR", "SR", "C"],
    C: ["D", "E", "A", "B", "RR"],
    D: ["LAB", "C", "Vent", "CP"],
    E: ["C", "Elect", "BW", "CA"]
};

// Helper to create camera objects
const createCamera = (mapMarker, description, location, batteryLife = 100, status = "active") => ({
    mapMarker, description, isDistorted: false, location, batteryLife, status
});

// Helper to create door objects
const createDoor = (location, exit, isOpen = true, durability = 100, isLocked = false) => ({
    location, exit, isOpen, durability, isLocked
});

// Helper to create location objects
const createLocation = (friendlyName, description, mapMarker, exits, securityLevel = 1, hasCreature = false, hazardLevel = 1) => ({
    friendlyName, description, mapMarker, exits, securityLevel, hasCreature, hazardLevel
});

const gameSettings = {
    soundEnabled: true,
    musicEnabled: true,
    showGameName: true,
    doorHoldHungerCostPerSecond: 0.5,
    shadowLookSanityDrain: 5,
    facilityMatrix: parseMapString(facilityMapString),

    tasks: {
        repair_reactor_pump: {
            description: "Repair the primary reactor coolant pump.",
            location: "ReactorRoom",
            requiredItem: "wrench",
            isCompleted: false
        },
        restore_power: {
            description: "Restore auxiliary power to the server room.",
            location: "ServerRoom",
            requiredAction: "flip_switch",
            isCompleted: false
        }
    },

    oil_consumption_rate: 0.1,
    oil_leak_multiplier: 1.0,

    machines: {
        reactor: {
            location: "ReactorRoom",
            description: "The main reactor core.",
            isOperational: true,
            damageLevel: 0,
            powerOutput: 1000
        },
        control_panel_ca: {
            location: "ControlArchives",
            description: "Control panel for the Control Archives.",
            isOperational: true,
            damageLevel: 0,
            powerConsumption: 50
        }
    },

    blastDoors: {
        door_CR_left: createDoor("ControlRoom", "HallwayA"),
        door_CR_center: createDoor("ControlRoom", "HallwayC", true, 100, true),
        door_CR_right: createDoor("ControlRoom", "HallwayB"),
        door_DCR_entry: createDoor("DecontaminationRoom", "Bunker"),
        door_DCR_exit: createDoor("DecontaminationRoom", "HallwayC"),
        door_LAB: createDoor("Laboratory", "HallwayD"),
        door_C_1: createDoor("HallwayA", "HallwayC"),
        door_C_2: createDoor("HallwayB", "HallwayC"),
        door_RR_to_D: createDoor("ReactorRoom", "HallwayD"),
        door_D_to_CR: createDoor("HallwayD", "ControlRoom"),
        door_E_CP: createDoor("HallwayE", "CoolantPumpStation"),
        door_E_Vent: createDoor("HallwayE", "VentilationSystems"),
        door_E_PC: createDoor("HallwayE", "PowerConverterRoom"),
        door_E_GR: createDoor("HallwayE", "GeneratorRoom")
    },

    cameras: {
        camera1: createCamera("<1>", "A view of the junction in Hallway 1.", "HallwayA"),
        camera2: createCamera("<2>", "Monitoring a section of Hallway 2.", "HallwayB", 85),
        camera3: createCamera("<3>", "Overlooking the entrance to the Laboratory.", "HallwayD", 75),
        camera4: createCamera("<4>", "Providing a view of the area near the Bunker entrance.", "HallwayC", 50),
        camera5: createCamera("<5>", "A camera view near the Power Converter Room.", "PowerConverterRoom", 60),
        camera6: createCamera("<6>", "Monitoring the area near the Turbine Room.", "TurbineRoom", 90)
    },

    locations: (() => {
        // Map from adjacencyMatrix keys to location keys in locations object
        const markerToLocationKey = {
            CP: "CoolantPumpStation",
            PC: "PowerConverterRoom",
            SF: "SpentFuelStorage",
            RR: "ReactorRoom",
            TR: "TurbineRoom",
            BW: "WaterTreatmentFacility",
            CA: "ControlArchives",
            Elect: "ElectricalSwitchyard",
            SR: "ServerRoom",
            CR: "ControlRoom",
            GR: "GeneratorRoom",
            LAB: "Laboratory",
            Vent: "VentilationSystems",
            DCR: "DecontaminationRoom",
            BU: "Bunker",
            A: "HallwayA",
            B: "HallwayB",
            C: "HallwayC",
            D: "HallwayD",
            E: "HallwayE"
        };

        // Reverse mapping for exits
        const locationKeyToMarker = {};
        for (const [marker, locKey] of Object.entries(markerToLocationKey)) {
            locationKeyToMarker[locKey] = marker;
        }

        // Helper to get exits for a location key
        function getExitsForLocation(locationKey) {
            // Find marker for this location
            const marker = locationKeyToMarker[locationKey];
            if (!marker) return {};
            // Get adjacency for this marker
            const adj = adjacencyMatrix[marker];
            if (!adj) return {};
            // Map adjacency markers to location keys
            const exits = {};
            for (const m of adj) {
                if (markerToLocationKey[m]) {
                    exits[markerToLocationKey[m]] = markerToLocationKey[m];
                }
            }
            return exits;
        }

        // All locations with exits set according to adjacencyMatrix
        return {
            ControlRoom: createLocation(
                "Control Room",
                "You are in the main Control Room. Various consoles and monitors display the reactor's status.",
                "<CR>",
                getExitsForLocation("ControlRoom"),
                3, false, 2
            ),
            ReactorRoom: createLocation(
                "Reactor Room",
                "The heart of the facility. The reactor core is visible behind a reinforced viewport.",
                "<RR>",
                getExitsForLocation("ReactorRoom"),
                5, true, 5
            ),
            TurbineRoom: createLocation(
                "Turbine Room",
                "Massive turbines generate power from the reactor's heat.",
                "<TR>",
                getExitsForLocation("TurbineRoom"),
                4, false, 3
            ),
            SpentFuelStorage: createLocation(
                "Spent Fuel Storage",
                "Containers of spent nuclear fuel rods are stored here.",
                "<SF>",
                getExitsForLocation("SpentFuelStorage"),
                5, true, 5
            ),
            GeneratorRoom: createLocation(
                "Generator Room",
                "Backup generators are housed here, providing emergency power.",
                "<GR>",
                getExitsForLocation("GeneratorRoom"),
                3, false, 2
            ),
            ServerRoom: createLocation(
                "Server Room",
                "Rows of servers manage the facility's data and systems.",
                "<SR>",
                getExitsForLocation("ServerRoom"),
                4, false, 2
            ),
            Laboratory: createLocation(
                "Laboratory",
                "A small lab for testing and analysis.",
                "<LAB>",
                getExitsForLocation("Laboratory"),
                2, false, 2
            ),
            Bunker: createLocation(
                "Bunker",
                "A reinforced bunker for emergencies.",
                "<BU>",
                getExitsForLocation("Bunker"),
                5, true, 4
            ),
            DecontaminationRoom: createLocation(
                "Decontamination Room",
                "This room is used for decontaminating personnel and equipment.",
                "<DCR>",
                getExitsForLocation("DecontaminationRoom"),
                4, false, 3
            ),
            CoolantPumpStation: createLocation(
                "Coolant Pump Station",
                "Houses the critical coolant pumps.",
                "<CP>",
                getExitsForLocation("CoolantPumpStation"),
                3, false, 3
            ),
            VentilationSystems: createLocation(
                "Ventilation Systems",
                "Complex network of vents and air handlers.",
                "<Vent>",
                getExitsForLocation("VentilationSystems"),
                3, false, 3
            ),
            ElectricalSwitchyard: createLocation(
                "Electrical Switchyard",
                "High-voltage equipment for external power distribution.",
                "<E>",
                getExitsForLocation("ElectricalSwitchyard"),
                4, false, 4
            ),
            WaterTreatmentFacility: createLocation(
                "Water Treatment Facility",
                "Processes and treats water for the facility.",
                "<BW>",
                getExitsForLocation("WaterTreatmentFacility"),
                2, false, 3
            ),
            ControlArchives: createLocation(
                "Control Archives",
                "A room storing archived control data and auxiliary panels.",
                "<CA>",
                getExitsForLocation("ControlArchives"),
                3, false, 2
            ),
            HallwayA: createLocation(
                "Hallway 1",
                "A vertical corridor connecting the west side of the facility.",
                "<A>",
                getExitsForLocation("HallwayA")
            ),
            HallwayB: createLocation(
                "Hallway 2",
                "A vertical corridor connecting the east side of the facility.",
                "<B>",
                getExitsForLocation("HallwayB")
            ),
            HallwayC: createLocation(
                "Hallway 3",
                "A horizontal corridor connecting Hallways 1 and 2, leading towards the Decontamination Room and Bunker.",
                "<C>",
                getExitsForLocation("HallwayC")
            ),
            HallwayD: createLocation(
                "Hallway 4",
                "A horizontal corridor connecting the Reactor Room and Turbine Room areas.",
                "<D>",
                getExitsForLocation("HallwayD")
            ),
            HallwayE: createLocation(
                "Hallway 5",
                "A passageway near the Backup Systems and Pump Station.",
                "<E>",
                getExitsForLocation("HallwayE")
            )
        };
    })(),

    failedDevices: {
        device1: { line: 7, column: 18 },
        device2: { line: 14, column: 65 }
    },

    baseTempIncreaseRate: 0.1,
    cpTempModulation: -0.05,
    bwTempModulation: -0.03
};

export {
    facilityMapString,
    gameSettings,
    adjacencyMatrix
};
