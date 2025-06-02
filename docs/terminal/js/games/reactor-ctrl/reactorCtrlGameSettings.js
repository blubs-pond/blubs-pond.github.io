import { handleInventory, parseMapString } from "./reactorCtrlGameLogic.js";

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
  mapMarker,
  description,
  location,
  batteryLife,
  status,
  isDistorted: false
});

const createDoor = (location, exit, isOpen = true, durability = 100, isLocked = false) => ({
  location,
  exit,
  isOpen,
  durability,
  isLocked
});

const createLocation = (
  friendlyName,
  description,
  mapMarker,
  exits,
  line,
  column,
  securityLevel = 1,
  hasCreature = false,
  hazardLevel = 1
) => ({
  // Added line and column to returned object
  friendlyName,
  description,
  mapMarker,
  exits,
  line,
  column,
  securityLevel,
  hasCreature,
  hazardLevel
});

const createPlayer = (
  hp = 500,
  ap = 5,
  currentLocation = "CR",
  inventory = [],
  held_r = null,
  held_l = null,
  stats = { hunger: 0, insomnia: 0, sanity: 100 }
) => ({
  hp,
  ap,
  currentLocation,
  inventory,
  held_r,
  held_l,
  stats
});

const createItem = (
  max_durability = 1000,
  durability = 1000,
  is2handed = false,
  description = "",
  dph = 1,
  modifier = []
) => ({
  max_durability,
  durability,
  is2handed,
  description,
  dph,
  modifier
});

const createMonster = {
  class: "Template",
  location: null,
  state: "dormant",
  isNearPlayer: false,
  isHostile: true,
  canNoClip: false,
  hp: 100,
  target: null,
  goal: [],
  path: []
};

// === Facility Map ===
const facilityMap = parseMapString(facilityMapString);

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

const locationKeyToMarker = Object.fromEntries(Object.entries(markerToLocationKey).map(([k, v]) => [v, k]));

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
const getExitsForLocation = (locKey) =>
  Object.fromEntries(
    (adjacencyMatrix[locationKeyToMarker[locKey]] ?? [])
      .filter((marker) => markerToLocationKey[marker])
      .map((marker) => [markerToLocationKey[marker], markerToLocationKey[marker]])
  );

// === Locations ===
const locationDescriptors = [
  ["ControlRoom", "Control Room", "CR", 27, 45, 3, false, 2], // Added line and column
  ["ReactorRoom", "Reactor Room", "RR", 7, 45, 5, true, 5],
  ["TurbineRoom", "Turbine Room", "TR", 7, 65, 4, false, 3],
  ["GeneratorRoom", "Generator Room", "GR", 26, 15, 3, false, 2],
  ["ServerRoom", "Server Room", "SR", 26, 75, 2, false, 2],
  ["CoolantPumpStation", "Coolant Pump Station", "CP", 5, 4, 2, false, 3],
  ["PowerConverterRoom", "Power Converter Room", "PC", 3, 40, 2, false, 2],
  ["SpentFuelStorage", "Spent Fuel Storage", "SF", 10, 40, 4, false, 4],
  ["WaterTreatmentFacility", "Water Treatment Facility", "BW", 6, 90, 3, false, 2],
  ["ControlArchives", "Control Archives", "CA", 17, 95, 3, false, 1],
  ["ElectricalSwitchyard", "Electrical Switchyard", "Elect", 30, 90, 2, false, 1],
  ["Laboratory", "Laboratory", "LAB", 26, 4, 4, false, 3],
  ["VentilationSystems", "Ventilation Systems", "Vent", 15, 4, 4, false, 2],
  ["DecontaminationRoom", "Decontamination Room", "DCR", 34, 15, 3, false, 2],
  ["Bunker", "Bunker", "BU", 35, 45, 5, false, 4],
  ["HallwayA", "Hallway A", "A", 26, 35, 1, false, 1],
  ["HallwayB", "Hallway B", "B", 26, 55, 1, false, 1],
  ["HallwayC", "Hallway C", "C", 17, 45, 1, false, 1],
  ["HallwayD", "Hallway D", "D", 17, 15, 1, false, 1],
  ["HallwayE", "Hallway E", "E", 17, 75, 1, false, 1]
];

const locations = Object.fromEntries(
  locationDescriptors.map(([key, name, marker, line, column, secLvl, creature, hazard]) => [
    // Destructure line and column
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