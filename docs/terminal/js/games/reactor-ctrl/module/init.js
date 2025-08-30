import * as ui from '../../../ui.js';
import * as preset from './class.js';
import * as logic from './logic.js';
import * as optcode from './opt.js';
import * as persisted from './persisted.js';

// === preset ===

export const map =`
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
└─────────────┘       └─────────────────────────────────────────────┘ └───┘ └──────────────┘`;

export const loc = {
    CP:     new preset.room("CoolantPumpStation",       "CP",   ["D"],              [0,0], [14,10]),
    PC:     new preset.room("PowerConverterRoom",       "PC",   ["SF"],             [22,9], [30,17]),
    SF:     new preset.room("SpentFuelStorage",         "SF",   ["RR", "PC"],       [0,0],  [0,0]),
    RR:     new preset.room("ReactorRoom",              "RR",   ["TR", "SF","C"],   [0,0],  [0,0]),
    TR:     new preset.room("TurbineRoom",              "TR",   ["RR"],             [0,0],  [0,0]),
    BW:     new preset.room("WaterTreatmentFacility",   "BW",   ["E"],              [0,0],  [0,0]),
    CA:     new preset.room("ControlArchives",          "CA",   ["E"],              [0,0],  [0,0]),
    ELE:    new preset.room("ElectricalSwitchyard",     "ELE",  ["E"],              [0,0],  [0,0]),
    SR:     new preset.room("ServerRoom",               "SR",   ["B"],              [0,0],  [0,0]),
    CR:     new preset.room("ControlRoom",              "CR",   ["A", "B", "BU"],   [0,0],  [0,0]),
    GR:     new preset.room("GeneratorRoom",            "GR",   ["A"],              [0,0],  [0,0]),
    LAB:    new preset.room("Laboratory",               "LAB",  ["D", "DCR"],       [0,0],  [0,0]),
    Vent:   new preset.room("VentilationSystems",       "Vent", ["D"],              [0,0],  [0,0]),
    DCR:    new preset.room("DecontaminationRoom",      "DCR",  ["LAB", "BU"],      [0,0],  [0,0]),
    BU:     new preset.room("Bunker",                   "BU",   ["DCR","CR"],       [0,0],  [0,0]),
    A: new preset.hallway("HallwayA",   "A",    ["CR", "GR", "C"],              [0,0],  [0,0]),
    B: new preset.hallway("HallwayB",   "B",    ["CR", "SR", "C"],              [0,0],  [0,0]),
    C: new preset.hallway("HallwayC",   "C",    ["A", "B", "D", "E", "RR"],     [0,0],  [0,0]),
    D: new preset.hallway("HallwayD",   "D",    ["C", "LAB", "Vent", "CP"],     [0,0],  [0,0]),
    E: new preset.hallway("HallwayE",   "E",    ["C", "ELE", "CA", "BU"],       [0,0],  [0,0])
};


// === setup ===
export function init(){
    ui.appendTerminalOutput("Launching Reactor Control...");
    ui.appendTerminalOutput(
        "Reactor Started in 3... 2... 1... Reactor Bolshoy Moshchnosti Kanalny at #### Site started. Awaiting next instructions."
    ); // Example flavor text
    ui.appendTerminalOutput("Reactor Control System Initiated. Type 'help' for commands.");
}

export function updates() {

}

export function run(){
    persisted.setting.sys.globalTimer = Date.now() * 0.001;
    persisted.setting.sys.runTimer = persisted.setting.sys.globalTimer - persisted.setting.sys.startTime;
        if(this.stats.isAlive && Math.floor(persisted.setting.sys.runTimer) == persisted.setting.sys.runTimer){
            updates();
        }
}

