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

/**
 * Locations preset
 * @namespace loc
 * @memberof module:reactor-ctrl
 * @property {preset.room} CP Coolant Pump Station
 * @property {preset.room} Vent Ventilation Systems
 * @property {preset.room} LAB Laboratory
 * @property {preset.room} PC Power Converter Room
 * @property {preset.room} SF Spent Fuel Storage
 * @property {preset.room} GR Generator Room
 * @property {preset.room} RR Reactor Room
 * @property {preset.room} CR Control Room
 * @property {preset.room} DCR Decontamination Room
 * @property {preset.room} TR Turbine Room
 * @property {preset.room} SR Server Room
 * @property {preset.room} BW Water Treatment Facility
 * @property {preset.room} CA Control Archives
 * @property {preset.room} ELE Electrical Switchyard
 * @property {preset.hallway} A Hallway A
 * @property {preset.hallway} B Hallway B
 * @property {preset.hallway} C Hallway C
 * @property {preset.hallway} D Hallway D
 * @property {preset.hallway} E Hallway E
 * @property {preset.hallway} DCR Decontamination Room
 */
export const loc = {
    // Rooms
    CP:     new preset.room(
        "CoolantPumpStation",       
        "CP",   
        [0,0],      
        [14,10],    
        ["D"],                      
        ["D","Vent"],              

    ),      
    Vent:   new preset.room(
        "VentilationSystems",       
        "Vent", 
        [0,11],     
        [14,17],    
        ["D"],                      
        ["D","CP","LAB"],          

    ),          
    LAB:    new preset.room(
        "Laboratory",               
        "LAB",  
        [0,18],     
        [14,36],    
        ["D", "DCR"],               
        ["D", "DCR"],              

    ),
    PC:     new preset.room(
        "PowerConverterRoom",       
        "PC",   
        [22,0],     
        [30,5],     
        ["SF"],                     
        ["SF"],                    

    ),
    SF:     new preset.room(
        "SpentFuelStorage",         
        "SF",   
        [22,9],     
        [30,17],    
        ["RR", "PC"],               
        ["RR", "PC"],              

    ),
    GR:     new preset.room(
        "GeneratorRoom",            
        "GR",   
        [22,0],     
        [30,31],    
        ["A"],                      
        ["A"],                     

    ),
    BU:     new preset.room(
        "Bunker",                   
        "BU",   
        [22,0],     
        [68,36],    
        ["DCR","CR"],               
        ["DCR","CR"],              

    ),
    RR:     new preset.room(
        "ReactorRoom",              
        "RR",   
        [32,0],     
        [58,14],    
        ["TR", "SF","C"],           
        ["TR", "SF","C"],          

    ),
    CR:     new preset.room(
        "ControlRoom",              
        "CR",   
        [38,19],    
        [52,30],    
        ["A", "B", "BU"],           
        ["A", "B", "BU"],          

    ),
    TR:     new preset.room(
        "TurbineRoom",              
        "TR",   
        [60,0],     
        [68,15],    
        ["RR"],                     
        ["RR"],                    

    ),
    SR:     new preset.room(
        "ServerRoom",               
        "SR",   
        [60,19],    
        [68,31],    
        ["B"],                      
        ["B"],                     

    ),
    BW:     new preset.room(
        "WaterTreatmentFacility",   
        "BW",   
        [76,0],     
        [91,11],    
        ["E"],                      
        ["E"],                     

    ),
    CA:     new preset.room(
        "ControlArchives",          
        "CA",   
        [76,12],    
        [91,23],    
        ["E"],                      
        ["E"],                     

    ),
    ELE:    new preset.room(
        "ElectricalSwitchyard",     
        "ELE",  
        [76,24],    
        [91,36],    
        ["E"],                      
        ["E"],                     

    ),
    // Hallways
    A:  new preset.hallway( 
        "HallwayA",                 
        "A",    
        [32,18],    
        [36,31],    
        ["CR", "GR", "C"],          
        ["CR", "GR", "C"],         
    ),
    B:  new preset.hallway( 
        "HallwayB",         
        "B",    
        [54,18],    
        [58,31],    
        ["CR", "SR", "C"],          
        ["CR", "SR", "C"],         
    ),
    C:  new preset.hallway( 
        "HallwayC",         
        "C",    
        [20,16],    
        [70,18],    
        ["A", "B", "D", "E", "RR"], 
        ["A", "B", "D", "E", "RR"],),
    D:  new preset.hallway( 
        "HallwayD",         
        "D",    
        [16,0],     
        [20,32],    
        ["C", "LAB", "Vent", "CP"], 
        ["C", "LAB", "Vent", "CP"],),
    E:  new preset.hallway( 
        "HallwayE",         
        "E",    
        [70,0],     
        [74,36],    
        ["C", "ELE", "CA", "BW"],   
        ["C", "ELE", "CA", "BW"],  ),
    DCR:new preset.hallway( 
        "DecontaminationRoom",      
        "DCR",  [14,33],    
        [22,35],    
        ["LAB", "BU"],              
        ["LAB", "BU"],             
    ),
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

