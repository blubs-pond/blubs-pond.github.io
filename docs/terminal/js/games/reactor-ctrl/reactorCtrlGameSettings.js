/**
 * @module GameSettings
 * This module defines the settings, constants, and data structures for the Reactor Control game.
 */

import { parseMapString } from "./reactorCtrlGameLogic.js";

/**
 * Facility map as a template string.
 * @type {string}
 */
const facilityMapString = `
┌─────────────┐ ┌───┐ ┌───────┐ ┌─────────────────────────┐ ┌───────┐ ┌───┐ ┌──────────────┐
│             │ │<5>│ │       │ │                         │ │       │ │<6>│ │              │
│             │ │   │ │       │ │                         │ │       │ │   │ │              │
│             │ │   │ │ <PC>  │ │                         │ │       │ │   │ │              │
│             └┬┘   │ │       │ │                         │ │       │ │   │ │              │
│    <CP>      x    │ └──┐ ┌──┘ │                         │ │       │ │   └┬┘              │
│             ┌┴┐   │    ├x┤    │                         └┬┘       │ │    x      <BW>     │
│             │ │   │ ┌──┘ └──┐ │          <RR>            x  <TR>  │ │   ┌┴┐              │
│             │ │   │ │       │ │                         ┌┴┐       │ │   │ │              │
│             │ │   │ │       └┬┘                         │ │       │ │   │ │              │
└─────────────┘ │   │ │  <SF>  x                          │ │       │ │   │ │              │
┌─────────────┐ │   │ │       ┌┴┐                         │ │       │ │   │ └──────────────┘
│             │ │   │ │       │ │                         │ │       │ │   │ ┌──────────────┐
│             └┬┘   │ │       │ │                         │ │       │ │   │ │              │
│   <Vent>     x    │ │       │ └───────────┐ ┌───────────┘ │       │ │   │ │              │
│             ┌┴┐   │ └───────┘             ├x┤             └───────┘ │   │ │              │
│             │ │   └───────────────────────┘ └───────────────────────┘   └┬┘              │
└─────────────┘ │<D>                        <C>                        <E> x      <CA>     │
┌─────────────┐ │   ┌───────────┐   ┌─────────────────┐   ┌───────────┐   ┌┴┐              │
│             │ │   │ ┌───────┐ │   │ ┌─────────────┐ │   │ ┌───────┐ │   │ │              │
│             │ │   │ │       │ │   │ │             │ │   │ │       │ │   │ │              │
│             │ │   │ │       │ │   │ │             │ │   │ │       │ │   │ │              │
│             │ │   │ │       │ │   │ │             │ │   │ │       │ │   │ │              │
│             │ │   │ │       └┬┘   └┬┘             └┬┘   └┬┘       │ │   │ └──────────────┘
│             │ │   │ │        x <A> x               x <B> x        │ │   │ ┌──────────────┐
│             └┬┘   │ │ <GR>  ┌┴┐   ┌┴┐    <CR>     ┌┴┐   ┌┴┐  <SR> │ │   │ │              │
│    <LAB>     x    │ │       │ │   │ │             │ │   │ │       │ │   │ │              │
│             ┌┴┐   │ │       │ │   │ │             │ │   │ │       │ │   │ │              │
│             │ │   │ │       │ │   │ │             │ │   │ │       │ │   │ │              │
│             │ │   │ │       │ │   │ │             │ │   │ │       │ │   └┬┘              │
│             │ │   │ │       │ │<1>│ └─────┐ ┌─────┘ │<2>│ │       │ │    x     <Elect>   │
│             │ │<3>│ └───────┘ └───┘       ├x┤       └───┘ └───────┘ │   ┌┴┐              │
│             │ └───┘ ┌─────────────────────┘ └─────────────────────┐ │   │ │              │
│             ├───────┤                                             │ │   │ │              │
│             x <DCR> x                     <B>                     │ │   │ │              │
│             ├───────┤                                             │ │<4>│ │              │
└─────────────┘       └─────────────────────────────────────────────┘ └───┘ └──────────────┘`
// === Helper Functions ===

/**
 * Creates a camera object.
 * @param {string} mapMarker - The map marker for the camera.
 * @param {string} description - The description of the camera.
 * @param {string} location - The location of the camera.
 * @param {number} [batteryLife=100] - The battery life of the camera.
 * @param {string} [status="active"] - The status of the camera.
 * @returns {Object} - The camera object.
 */
const createCamera = (mapMarker, description, location, batteryLife = 100, status = "active") => ({
    mapMarker, description, location, batteryLife, status, isDistorted: false
});

