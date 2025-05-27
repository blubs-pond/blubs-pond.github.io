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
│             ┌─┐   │ │       │ │   │ │             │ │   │ │       │ │   │  │             │
│             │ │   │ │       │ │   │ │             │ │   │ │       │ │   │  │             │
│             │ │   │ │       │ │<1>│ │             │ │<2>│ │       │ │   └──┘             │
│             │ │   │ └───────┘ └───┘ └─────┐ ┌─────┘ └───┘ └───────┘ │          <Elect>   │
│             │ │<3>│                       ├x┤                       │   ┌──┐             │
│             │ └───┘ ┌─────────────────────┘ └─────────────────────┐ │   │  │             │
│             ├───────┤                                             │ │   │  │             │
│             x <DCR> x                    <BR>                     │ │   │  │             │
│             ├───────┤                                             │ │<4>│  │             │
└─────────────┘       └─────────────────────────────────────────────┘ └───┘  └─────────────┘`;

// gameSettings.js (Optimized - ES2023+)

// === Helper Functions ===
const createCamera = (mapMarker, description, location, batteryLife = 100, status = "active") => ({
  mapMarker, description, location, batteryLife, status, isDistorted: false
});

const createDoor = (location, exit, isOpen = true, durability = 100, isLocked = false) => ({
  location, exit, isOpen, durability, isLocked
});

const createLocation = (friendlyName, description, mapMarker, exits, line, column, securityLevel = 1, hasCreature = false, hazardLevel = 1
) => ({ // Added line and column to returned object
  friendlyName, description, mapMarker, exits, line, column,
  securityLevel, hasCreature, hazardLevel
});

// === Reverse Mapping Utilities ===
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

const locationKeyToMarker = Object.fromEntries(
  Object.entries(markerToLocationKey).map(([k, v]) => [v, k])
);

// === Adjacency Matrix ===
const adjacencyMatrix = {
  CR: ["SR", "GR", "CA"],
  SR: ["CR", "Elect"],
  GR: ["CR", "TR"],
  TR: ["GR", "RR"],
  RR: ["TR", "SF"],
  SF: ["RR", "PC"],
  PC: ["SF", "CP"],
  CP: ["PC", "BW"],
  BW: ["CP"],
  CA: ["CR", "LAB"],
  LAB: ["CA", "Vent"],
  Vent: ["LAB", "DCR"],
  DCR: ["Vent", "BU"],
  BU: ["DCR"],
  A: ["CR", "B"],
  B: ["A", "C"],
  C: ["B", "D"],
  D: ["C", "E"],
  E: ["D", "BU"]
};

// === Generate Exits for a Location ===
const getExitsForLocation = locKey =>
  Object.fromEntries(
    (adjacencyMatrix[locationKeyToMarker[locKey]] ?? [])
      .filter(marker => markerToLocationKey[marker])
      .map(marker => [markerToLocationKey[marker], markerToLocationKey[marker]])
  );

// === Locations ===
const locationDescriptors = [
  ["ControlRoom", "Control Room", "CR", 27, 45, 3, false, 2], // Added line and column
  ["ReactorRoom", "Reactor Room", "RR", 5, true, 5, 7, 45],
  ["TurbineRoom", "Turbine Room", "TR", 4, false, 3, 7, 65],
  ["GeneratorRoom", "Generator Room", "GR", 3, false, 2, 26, 15],
  ["ServerRoom", "Server Room", "SR", 2, false, 2, 26, 75],
  ["CoolantPumpStation", "Coolant Pump Station", "CP", 2, false, 3, 5, 4],
  ["PowerConverterRoom", "Power Converter Room", "PC", 2, false, 2, 3, 40],
  ["SpentFuelStorage", "Spent Fuel Storage", "SF", 4, false, 4, 10, 40],
  ["WaterTreatmentFacility", "Water Treatment Facility", "BW", 3, false, 2, 6, 90],
  ["ControlArchives", "Control Archives", "CA", 3, false, 1, 17, 95],
  ["ElectricalSwitchyard", "Electrical Switchyard", "Elect", 2, false, 1, 30, 90],
  ["Laboratory", "Laboratory", "LAB", 4, false, 3, 26, 4],
  ["VentilationSystems", "Ventilation Systems", "Vent", 4, false, 2, 15, 4],
  ["DecontaminationRoom", "Decontamination Room", "DCR", 3, false, 2, 34, 15],
  ["Bunker", "Bunker", "BU", 5, false, 4, 35, 45],
  ["HallwayA", "Hallway A", "A", 1, false, 1, 26, 35],
  ["HallwayB", "Hallway B", "B", 1, false, 1, 26, 55],
  ["HallwayC", "Hallway C", "C", 1, false, 1, 17, 45],
  ["HallwayD", "Hallway D", "D", 1, false, 1, 17, 15],
  ["HallwayE", "Hallway E", "E", 1, false, 1, 17, 75]
];

const locations = Object.fromEntries(
  locationDescriptors.map(([key, name, marker, line, column, secLvl, creature, hazard]) => [ // Destructure line and column
    key,
    createLocation(
      name,
      `Description for ${name}.`,
      `<${marker}>`,
      getExitsForLocation(key),
      line,
      column,
      secLvl,
      creature,
      hazard
    )
  ])
);

// === Game Settings ===
const oil_consumption_rate = 0.1;
const oil_leak_multiplier = 1.0;
const shadowLookSanityDrain = 5;
const soundEnabled = true;
const musicEnabled = true;

// === Exported Game Settings ===
export {
  locations,
  facilityMapString,
  createCamera,
  createDoor,
  createLocation,
  markerToLocationKey,
  locationKeyToMarker,
  adjacencyMatrix,
  getExitsForLocation,
  locationDescriptors,
  oil_consumption_rate,
  oil_leak_multiplier,
  shadowLookSanityDrain,
  soundEnabled,
  musicEnabled
};
