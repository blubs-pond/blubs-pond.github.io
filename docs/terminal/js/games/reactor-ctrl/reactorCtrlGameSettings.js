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

const createLocation = (
  friendlyName, description, mapMarker, exits,
  securityLevel = 1, hasCreature = false, hazardLevel = 1
) => ({
  friendlyName, description, mapMarker, exits,
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
  ["ControlRoom", "Control Room", "CR", 3, false, 2],
  ["ReactorRoom", "Reactor Room", "RR", 5, true, 5],
  ["TurbineRoom", "Turbine Room", "TR", 4, false, 3],
  ["GeneratorRoom", "Generator Room", "GR", 3, false, 2],
  ["ServerRoom", "Server Room", "SR", 2, false, 2],
  ["CoolantPumpStation", "Coolant Pump Station", "CP", 2, false, 3],
  ["PowerConverterRoom", "Power Converter Room", "PC", 2, false, 2],
  ["SpentFuelStorage", "Spent Fuel Storage", "SF", 4, false, 4],
  ["WaterTreatmentFacility", "Water Treatment Facility", "BW", 3, false, 2],
  ["ControlArchives", "Control Archives", "CA", 3, false, 1],
  ["ElectricalSwitchyard", "Electrical Switchyard", "Elect", 2, false, 1],
  ["Laboratory", "Laboratory", "LAB", 4, false, 3],
  ["VentilationSystems", "Ventilation Systems", "Vent", 4, false, 2],
  ["DecontaminationRoom", "Decontamination Room", "DCR", 3, false, 2],
  ["Bunker", "Bunker", "BU", 5, false, 4],
  ["HallwayA", "Hallway A", "A", 1, false, 1],
  ["HallwayB", "Hallway B", "B", 1, false, 1],
  ["HallwayC", "Hallway C", "C", 1, false, 1],
  ["HallwayD", "Hallway D", "D", 1, false, 1],
  ["HallwayE", "Hallway E", "E", 1, false, 1]
];

const locations = Object.fromEntries(
  locationDescriptors.map(([key, name, marker, secLvl, creature, hazard]) => [
    key,
    createLocation(
      name,
      `Description for ${name}.`,
      `<${marker}>`,
      getExitsForLocation(key),
      secLvl,
      creature,
      hazard
    )
  ])
);

// === Exported Game Settings ===
export {
  createCamera,
  createDoor,
  createLocation,
  markerToLocationKey,
  locationKeyToMarker,
  adjacencyMatrix,
  locations
};