/**
 * Creates a door object.
 * @param {string} location - The location of the door.
 * @param {string} exit - The exit the door leads to.
 * @param {boolean} [isOpen=true] - Whether the door is open.
 * @param {number} [durability=100] - The durability of the door.
 * @param {boolean} [isLocked=false] - Whether the door is locked.
 * @returns {Object} - The door object.
 */
const createDoor = (location, exit, isOpen = true, durability = 100, isLocked = false) => ({
    location, exit, isOpen, durability, isLocked
});

/**
 * Creates a location object.
 * @param {string} friendlyName - The friendly name of the location.
 * @param {string} description - The description of the location.
 * @param {string} mapMarker - The map marker for the location.
 * @param {Object} exits - The exits from the location.
 * @param {number} line - The line number of the location on the map.
 * @param {number} column - The column number of the location on the map.
 * @param {number} [securityLevel=1] - The security level of the location.
 * @param {boolean} [hasCreature=false] - Whether the location has a creature.
 * @param {number} [hazardLevel=1] - The hazard level of the location.
 * @returns {Object} - The location object.
 */
const createLocation = (friendlyName, description, mapMarker, exits, line, column, securityLevel = 1, hasCreature = false, hazardLevel = 1
) => ({
    friendlyName, description, mapMarker, exits, line, column,
    securityLevel, hasCreature, hazardLevel
});

/**
 * Creates a player object.
 * @param {number} [hp=500] - The player's health points.
 * @param {number} [ap=5] - The player's action points.
 * @param {string} [currentLocation="CR"] - The player's current location.
 * @param {Array<string>} [inventory=[]] - The player's inventory.
 * @param {string} [held_r=null] - The item held in the player's right hand.
 * @param {string} [held_l=null] - The item held in the player's left hand.
 * @param {Object} [stats={ hunger: 0, insomnia: 0, sanity: 100 }] - The player's stats.
 * @returns {Object} - The player object.
 */
const createPlayer = (hp = 500, ap = 5, currentLocation = "CR", inventory = [], held_r = null, held_l = null, stats = { hunger: 0, insomnia: 0, sanity: 100 }) => ({
    hp, ap, currentLocation, inventory, held_r, held_l, stats
});

/**
 * Creates an item object.
 * @param {number} [max_durability=1000] - The maximum durability of the item.
 * @param {number} [durability=1000] - The current durability of the item.
 * @param {boolean} [is2handed=false] - Whether the item requires two hands to use.
 * @param {string} [description=""] - The description of the item.
 * @param {number} [dph=1] - The damage per hit of the item.
 * @param {Array<string>} [modifier=[]] - The modifiers of the item.
 * @returns {Object} - The item object.
 */
const createItem = (max_durability = 1000, durability = 1000, is2handed = false, description = "", dph = 1, modifier = []) => ({
    max_durability, durability, is2handed, description, dph, modifier
});

/**
 * Creates a monster object.
 */
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
}

// === Facility Map ===
/**
 * Parsed facility map.
 * @type {Object}
 */
const facilityMap = parseMapString(facilityMapString)

// === Reverse Mapping Utilities ===

/**
 * Mapping from map marker to location key.
 * @type {Object}
 */
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

/**
 * Reverse mapping from location key to map marker.
 * @type {Object}
 */
const locationKeyToMarker = Object.fromEntries(
    Object.entries(markerToLocationKey).map(([k, v]) => [v, k])
);

// === Adjacency Matrix ===

/**
 * Adjacency matrix defining connections between locations.
 * @type {Object}
 */
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

/**
 * Generates exits for a given location key.
 * @param {string} locKey - The location key.
 * @returns {Object} - The exits for the location.
 */
const getExitsForLocation = locKey =>
    Object.fromEntries(
        (adjacencyMatrix[locKey] ?? [])
            .map(marker => [markerToLocationKey[marker], markerToLocationKey[marker]])
    );

// === Locations ===

/**
 * Location descriptors.
 * @type {Array<Array<string|number|boolean>>}
 */
const locationDescriptors = [
    ["ControlRoom", "Control Room", "CR", 27, 45, 3, false, 2],
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

/**
 * Locations object.
 * @type {Object}
 */
const locations = Object.fromEntries(
    locationDescriptors.map(([key, name, marker, line, column, secLvl, creature, hazard]) => [
        marker,
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

/**
 * Oil consumption rate.
 * @type {number}
 */
const oil_consumption_rate = 0.1;

/**
 * Oil leak multiplier.
 * @type {number}
 */
const oil_leak_multiplier = 1.0;

/**
 * Sanity drain when looking at the Shadow.
 * @type {number}
 */
const shadowLookSanityDrain = 5;

/**
 * Whether sound is enabled.
 * @type {boolean}
 */
const soundEnabled = true;

/**
 * Whether music is enabled.
 * @type {boolean}
 */
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