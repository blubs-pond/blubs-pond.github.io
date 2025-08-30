/** ===== CLASS =====
 * 
 */

import * as ui from '../../ui.js';
// ===== Class decoration =====

// === obj item ===

/**
 * Base class for all things in the game
 * @class thing
 * @class item
 * @class part
 * @class fixture
 * @class cam
 * 
 */
export class thing{
    constructor(
        name = "_debug",
        durability = 1000000000
    ) {
        this.name = name;
        this.duri = durability;
    }
}

export class item extends thing {
    constructor(
        id = 0,
        name = "_debug",
        amount = 1,
        durability = 1000000000,
        dmg = {
            hp : 1000,
            hunger :  0,
            insomnia :  0,
            sanity :  100
        },
        effect = new status_effect(
            "none",
            0,
            {hp:0,hunger:0,insomnia:0,sanity:0},
            {hp:0,hunger:0,insomnia:0,sanity:0},
            {hp:0,hunger:0,insomnia:0,sanity:0},
            0,
            true
        )
    ) {
        this.id = id;
        super(name);
        this.count = amount;
        super(durability);
        this.dmg = dmg;
        this.effect = effect;
    }
    use(target) {
        target.stats.hp += this.dmg.hp;
        target.stats.hunger += this.dmg.hunger;
        target.stats.insomnia += this.dmg.insomnia;
        target.stats.sanity += this.dmg.sanity;
        if (this.effect.name != "none") {
            this.effect.apply(target);
        }
        this.durability -= 1;
    }
}

export class part extends item {
    constructor(
        id = 0,
        name = "_debug",
        amount = 1,
        durability = 1000000000,
        dmg = 0,
        maxLoad = 100,
        powerin = 0,
        powerout = 0,
        lvl = 0,
        isBLoken = false,
        isHaunted = false,
        subComponent = {
            cp : new part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)
        }
    ) {
        super(id);
        super(name);
        super(amount);
        super(durability);
        super(dmg);
        this.maxLoad = maxLoad;
        this.powerin = powerin;
        this.powerout = powerout;
        this.lvl = lvl;
        this.isBLoken = isBLoken;
        this.isHaunted = isHaunted;
        this.subComponent = subComponent;
    }
    reboot() {
        if(this.isBLoken && this.duri != 0) {
            this.isBLoken = false;
        }
    }
    upgrade() {
        this.lvl += 1;
    }
}

export class fixture extends thing {
    constructor(
        name = "_debug",
        durability = 1000000000,
        cord = [0,0],
        powerin = 0,
        powerout = 0,
        component = {
            cp : new part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)
        },
        isOn = true
    ) {
        super(name);
        super(durability);
        this.cord = cord;
        this.powerin = powerin;
        this.powerout = powerout;
        this.component = component;
        this.isOn = isOn;
    }
}

export class cam extends fixture {
    constructor(
        name = "cam",
        durability = 100,
        cord = [0,0],
        powerin = 0,
        powerout = 0,
        component = {
            cp : new part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)
        },
        isOn = true
    ) {
        super(name);
        super(durability);
        super(cord);
        super(powerin);
        super(powerout);
        super(component);
        super(isOn);
    }
}

export class door extends fixture {
    constructor(
        name = "",
        durability = 100,
        cord = [0,0],
        powerin = 0,
        powerout = 0,
        component = {
            cp : new part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)
        },
        isOn = true,
        islock = false,
        isOpen = true
    ) {
        super(name);
        super(durability);
        super(cord);
        super(powerin);
        super(powerout);
        super(component);
        super(isOn);
        this.islock = islock;
        this.isOpen = isOpen;
    }
}

// === location and structure ===
export class location{
    constructor(
        fullName,
        roomCode,
        adjacentTo,
        connectedTo,
        TR = [0,0],
        BL = [0,0],
        door = {
            loc : [0,0]
        },
        camara = {
            cam : new cam()
        }
    ) {
        this.fullName = fullName;
        this.roomCode = roomCode;
        this.TR = TR;
        this.BL = BL;
        this.adjacentTo = adjacentTo;
        this.connectedTo = connectedTo;
        this.door = door;
        this.cam = camara;
    }
}

export class room extends location {
    constructor(
        fullName,
        roomCode,
        TR,
        BL,
        adjacentTo,
        connectedTo,
        door,
        cam,
        poi = {
            poi : new fixture("poi", 1000, [0,0], 0, 0, [new part(1,"control panel", 1, 1000, 0, 10, 5 , 0, 0, false, false)], false)
        }
    ) {
        super(fullName);
        super(roomCode);
        super(TR);
        super(BL);
        super(adjacentTo);
        super(connectedTo);
        super(door);
        super(cam);
        this.poi = poi;
    }
}

export class hallway extends location {
    constructor(
        fullName,
        roomCode,
        TR,
        BL,
        adjacentTo,
        connectedTo,
        door,
        cam
    ) {
        super(fullName);
        super(roomCode);
        super(TR);
        super(BL);
        super(adjacentTo);
        super(connectedTo);
        super(door);
        super(cam);
    }
}



// ===== player ====
export class inventory {
    constructor(
        items = []
    ) {
        this.items = items;
    }
    add(item) {
        this.items.push(item);
    }
    remove(item) {
        const index = this.items.indexOf(item);
        if (index > -1) {
            this.items.splice(index, 1);
        }
    }
}  

export class status_effect {
    constructor(
        name = "none",
        duration = 0,
        effect = {
            hp : 0,
            hunger :  0,
            insomnia :  0,
            sanity :  0
        },
        effect_on_Timer_over = {
            hp : 0,
            hunger :  0,
            insomnia :  0,
            sanity :  0
        },
        effect_per_second = {
            hp : 0,
            hunger :  0,
            insomnia :  0,
            sanity :  0
        },
        effect_duration = 0,
        isPositive = true
    ) { 
        this.name = name;
        this.duration = duration;
        this.effect = effect;
        this.effect_on_Timer_over = effect_on_Timer_over;
        this.effect_per_second = effect_per_second;
        this.effect_duration = effect_duration;
        this.isPositive = isPositive;
        this.appliedTime = new Date.now() * 0.001;
        this.appliedTimer = this.appliedTime - persisted.setting.general.globalTimer;
    }
    apply(target) {
        target.stats.hp += this.effect.hp;
        target.stats.hunger += this.effect.hunger;
        target.stats.insomnia += this.effect.insomnia;
        target.stats.sanity += this.effect.sanity;

        if (this.effect_duration > 0) {
            setInterval(() => {
                target.stats.hp += this.effect_per_second.hp;
                target.stats.hunger += this.effect_per_second.hunger;
                target.stats.insomnia += this.effect_per_second.insomnia;
                target.stats.sanity += this.effect_per_second.sanity;
            }, 1000);
        }
        setTimeout(() => {
            target.stats.hp += this.effect_on_Timer_over.hp;
            target.stats.hunger += this.effect_on_Timer_over.hunger;
            target.stats.insomnia += this.effect_on_Timer_over.insomnia;
            target.stats.sanity += this.effect_on_Timer_over.sanity;
            // remove effect from target
            const index = target.effect.indexOf(this);
            if (index > -1) {
                target.effect.splice(index, 1);
            }
        }, this.duration * 1000);
        target.effect.push(this);
    }
}

export class player {
    constructor(
        loc =  persisted.loc.CR,
        inventory =  [],
        stats =  {
            isAlive : true,
            hp : 1000,
            hunger :  0,
            insomnia :  0,
            sanity :  100
        },
        isHiding = false,
        doorBeingHeld = "none",
        effect = []
    ) {
        this.loc = loc;
        this.inv = inventory;
        this.stats = stats;
        this.isHiding = isHiding;
        this.doorBeingHeld = doorBeingHeld;
    }
    move(location) {

    }
    addItem(items = new item()) {
        this.inv.add(items);
    }
}

// === monster ===
/**
 * Class representing a monster in the game.
 * 
 * There are 5 main monster types:
 * 1. Experiment - A grotesque creature that haunts the facility, attacking anything in sight, ALSO IT CAN'T BE KILLED as he is a roaming boss but also he will be doemant in the lab until the 5th critical reactor failure.
 * 2. Lost - A Ghost like entity that haunt this secret facility and told the dark secret about the experiment lie within. he will only appear after the 1st night can spawn in all room except controll rooma and reactor room
 * 3. Hide - Yet another unkilleable monster but don't woried if you don't hide too offten to avoid monster that is not Experiment he won't harm you, also he can't technickly kill you eighter. 
 * 4. Shadow - Another Ghost like entity how ever this one is more sinsiter and curse player purely for the love of the game insted to expell them before they experience teh same fate as Lost. the 1st enemy player will encounter and have to deal with can spawn in all room except controll room
 * 5. Abomination - A bit of a wild card of wild mutated animal that may or may not be hostile to player.
 * only spawn in the vent or Lab.
 */

export class monster{
    constructor(
        id = 0,
        state = 0,
            // 0 = dormant
            // 1 = roaming
            // 2 = staking
            // 3 = hunting
            // 4 = searching
            // 5 = haunting
            // 6 = hiding
            // 7 = seeking
        isNearPlayer = false,
        hostileLvl = 0,
        canNoClip = false,
        stats =  {
            isAlive : true,
            hp : 1000,
            hunger :  0,
            insomnia :  0,
            sanity :  100
        },
        dps = {
            physical : 1,
            hunger : 0,
            insomnia : 0,
            sanity : 0
        },
        target = null,
        goal = [],
        spawn = null,
        loc = new room("void","void",[],[]),
        isImmune = {
            holy_water:false,
            hide:true,
            physical:true
        }
    ) {
        this.id = id;
        this.state = state;
        this.isNearPlayer = isNearPlayer;
        this.hostileLvl = hostileLvl;
        this.canNoClip = canNoClip;
        this.stats = stats;
        this.dps = dps;
        this.target = target;
        this.goal = goal;
        this.path = [];
        this.spawn = spawn;
        this.loc = loc;
        this.isImmune = isImmune;
        this.spawntime = new Date.now() * 0.001;
        this.alivelTimer = this.spawntime - persisted.setting.general.globalTimer;
    }
    move(location) {
        if (this.state == (1 || 2 || 3 || 4 || 7)) {
            if (this.canNoClip) {
                this.loc = this.loc.adjacentTo.contains(location)? location : this.loc;
            } else {
                this.loc = this.loc.connectedTo.contains(location)? location : this.loc;
            }
        }
    }
    attack(target) {
        this.target = target;
        while(target.stats.isAlive && target.loc === this.loc) {
        }
    }
    update() {
    }
}

// ===== monster sub-classes =====
export class experiment extends monster {
    constructor(
        id = 0,
        state = 0, // 0 = dormant
        isNearPlayer = false,
        hostileLvl = 2,
        canNoClip = false,
        stats =  {
            isAlive : true,
            hp : 100000,
            hunger :  0,
            insomnia :  0,
            sanity :  100
        },
        dps = {
            physical : 100,
            hunger : 0,
            insomnia : 0,
            sanity : 0
        },
        target = null,
        goal = [],
        spawn = init.loc.LAB,
        loc = init.loc.LAB,
        isImmune = {
            holy_water:true,
            hide:true,
            physical:true
        }
    ) {
        super(id);
        super(state);
        super(isNearPlayer);
        super(hostileLvl);
        super(canNoClip);
        super(stats);
        super(dps);
        super(target);
        super(goal);
        super(spawn);
        super(loc);
        super(isImmune);
    }
    move(location) {
        if (this.state == (1 || 2 || 3 || 4 || 7)) {
            if (this.canNoClip) {
                this.loc = this.loc.adjacentTo.contains(location)? location : this.loc;
            } else {
                this.loc = this.loc.connectedTo.contains(location)? location : this.loc;
            }
        }
    }
    attack(target) {
        this.target = target;
        while(target.stats.isAlive && target.loc === this.loc) {
            target.stats.hp -= this.dps.physical;
            target.stats.hunger += this.dps.hunger;
            target.stats.insomnia += this.dps.insomnia;
            target.stats.sanity -= this.dps.sanity;
            if (target.stats.hp <= 0) {
                target.stats.isAlive = false;
                ui.appendTerminalOutput("You have been killed by the Experiment.");
            }
        }
    }
    attackDoor(door) {
        if (door.islock) {
            door.islock = false;
            ui.appendTerminalOutput("The Experiment smashes through the locked door!");
        } else {
            door.isOpen = true;
            ui.appendTerminalOutput("The Experiment smashes through the door!");
        }
    }
    update() {
        // Experiment specific behavior
        if (this.loc === init.game.player.location) {
            this.isNearPlayer = true;
            this.state = 3; // Hunting
            this.attack(init.game.player);
        } else {
            this.isNearPlayer = false;
            this.state = 1; // Roaming
            // Move randomly or towards player if within certain range
        }
    }
}

export class lost extends monster {
    constructor(
        id = 0,
        state = 0, // 0 = dormant
        isNearPlayer = false,
        hostileLvl = 1,
        canNoClip = true,
        stats =  {
            isAlive : true,
            hp : 100,
            hunger :  0,
            insomnia :  0,
            sanity :  100
        },
        dps = {
            physical : 10,
            hunger : 0,
            insomnia : 0,
            sanity : 10
        },
        target = null,
        goal = [],
        spawn = init.loc.BR,
        loc = init.loc.BR,
        isImmune = {
            holy_water:false,
            hide:true,
            physical:false
        }
    ) {
        super(id);
        super(state);
        super(isNearPlayer);
        super(hostileLvl);
        super(canNoClip);
        super(stats);
        super(dps);
        super(target);
        super(goal);
        super(spawn);
        super(loc);
        super(isImmune);
        this.appearanceTimer = -1.0;
    }
    move(location) {
        if (this.state == (1 || 2 || 3 || 4 || 7)) {
            if (this.canNoClip) {
                this.loc = this.loc.adjacentTo.contains(location)? location : this.loc;
            } else {
                this.loc = this.loc.connectedTo.contains(location)? location : this.loc;
            }
        }
    }
    attack(target) {
        this.target = target;
        while(target.stats.isAlive && target.loc === this.loc) {
            target.stats.hp -= this.dps.physical;
            target.stats.hunger += this.dps.hunger;
            target.stats.insomnia += this.dps.insomnia;
            target.stats.sanity -= this.dps.sanity;
            if (target.stats.hp <= 0) {
                target.stats.isAlive = false;
                ui.appendTerminalOutput("You have been killed by the Lost.");
            }
        }
    }
    update() {
        // Lost specific behavior
        if (this.loc === init.game.player.location) {
            this.isNearPlayer = true;
            this.state = 3; // Hunting
            this.attack(init.game.player);
        } else {
            this.isNearPlayer = false;
            this.state = 1; // Roaming
            // Move randomly or towards player if within certain range
        }
    }
}

export class hide extends monster {
    constructor(
        id = 0,
        state = 0, // 0 = dormant
        isNearPlayer = false,
        hostileLvl = 0,
        canNoClip = false,
        stats =  {
            isAlive : true,
            hp : 10000,
            hunger :  0,
            insomnia :  0,
            sanity :  100
        },
        dps = {
            physical : 0,
            hunger : 0,
            insomnia : 0,
            sanity : 0
        },
        target = null,
        goal = [],
        spawn = init.loc.BR,
        loc = init.loc.BR,
        isImmune = {
            holy_water:true,
            hide:true,
            physical:true
        }
    ) {
        super(id);
        super(state);
        super(isNearPlayer);
        super(hostileLvl);
        super(canNoClip);
        super(stats);
        super(dps);
        super(target);
        super(goal);
        super(spawn);
        super(loc);
        super(isImmune);
    }
    move(location) {
        if (this.state == (1 || 2 || 3 || 4 || 7)) {
            if (this.canNoClip) {
                this.loc = this.loc.adjacentTo.contains(location)? location : this.loc;
            } else {
                this.loc = this.loc.connectedTo.contains(location)? location : this.loc;
            }
        }
    }
    attack(target) {
        // Hide does not attack
    }
    update() {
        // Hide specific behavior
        if (this.loc === init.game.player.location) {
            this.isNearPlayer = true;
            if (init.game.player.isHiding) {
                this.state = 6; // Hiding
            } else {
                this.state = 3; // Hunting
                this.attack(init.game.player);
            }
        } else {
            this.isNearPlayer = false;
            this.state = 1; // Roaming
            // Move randomly or towards player if within certain range
        }
    }
}

export class shadow extends monster {
    constructor(
        id = 0,
        state = 0, // 0 = dormant
        isNearPlayer = false,
        hostileLvl = 1,
        canNoClip = true,
        stats =  {
            isAlive : true,
            hp : 100,
            hunger :  0,
            insomnia :  0,
            sanity :  100
        },
        dps = {
            physical : 5,
            hunger : 0,
            insomnia : 0,
            sanity : 20
        },
        target = null,
        goal = [],
        spawn = init.loc.HALL1,
        loc = init.loc.HALL1,
        isImmune = {
            holy_water:false,
            hide:true,
            physical:false
        }
    ) {
        super(id);
        super(state);
        super(isNearPlayer);
        super(hostileLvl);
        super(canNoClip);
        super(stats);
        super(dps);
        super(target);
        super(goal);
        super(spawn);
        super(loc);
        super(isImmune);
    }
    move(location) {
        if (this.state == (1 || 2 || 3 || 4 || 7)) {
            if (this.canNoClip) {
                this.loc = this.loc.adjacentTo.contains(location)? location : this.loc;
            } else {
                this.loc = this.loc.connectedTo.contains(location)? location : this.loc;
            }
        }
    }
    attack(target) {
        this.target = target;
        while(target.stats.isAlive && target.loc === this.loc) {
            target.stats.hp -= this.dps.physical;
            target.stats.hunger += this.dps.hunger;
            target.stats.insomnia += this.dps.insomnia;
            target.stats.sanity -= this.dps.sanity;
            if (target.stats.hp <= 0) {
                target.stats.isAlive = false;
                ui.appendTerminalOutput("You have been killed by the Shadow.");
            }
        }
    }
    update() {
        // Shadow specific behavior
        if (this.loc === init.game.player.location) {
            this.isNearPlayer = true;
            this.state = 3; // Hunting
            this.attack(init.game.player);
        } else {
            this.isNearPlayer = false;
            this.state = 1; // Roaming
            // Move randomly or towards player if within certain range
        }
    }
}

export class abomination extends monster {
    constructor(
        id = 0,
        state = 0, // 0 = dormant
        isNearPlayer = false,
        hostileLvl = 2,
        canNoClip = false,
        stats =  {
            isAlive : true,
            hp : 500,
            hunger :  0,
            insomnia :  0,
            sanity :  100
        },
        dps = {
            physical : 20,
            hunger : 0,
            insomnia : 0,
            sanity : 0,
        },
        target = null,
        goal = [],
        spawn = init.loc.VENT1,
        loc = init.loc.VENT1,
        isImmune = {
            holy_water:false,
            hide:false,
            physical:false
        }
    ) {
        super(id);
        super(state);
        super(isNearPlayer);
        super(hostileLvl);
        super(canNoClip);
        super(stats);
        super(dps);
        super(target);
        super(goal);
        super(spawn);
        super(loc);
        super(isImmune);
    }
    move(location) {
        if (this.state == (1 || 2 || 3 || 4 || 7)) {
            if (this.canNoClip) {
                this.loc = this.loc.adjacentTo.contains(location)? location : this.loc;
            } else {
                this.loc = this.loc.connectedTo.contains(location)? location : this.loc;
            }
        }
    }
    attack(target) {
        this.target = target;
        while(target.stats.isAlive && target.loc === this.loc) {
            target.stats.hp -= this.dps.physical;
            target.stats.hunger += this.dps.hunger;
            target.stats.insomnia += this.dps.insomnia;
            target.stats.sanity -= this.dps.sanity;
            if (target.stats.hp <= 0) {
                target.stats.isAlive = false;
                ui.appendTerminalOutput("You have been killed by the Abomination.");
            }
        }
    }
    update() {
        // Abomination specific behavior
        if (this.loc === init.game.player.location) {
            this.isNearPlayer = true;
            this.state = 3; // Hunting
            this.attack(init.game.player);
        } else {
            this.isNearPlayer = false;
            this.state = 1; // Roaming
            // Move randomly or towards player if within certain range
        }
    }
}

/** ===== PERSISTED =====
 * 
 */



export let setting = {
    sys : {
        globalTimer: new Date.now() * 0.001,
        startTime: new Date.now() * 0.00,
        runTimer: 0
    },
    general : {},
    ui : {},
    sound : {},
    rctrl : {
        difLvl : 1,
        debug : false,
    }
};

export let player = new preset.player(
    "CR",
    [new preset.item(1, "PPSH-41", 1, 1000, {hp:25, hunger:0,insomnia:0, sanity:0 }), new preset.item(2, "Mabaro Scigar", 10000, 1, {hp:0,hunger:5,insomnia:0,sanity:-10})],
    {hp:1000, hunger:0, insomnia:0, sanity:100},
    false,
    false
)

/** ====== LOGIC =====
 * 
 */

import * as ui from '../../ui.js';




export const optcmd = {
    go: function(loc) {
        if (init.game.rooms[loc]) {
            if (init.game.rooms[loc].status === "safe") {
                init.game.player.location = loc;
                ui.appendTerminalOutput(`You move to the ${loc}.`);
                if (init.game.rooms[loc].items.length > 0) {
                    ui.appendTerminalOutput(`You see the following items: ${init.game.rooms[loc].items.map(i => i.name).join(", ")}.`);
                }
                if (init.game.rooms[loc].fire && init.game.rooms[loc].fire.size > 0) {
                    ui.appendTerminalOutput(`There is a fire here! You need to put it out quickly!`);
                    init.game.rooms[loc].status = "on fire";
                }
            } else if (init.game.rooms[loc].status === "on fire") {
                ui.appendTerminalOutput(`The ${loc} is on fire! You can't go there until the fire is out!`);
            } else if (init.game.rooms[loc].status === "locked") {
                ui.appendTerminalOutput(`The ${loc} is locked! You can't go there until you unlock it!`);
            } else {
                ui.appendTerminalOutput(`You can't go to the ${loc} right now.`);
            }
        } else {
            ui.appendTerminalOutput(`There is no location named ${loc}.`);
        }
    },
    get: function(obj, amount = 1) {
        const itemIndex = init.game.rooms[init.game.player.location].items.findIndex(i => i.name === obj);
        if (itemIndex !== -1) {
            const item = init.game.rooms[init.game.player.location].items[itemIndex];
            if (item.count >= amount) {
                item.count -= amount;
                const invItemIndex = init.game.player.inventory.findIndex(i => i.name === obj);
                if (invItemIndex !== -1) {
                    init.game.player.inventory[invItemIndex].count += amount;
                } else {
                    init.game.player.inventory.push(new preset.item(item.id, item.name, amount, item.duri, item.dmg));
                }
                ui.appendTerminalOutput(`You pick up ${amount} ${obj}(s).`);
                if (item.count === 0) {
                    init.game.rooms[init.game.player.location].items.splice(itemIndex, 1);
                }
            } else {
                ui.appendTerminalOutput(`There are not enough ${obj}(s) here to pick up.`);
            }
        } else {
            ui.appendTerminalOutput(`There is no ${obj} here to pick up.`);
        }   
    },
    drop: function(obj, amount = 1) {
        const invItemIndex = init.game.player.inventory.findIndex(i => i.name === obj);
        if (invItemIndex !== -1) {
            const item = init.game.player.inventory[invItemIndex];
            if (item.count >= amount) {
                item.count -= amount;
                const roomItemIndex = init.game.rooms[init.game.player.location].items.findIndex(i => i.name === obj);
                if (roomItemIndex !== -1) {
                    init.game.rooms[init.game.player.location].items[roomItemIndex].count += amount;
                } else {
                    init.game.rooms[init.game.player.location].items.push(new preset.item(item.id, item.name, amount, item.duri, item.dmg));
                }
                ui.appendTerminalOutput(`You drop ${amount} ${obj}(s).`);
                if (item.count === 0) {
                    init.game.player.inventory.splice(invItemIndex, 1);
                }
            } else {
                ui.appendTerminalOutput(`You don't have enough ${obj}(s) to drop.`);
            }
        } else {
            ui.appendTerminalOutput(`You don't have any ${obj} to drop.`);
        }
    },
    use: function(obj, target) {
        if (obj === "fire extinguisher" && target === "fire") {
            if (init.game.fire.size > 0) {
                init.game.fire.size -= 1;
                ui.appendTerminalOutput("You use the fire extinguisher to put out some of the fire.");
                if (init.game.fire.size === 0) {
                    ui.appendTerminalOutput("The fire is completely out.");
                    init.game.rooms[init.game.player.location].status = "safe";
                }
            } else {
                ui.appendTerminalOutput("There is no fire to put out.");
            }
        } else if (obj === "fire extinguisher" && target !== "fire") {
            ui.appendTerminalOutput("You can't use the fire extinguisher on that.");
        } else {
            ui.appendTerminalOutput("You can't use that.");
        }
    },
    look: function() {
        const loc = init.game.player.location;
        ui.appendTerminalOutput(`You are in the ${loc}.`);
        ui.appendTerminalOutput(init.game.rooms[loc].desc);
        if (init.game.rooms[loc].items.length > 0) {
            ui.appendTerminalOutput(`You see the following items: ${init.game.rooms[loc].items.map(i => i.name).join(", ")}.`);
        }
        if (init.game.rooms[loc].fire && init.game.rooms[loc].fire.size > 0) {
            ui.appendTerminalOutput(`There is a fire here! You need to put it out quickly!`);
            init.game.rooms[loc].status = "on fire";
        }
        if (init.game.rooms[loc].exits.length > 0) {
            ui.appendTerminalOutput(`Exits: ${init.game.rooms[loc].exits.join(", ")}.`);
        }
        if (init.game.rooms[loc].monsters.length > 0) {
            ui.appendTerminalOutput(`You see the following creatures: ${init.game.rooms[loc].monsters.map(m => m.name).join(", ")}.`);
        }
    },
    inv: function() {
        if (init.game.player.inventory.length > 0) {
            ui.appendTerminalOutput(`You are carrying: ${init.game.player.inventory.map(i => `${i.name} (x${i.count})`).join(", ")}.`);
        } else {
            ui.appendTerminalOutput("You are not carrying anything.");
        }   
    },
    exam: function() {
        ui.appendTerminalOutput("You examine your surroundings carefully, but find nothing unusual.");  
    },
    help: function() {
        ui.appendTerminalOutput(`
        TODO added the help text
        `);
    },
    fix: function(obj) {
        ui.appendTerminalOutput(`You attempt to fix the ${obj}, but realize you need proper tools and knowledge to do so.`);
    },
    reboot: function(obj) {
        ui.appendTerminalOutput(`You attempt to reboot the ${obj}, but it seems to be functioning normally.`);
    },
    stat: function() {
        ui.appendTerminalOutput(`Player Stats:
        HP: ${init.game.player.stats.hp}
        Hunger: ${init.game.player.stats.hunger}
        Insomnia: ${init.game.player.stats.insomnia}
        Sanity: ${init.game.player.stats.sanity}
        `);
    },
    upgrade: function() {
        ui.appendTerminalOutput("You look around for upgrade options, but find none available at the moment.");
    },
    peak: function(loc) {
        if (init.game.rooms[loc]) {
            ui.appendTerminalOutput(`You peek into the ${loc}.`);
            ui.appendTerminalOutput(init.game.rooms[loc].desc);
            if (init.game.rooms[loc].items.length > 0) {
                ui.appendTerminalOutput(`You see the following items: ${init.game.rooms[loc].items.map(i => i.name).join(", ")}.`);
            }
            if (init.game.rooms[loc].fire && init.game.rooms[loc].fire.size > 0) {
                ui.appendTerminalOutput(`There is a fire there! You need to put it out quickly!`);
                init.game.rooms[loc].status = "on fire";
            }
            if (init.game.rooms[loc].exits.length > 0) {
                ui.appendTerminalOutput(`Exits: ${init.game.rooms[loc].exits.join(", ")}.`);
            }
            if (init.game.rooms[loc].monsters.length > 0) {
                ui.appendTerminalOutput(`You see the following creatures: ${init.game.rooms[loc].monsters.map(m => m.name).join(", ")}.`);
            }
        } else {
            ui.appendTerminalOutput(`There is no location named ${loc}.`);
        }   
    },
    cam: function(num) {
        if (init.game.cameras[num]) {
            ui.appendTerminalOutput(`You access camera ${num}.`);
            ui.appendTerminalOutput(init.game.cameras[num].desc);
            if (init.game.cameras[num].status === "offline") {
                ui.appendTerminalOutput("The camera is currently offline.");
            } else {
                ui.appendTerminalOutput("The camera feed is live.");
            }
        } else {
            ui.appendTerminalOutput(`There is no camera numbered ${num}.`);
        }   
    },
    about: function() {
        ui.appendTerminalOutput("Reactor Control Terminal v1.0. Manage the reactor and ensure safety protocols are followed.");
    },
    settings: function(opt, ...arg) {
        if (opt === "volume") {
            const vol = parseInt(arg[0]);
            if (!isNaN(vol) && vol >= 0 && vol <= 100) {
                init.game.settings.volume = vol;
                ui.appendTerminalOutput(`Volume set to ${vol}%.`);
            } else {
                ui.appendTerminalOutput("Invalid volume level. Please specify a value between 0 and 100.");
            }
        } else if (opt === "difficulty") {
            const diff = arg[0].toLowerCase();
            if (["easy", "normal", "hard"].includes(diff)) {
                init.game.settings.difficulty = diff;
                ui.appendTerminalOutput(`Difficulty set to ${diff}.`);
            } else {
                ui.appendTerminalOutput("Invalid difficulty level. Please choose 'easy', 'normal', or 'hard'.");
            }
        } else {
            ui.appendTerminalOutput("Unknown setting option.");
        }
    },
    hide: function() {
        ui.appendTerminalOutput("You find a safe spot to hide and wait for any danger to pass.");
    }
};

/** ===== OPTCMD =====
 * 
 */

/** ===== INIT =====
 * 
 */

import * as ui from '../../ui.js';





// === preset ===
/**
 * This section id dedicated to all the setup code for the game
 */
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
    CP:   new preset.room(
        "CoolantPumpStation",     
        "CP",   
        [0,0],   
        [14,10], 
        ["D"],            
        ["D", "Vent"],
        {
            "D" : new preset.door("CP_Door_D", 100, [15,5], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true)
        }, {
            "cam" : new preset.cam("CP_Cam", 100, [1,1], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true)
        }, {
            waterPump : new preset.fixture("waterPump", 1000, [7,5], 0, 0, {
                cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false),
                pump : new preset.part(2,"water pump", 1, 1000, 0, 20, 10, 0, 0, false, false),
                gfci : new preset.part(3,"GFCI", 1, 1000, 0, 240, 5, 0, 0, false, false)
            }, false),
            waterPipe : new preset.fixture("waterPipe", 1000, [7,5], 0, 0, {
                pipe1 : new preset.part(1,"pipe", 1, 1000, 0, 10, 5, 0, 0, false, false),
                valve : new preset.part(2,"valve", 1, 1000, 0, 10, 5, 0, 0, false, false),
                pipe2 : new preset.part(3,"pipe", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            controlPanel : new preset.fixture("controlPanel", 1000, [2,2], 0, 0, {
                cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            emergencyShutoff : new preset.fixture("emergencyShutoff", 1000, [12,2], 0, 0, {
                button : new preset.part(1,"emergency shutoff button", 1, 1000, 0, 5, 5, 0, 0, false, false)
            }, false)
        }
    ),
    Vent: new preset.room(
        "VentilationSystems",     
        "Vent", 
        [0,11],  
        [14,17], 
        ["D"],            
        ["D", "CP","LAB"],
        {
            "D" : new preset.door("Vent_Door_D", 100, [15,16], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true)
        },{
            "cam" : new preset.cam("Vent_Cam", 100, [1,12], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true)
        }, {
            ventFan : new preset.fixture("ventFan", 1000, [7,14], 0, 0, {
                cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false),
                fan : new preset.part(2,"ventilation fan", 1, 1000, 0, 20, 10, 0, 0, false, false),
                gfci : new preset.part(3,"GFCI", 1, 1000, 0, 240, 5, 0, 0, false, false)
            }, false),
            airDucts : new preset.fixture("airDucts", 1000, [7,14], 0, 0, {
                duct1 : new preset.part(1,"air duct", 1, 1000, 0, 10, 5, 0, 0, false, false),
                filter : new preset.part(2,"air filter", 1, 1000, 0, 10, 5, 0, 0, false, false),
                duct2 : new preset.part(3,"air duct", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            controlPanel : new preset.fixture("controlPanel", 1000, [2,12], 0, 0, {
                cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            emergencyShutoff : new preset.fixture("emergencyShutoff", 1000, [12,12], 0, 0, {
                button : new preset.part(1,"emergency shutoff button", 1, 1000, 0, 5, 5, 0, 0, false, false)
            }, false)
        }
    ), 
    LAB:  new preset.room(
        "Laboratory",             
        "LAB",  
        [0,18],  
        [14,36], 
        ["D", "DCR"],     
        ["D", "DCR", "Vent"],
        {
            "D" : new preset.door("LAB_Door_D", 100, [15,26], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true),
            "DCR" : new preset.door("LAB_Door_DCR", 100, [14,34], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true)
        }, {
            "cam" : new preset.cam("LAB_Cam", 100, [1,19], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true)
        }, {
            labBench : new preset.fixture("labBench", 1000, [7,25], 0, 0, {
                cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false),
                microscope : new preset.part(2,"microscope", 1, 1000, 0, 10, 5, 0, 0, false, false),
                centrifuge : new preset.part(3,"centrifuge", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            storageCabinet : new preset.fixture("storageCabinet", 1000, [3,22], 0, 0, {
                cabinet : new preset.part(1,"storage cabinet", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            controlPanel : new preset.fixture("controlPanel", 1000, [2,19], 0, 0, {
                cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            abominationChamber : new preset.fixture("abominationChamber", 1000, [11,30], 0, 0, {
                chamber : new preset.part(1,"abomination chamber", 1, 1000, 0, 10, 5, 0, 0, false, false),
                defenseTurret : new preset.part(2,"defense turret", 1, 1000, 0, 10, 5, 0, 0, false, false),
                containmentField : new preset.part(3,"containment field", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            emergencyShutoff : new preset.fixture("emergencyShutoff", 1000, [12,19], 0, 0, {
                button : new preset.part(1,"emergency shutoff button", 1, 1000, 0, 5, 5, 0, 0, false, false),
                gfci : new preset.part(2,"GFCI", 1, 1000, 0, 240, 5, 0, 0, false, false)
            }, false)
        },
    ),

    PC:   new preset.room(
        "PowerConverterRoom",     
        "PC",   
        [22,0],  
        [30,5],  
        ["SF"],           
        ["SF", "D", "RR"],
        {
            "SF" : new preset.door("PC_Door_SF", 100, [26,6], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true)
        }, {
            "cam" : new preset.cam("PC_Cam", 100, [23,1], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true)
        }, {
            transformer : new preset.fixture("transformer", 1000, [26,3], 0, 0, {
                cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false),
                transformerCore : new preset.part(2,"transformer core", 1, 1000, 0, 20, 10, 0, 0, false, false),
                coolingSystem : new preset.part(3,"cooling system", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            circuitBreaker : new preset.fixture("circuitBreaker", 1000, [24,2], 0, 0, {
                breakerPanel : new preset.part(1,"breaker panel", 1, 1000, 0, 10, 5, 0, 0, false, false),
                mainSwitch : new preset.part(2,"main switch", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            controlPanel : new preset.fixture("controlPanel", 1000, [23,1], 0, 0, {
                cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            emergencyShutoff : new preset.fixture("emergencyShutoff", 1000, [28,1], 0, 0, {
                button : new preset.part(1,"emergency shutoff button", 1, 1000, 0, 5, 5, 0, 0, false, false)
            }, false)
        }
    ),

    SF:   new preset.room(
        "SpentFuelStorage",       
        "SF",   
        [22,9],  
        [30,17], 
        ["RR", "PC"],     
        ["RR", "PC", "D", "C"],
        {
            "RR" : new preset.door("SF_Door_RR", 100, [26,18], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true),
            "PC" : new preset.door("SF_Door_PC", 100, [26,8], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true)
        }, {
            "cam" : new preset.cam("SF_Cam", 100, [23,10], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true)
        }, {
            storageRacks : new preset.fixture("storageRacks", 1000, [26,13], 0, 0, {
                cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false),
                rack1 : new preset.part(2,"storage rack", 1, 1000, 0, 10, 5, 0, 0, false, false),
                rack2 : new preset.part(3,"storage rack", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            radiationShielding : new preset.fixture("radiationShielding", 1000, [24,11], 0, 0, {
                shield1 : new preset.part(1,"radiation shield", 1, 1000, 0, 10, 5, 0, 0, false, false),
                shield2 : new preset.part(2,"radiation shield", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            controlPanel : new preset.fixture("controlPanel", 1000, [23,10], 0, 0, {
                cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            positivepressureSystem : new preset.fixture("positivepressureSystem", 1000, [28,10], 0, 0, {
                system : new preset.part(1,"positive pressure system", 1, 1000, 0, 10, 5, 0, 0, false, false),
                filter : new preset.part(2,"HEPA filter", 1, 1000, 0, 10, 5, 0, 0, false, false),
                alarm : new preset.part(3,"alarm", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            spendfuelpool : new preset.fixture("spendfuelpool", 1000, [28,14], 0, 0, {
                pool : new preset.part(1,"spent fuel pool", 1, 1000, 0, 20, 10, 0, 0, false, false),
                crane : new preset.part(2,"overhead crane", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            emergencyShutoff : new preset.fixture("emergencyShutoff", 1000, [28,10], 0, 0, {
                button : new preset.part(1,"emergency shutoff button", 1, 1000, 0, 5, 5, 0, 0, false, false)
            }, false)
        }
    ),

    GR:   new preset.room(
        "GeneratorRoom",          
        "GR",   
        [22,0],  
        [30,31], 
        ["A"],            
        ["A", "D", "BU", "C"],
        {
            "A" : new preset.door("GR_Door_A", 100, [31,15], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true)
        }, {
            "cam" : new preset.cam("GR_Cam", 100, [23,1], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true)
        }, {
            dieselGenerator : new preset.fixture("dieselGenerator", 1000, [26,15], 0, 0, {
                cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false),
                generator : new preset.part(2,"diesel generator", 1, 1000, 0, 20, 10, 0, 0, false, false),
                fuelTank : new preset.part(3,"fuel tank", 1, 1000, 0, 20, 10, 0, 0, false, false)
            }, false),
            fuelPump : new preset.fixture("fuelPump", 1000, [24,14], 0, 0, {
                pump : new preset.part(1,"fuel pump", 1, 1000, 0, 10, 5, 0, 0, false, false),
                hose : new preset.part(2,"fuel hose", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            controlPanel : new preset.fixture("controlPanel", 1000, [23,1], 0, 0, {
                cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            emergencyShutoff : new preset.fixture("emergencyShutoff", 1000, [28,1], 0, 0, {
                button : new preset.part(1,"emergency shutoff button", 1, 1000, 0, 5, 5, 0, 0, false, false)
            }, false)
        }
    ),

    BU:   new preset.room(
        "Bunker",                 
        "BU",   
        [22,0],  
        [68,36], 
        ["DCR", "CR"],    
        ["DCR", "CR", "D", "E", "A", "B", "GR", "SR"],
        {
            "DCR" : new preset.door("BU_Door_DCR", 100, [23,34], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true),
            "CR" : new preset.door("BU_Door_CR", 100, [54,19], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true)
        }, {
            "cam" : new preset.cam("BU_Cam", 100, [23,1], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true)
        }, {
            airlock : new preset.fixture("airlock", 1000, [45,18], 0, 0, {
                innerDoor : new preset.part(1,"inner airlock door", 1, 1000, 0, 10, 5, 0, 0, false, false),
                outerDoor : new preset.part(2,"outer airlock door", 1, 1000, 0, 10, 5, 0, 0, false, false),
                controlPanel : new preset.part(3,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            storageRoom : new preset.fixture("storageRoom", 1000, [30,10], 0, 0, {
                shelf1 : new preset.part(1,"storage shelf", 1, 1000, 0, 10, 5, 0, 0, false, false),
                shelf2 : new preset.part(2,"storage shelf", 1, 1000, 0, 10, 5, 0, 0, false, false),
                locker : new preset.part(3,"storage locker", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            controlPanel : new preset.fixture("controlPanel", 1000, [23,1], 0, 0, {
                cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            positivepressureSystem : new preset.fixture("positivepressureSystem", 1000, [60,30], 0, 0, {
                system : new preset.part(1,"positive pressure system", 1, 1000, 0, 10, 5, 0, 0, false, false),
                filter : new preset.part(2,"HEPA filter", 1, 1000, 0, 10, 5, 0, 0, false, false),
                alarm : new preset.part(3,"alarm", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            emergencyShutoff : new preset.fixture("emergencyShutoff", 1000, [28,1], 0, 0, {
                button : new preset.part(1,"emergency shutoff button", 1, 1000, 0, 5, 5, 0, 0, false, false)
            }, false)
        }
    ),
    RR:   new preset.room(
        "ReactorRoom",            
        "RR",   
        [32,0],  
        [58,14], 
        ["TR", "SF","C"], 
        ["TR", "SF","C", "PC"],
        {
            "TR" : new preset.door("RR_Door_TR", 100, [59,7], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true),
            "SF" : new preset.door("RR_Door_SF", 100, [45,15], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true),
            "C" : new preset.door("RR_Door_C", 100, [31,7], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true)
        }, {
            "cam" : new preset.cam("RR_Cam", 100, [33,1], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true)
        }, {
            reactorCore : new preset.fixture("reactorCore", 1000, [45,7], 0, 0, {
                cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false),
                core : new preset.part(2,"reactor core", 1, 1000, 0, 20, 10, 0, 0, false, false),
                moderator : new preset.part(3,"neutron moderator", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            coolingSystem : new preset.fixture("coolingSystem", 1000, [40,5], 0, 0, {
                pump : new preset.part(1,"coolant pump", 1, 1000, 0, 10, 5, 0, 0, false, false),
                heatExchanger : new preset.part(2,"heat exchanger", 1, 1000, 0, 10, 5, 0, 0, false, false),
                coolantTank : new preset.part(3,"coolant tank", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            radiationShielding : new preset.fixture("radiationShielding", 1000, [35,3], 0, 0, {
                shield1 : new preset.part(1,"radiation shield", 1, 1000, 0, 10, 5, 0, 0, false, false),
                shield2 : new preset.part(2,"radiation shield", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            controlPanel : new preset.fixture("controlPanel", 1000, [33,1], 0, 0, {
                cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            emergencyShutoff : new preset.fixture("emergencyShutoff", 1000, [38,1], 0, 0, {
                button : new preset.part(1,"emergency shutoff button", 1, 1000, 0, 5, 5, 0, 0, false, false)
            }, false)
        }
    ),
    CR:   new preset.room(
        "ControlRoom",            
        "CR",   
        [38,19], 
        [52,30], 
        ["A", "B", "BU"], 
        ["A", "B", "BU", "C"],
        {
            "A" : new preset.door("CR_Door_A", 100, [37,25], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true),
            "B" : new preset.door("CR_Door_B", 100, [53,25], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true),
            "BU" : new preset.door("CR_Door_BU", 100, [45,19], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true)
        }, {
            "cam" : new preset.cam("CR_Cam", 100, [39,20], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true)
        }, {
            mainControlConsole : new preset.fixture("mainControlConsole", 1000, [45,25], 0, 0, {
                cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false),
                screen1 : new preset.part(2,"monitor screen", 1, 1000, 0, 10, 5, 0, 0, false, false),
                screen2 : new preset.part(3,"monitor screen", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            backupControlConsole : new preset.fixture("backupControlConsole", 1000, [42,22], 0, 0, {
                cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false),
                screen : new preset.part(2,"monitor screen", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            communicationSystem : new preset.fixture("communicationSystem", 1000, [40,21], 0, 0, {
                radio : new preset.part(1,"radio system", 1, 1000, 0, 10, 5, 0, 0, false, false),
                intercom : new preset.part(2,"intercom", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            controlPanel : new preset.fixture("controlPanel", 1000, [39,20], 0, 0, {
                cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            emergencyShutoff : new preset.fixture("emergencyShutoff", 1000, [50,20], 0, 0, {
                button : new preset.part(1,"emergency shutoff button", 1, 1000, 0, 5, 5, 0, 0, false, false)
            }, false)
        }
    ),
    TR:   new preset.room(
        "TurbineRoom",            
        "TR",   
        [60,0],  
        [68,15], 
        ["RR"],           
        ["RR", "C", "E"],
        {
            "RR" : new preset.door("TR_Door_RR", 100, [59,7], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true)
        }, {
            "cam" : new preset.cam("TR_Cam", 100, [61,1], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true)
        }, {
            turbineGenerator : new preset.fixture("turbineGenerator", 1000, [64,7], 0, 0, {
                cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false),
                turbine : new preset.part(2,"turbine", 1, 1000, 0, 20, 10, 0, 0, false, false),
                generator : new preset.part(3,"generator", 1, 1000, 0, 20, 10, 0, 0, false, false)
            }, false),
            coolingSystem : new preset.fixture("coolingSystem", 1000, [62,5], 0, 0, {
                pump : new preset.part(1,"coolant pump", 1, 1000, 0, 10, 5, 0, 0, false, false),
                heatExchanger : new preset.part(2,"heat exchanger", 1, 1000, 0, 10, 5, 0, 0, false, false),
                coolantTank : new preset.part(3,"coolant tank", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            controlPanel : new preset.fixture("controlPanel", 1000, [61,1], 0, 0, {
                cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            emergencyShutoff : new preset.fixture("emergencyShutoff", 1000, [66,1], 0, 0, {
                button : new preset.part(1,"emergency shutoff button", 1, 1000, 0, 5, 5, 0, 0, false, false)
            }, false)
        }
    ),
    SR:   new preset.room(
        "ServerRoom",             
        "SR",   
        [60,19], 
        [68,31], 
        ["B"],            
        ["B", "BU", "C", "E"],
        {
            "B" : new preset.door("SR_Door_B", 100, [59,25], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true)
        }, {
            "cam" : new preset.cam("SR_Cam", 100, [61,20], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true)
        }, {
            serverRacks : new preset.fixture("serverRacks", 1000, [64,25], 0, 0, {
                cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false),
                rack1 : new preset.part(2,"server rack", 1, 1000, 0, 10, 5, 0, 0, false, false),
                rack2 : new preset.part(3,"server rack", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            coolingSystem : new preset.fixture("coolingSystem", 1000, [62,22], 0, 0, {
                acUnit : new preset.part(1,"AC unit", 1, 1000, 0, 10, 5, 0, 0, false, false),
                vent : new preset.part(2,"ventilation duct", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            controlPanel : new preset.fixture("controlPanel", 1000, [61,20], 0, 0, {
                cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            emergencyShutoff : new preset.fixture("emergencyShutoff", 1000, [66,20], 0, 0, {
                button : new preset.part(1,"emergency shutoff button", 1, 1000, 0, 5, 5, 0, 0, false, false)
            }, false)
        }
    ),
    BW:   new preset.room(
        "WaterTreatmentFacility", 
        "BW",   
        [76,0],  
        [91,11], 
        ["E"],            
        ["E", "CA"],
        {
            "E" : new preset.door("BW_Door_E", 100, [75,6], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true)
        }, {
            "cam" : new preset.cam("BW_Cam", 100, [77,1], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true)
        }, {
            waterFiltration : new preset.fixture("waterFiltration", 1000, [80,6], 0, 0, {
                cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false),
                filterSystem : new preset.part(2,"filtration system", 1, 1000, 0, 20, 10, 0, 0, false, false),
                pump : new preset.part(3,"water pump", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            chemicalTreatment : new preset.fixture("chemicalTreatment", 1000, [78,4], 0, 0, {
                tank : new preset.part(1,"chemical tank", 1, 1000, 0, 10, 5, 0, 0, false, false),
                dispenser : new preset.part(2,"chemical dispenser", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            controlPanel : new preset.fixture("controlPanel", 1000, [77,1], 0, 0, {
                cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            emergencyShutoff : new preset.fixture("emergencyShutoff", 1000, [82,1], 0, 0, {
                button : new preset.part(1,"emergency shutoff button", 1, 1000, 0, 5, 5, 0, 0, false, false)
            }, false)
        }
    ),
    CA:   new preset.room(
        "ControlAutomationRoom",        
        "CA",   
        [76,12], 
        [91,23], 
        ["E"],            
        ["E", "BW", "ELE"],
        {
            "E" : new preset.door("CA_Door_E", 100, [75,18], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true)
        }, {
            "cam" : new preset.cam("CA_Cam", 100, [77,13], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true)
        }, {
            automationSystems : new preset.fixture("automationSystems", 1000, [80,18], 0, 0, {
                cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false),
                plc : new preset.part(2,"PLC unit", 1, 1000, 0, 10, 5, 0, 0, false, false),
                hmi : new preset.part(3,"HMI screen", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            networkInfrastructure : new preset.fixture("networkInfrastructure", 1000, [78,15], 0, 0, {
                server : new preset.part(1,"network server", 1, 1000, 0, 10, 5, 0, 0, false, false),
                router : new preset.part(2,"network router", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            automationControlPanel : new preset.fixture("automationControlPanel", 1000, [77,13], 0, 0, {
                cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false),
                hvacControl : new preset.part(2,"HVAC control unit", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            emergencyShutoff : new preset.fixture("emergencyShutoff", 1000, [82,13], 0, 0, {
                button : new preset.part(1,"emergency shutoff button", 1, 1000, 0, 5, 5, 0, 0, false, false)
            }, false)
        }
    ),
    ELE:  new preset.room(
        "ElectricalSwitchyard",   
        "ELE",  
        [76,24], 
        [91,36], 
        ["E"],            
        ["E", "CA"],
        {
            "E" : new preset.door("ELE_Door_E", 100, [75,30], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true)
        }, {
            "cam" : new preset.cam("ELE_Cam", 100, [77,25], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true)
        }, {
            transformerStation : new preset.fixture("transformerStation", 1000, [80,30], 0, 0, {
                cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false),
                transformer : new preset.part(2,"transformer", 1, 1000, 0, 20, 10, 0, 0, false, false),
                switchgear : new preset.part(3,"switchgear", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            powerDistribution : new preset.fixture("powerDistribution", 1000, [78,27], 0, 0, {
                panel : new preset.part(1,"distribution panel", 1, 1000, 0, 10, 5, 0, 0, false, false),
                breakers : new preset.part(2,"circuit breakers", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            controlPanel : new preset.fixture("controlPanel", 1000, [77,25], 0, 0, {
                cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            emergencyShutoff : new preset.fixture("emergencyShutoff", 1000, [82,25], 0, 0, {
                button : new preset.part(1,"emergency shutoff button", 1, 1000, 0, 5, 5, 0, 0, false, false)
            }, false)
        }
    ),

    // Hallways
    A:   new preset.hallway( 
        "HallwayA",            
        "A",   
        [32,18], 
        [36,31], 
        ["CR", "GR", "C"],          
        ["CR", "GR", "C", "BU"],
        {
            "CR" : new preset.door("A_Door_CR", 100, [37,25], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true),
            "GR" : new preset.door("A_Door_GR", 100, [31,15], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true),
            "C"  : new preset.door("A_Door_C", 100, [31,7], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true)
        }, {
            "cam" : new preset.cam("A_Cam", 100, [33,20], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true)
        }, {
            controlPanel : new preset.fixture("controlPanel", 1000, [33,20], 0, 0, {
                cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            firesuppressionSystem : new preset.fixture("fireSuppressionSystem", 1000, [34,22], 0, 0, {
                system : new preset.part(1,"fire suppression system", 1, 1000, 0, 10, 5, 0, 0, false, false),
                nozzle : new preset.part(2,"sprinkler nozzle", 1, 1000, 0, 10, 5, 0, 0, false, false),
                alarm : new preset.part(3,"alarm", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            emergencyShutoff : new preset.fixture("emergencyShutoff", 1000, [34,20], 0, 0, {
                button : new preset.part(1,"emergency shutoff button", 1, 1000, 0, 5, 5, 0, 0, false, false)
            }, false)
        }
    ),
    B:   new preset.hallway( 
        "HallwayB",            
        "B",   
        [54,18], 
        [58,31], 
        ["CR", "SR", "C"],          
        ["CR", "SR", "C", "BU"],
        {
            "CR" : new preset.door("B_Door_CR", 100, [53,25], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true),
            "SR" : new preset.door("B_Door_SR", 100, [59,25], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true),
            "C"  : new preset.door("B_Door_C", 100, [31,7], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true)
        }, {
            "cam" : new preset.cam("B_Cam", 100, [55,20], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true)
        }, {
            controlPanel : new preset.fixture("controlPanel", 1000, [55,20], 0, 0, {
                cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            firesuppressionSystem : new preset.fixture("fireSuppressionSystem", 1000, [56,22], 0, 0, {
                system : new preset.part(1,"fire suppression system", 1, 1000, 0, 10, 5, 0, 0, false, false),
                nozzle : new preset.part(2,"sprinkler nozzle", 1, 1000, 0, 10, 5, 0, 0, false, false),
                alarm : new preset.part(3,"alarm", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            emergencyShutoff : new preset.fixture("emergencyShutoff", 1000, [56,20], 0, 0, {
                button : new preset.part(1,"emergency shutoff button", 1, 1000, 0, 5, 5, 0, 0, false, false)
            }, false)
        }
    ),
    C:   new preset.hallway( 
        "HallwayC",            
        "C",   
        [20,16], 
        [70,18], 
        ["A", "B", "D", "E", "RR"], 
        ["A", "B", "D", "E", "RR", "SF", "GR", "TR", "SR", "CR"],
        {
            "A"  : new preset.door("C_Door_A", 100, [36,31], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true),
            "B"  : new preset.door("C_Door_B", 100, [58,31], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true),
            "D"  : new preset.door("C_Door_D", 100, [20,32], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true),
            "E"  : new preset.door("C_Door_E", 100, [70,36], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true),
            "RR" : new preset.door("C_Door_RR", 100, [58,14], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true)
        }, {
            "cam_east" : new preset.cam("C_Cam_East", 100, [45,18], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true),
            "cam_west" : new preset.cam("C_Cam_West", 100, [25,18], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true)
        }, {
            controlPanel : new preset.fixture("controlPanel", 1000, [45,18], 0, 0, {
                cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            firesuppressionSystem : new preset.fixture("fireSuppressionSystem", 1000, [50,20], 0, 0, {
                system : new preset.part(1,"fire suppression system", 1, 1000, 0, 10, 5, 0, 0, false, false),
                nozzle : new preset.part(2,"sprinkler nozzle", 1, 1000, 0, 10, 5, 0, 0, false, false),
                alarm : new preset.part(3,"alarm", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            emergencyShutoff : new preset.fixture("emergencyShutoff", 1000, [50,18], 0, 0, {
                button : new preset.part(1,"emergency shutoff button", 1, 1000, 0, 5, 5, 0, 0, false, false)
            }, false)
        }
    ),
    D:   new preset.hallway( 
        "HallwayD",            
        "D",   
        [16,0],  
        [20,32], 
        ["C", "LAB", "Vent", "CP"], 
        ["C", "LAB", "Vent", "CP", "PC", "SF", "GR", "DCR"],
        {
            "C"   : new preset.door("D_Door_C", 100, [20,18], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true),
            "LAB" : new preset.door("D_Door_LAB", 100, [22,32], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true),
            "Vent": new preset.door("D_Door_Vent", 100, [15,16], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true),
            "CP"  : new preset.door("D_Door_CP", 100, [15,8], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true)
        }, {
            "cam_north" : new preset.cam("D_Cam_North", 100, [18,16], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true),
            "cam_south" : new preset.cam("D_Cam_South", 100, [18,1], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true)
        }, {
            controlPanel : new preset.fixture("controlPanel", 1000, [18,16], 0, 0, {
                cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            firesuppressionSystem : new preset.fixture("fireSuppressionSystem", 1000, [19,18], 0, 0, {
                system : new preset.part(1,"fire suppression system", 1, 1000, 0, 10, 5, 0, 0, false, false),
                nozzle : new preset.part(2,"sprinkler nozzle", 1, 1000, 0, 10, 5, 0, 0, false, false),
                alarm : new preset.part(3,"alarm", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            emergencyShutoff : new preset.fixture("emergencyShutoff", 1000, [19,16], 0, 0, {
                button : new preset.part(1,"emergency shutoff button", 1, 1000, 0, 5, 5, 0, 0, false, false)
            }, false)
        }
    ),
    E:   new preset.hallway( 
        "HallwayE",            
        "E",   
        [70,0],  
        [74,36], 
        ["C", "ELE", "CA", "BW"],   
        ["C", "ELE", "CA", "BW", "TR", "SR", "BU"],
        {
            "C"   : new preset.door("E_Door_C", 100, [70,18], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true),
            "ELE" : new preset.door("E_Door_ELE", 100, [70,30], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true),
            "CA"  : new preset.door("E_Door_CA", 100, [70,18], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true),
            "BW"  : new preset.door("E_Door_BW", 100, [70,6], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true)
        }, {
            "cam_north" : new preset.cam("E_Cam_North", 100, [72,25], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true),
            "cam_south" : new preset.cam("E_Cam_South", 100, [72,1], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true)
        }, {
            controlPanel : new preset.fixture("controlPanel", 1000, [72,18], 0, 0, {
                cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            firesuppressionSystem : new preset.fixture("fireSuppressionSystem", 1000, [73,20], 0, 0, {
                system : new preset.part(1,"fire suppression system", 1, 1000, 0, 10, 5, 0, 0, false, false),
                nozzle : new preset.part(2,"sprinkler nozzle", 1, 1000, 0, 10, 5, 0, 0, false, false),
                alarm : new preset.part(3,"alarm", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            emergencyShutoff : new preset.fixture("emergencyShutoff", 1000, [73,18], 0, 0, {
                button : new preset.part(1,"emergency shutoff button", 1, 1000, 0, 5, 5, 0, 0, false, false)
            }, false)
        }
    ),
    DCR: new preset.hallway( 
        "DecontaminationRoom", 
        "DCR", 
        [14,33], 
        [22,35], 
        ["LAB", "BU"],              
        ["LAB", "BU", "D"],
        {
            "LAB": new preset.door("DCR_Door_LAB", 100, [22,34], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true),
            "BU" : new preset.door("DCR_Door_BU", 100, [13,34], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true, false, true)
        }, {
            "cam" : new preset.cam("DCR_Cam", 100, [16,33], 5, 0, {cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)}, true)
        }, {
            decontaminationChamber : new preset.fixture("decontaminationChamber", 1000, [16,33], 0, 0, {
                chamber : new preset.part(1,"decontamination chamber", 1, 1000, 0, 20, 10, 0, 0, false, false),
                shower : new preset.part(2,"decontamination shower", 1, 1000, 0, 10, 5, 0, 0, false, false),
                dryingUnit : new preset.part(3,"drying unit", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            controlPanel : new preset.fixture("controlPanel", 1000, [16,33], 0, 0, {
                cp : new preset.part(1,"control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            hardkilldefense : new preset.fixture("hardkilldefense", 1000, [18,34], 0, 0, {
                turret : new preset.part(1,"defense turret", 1, 1000, 0, 20, 10, 0, 0, false, false),
                ammoBox : new preset.part(2,"ammo box", 1, 1000, 0, 10, 5, 0, 0, false, false),
                dedicated_cp : new preset.part(3,"dedicated control panel", 1, 1000, 0, 10, 5, 0, 0, false, false)
            }, false),
            emergencyShutoff : new preset.fixture("emergencyShutoff", 1000, [16,34], 0, 0, {
                button : new preset.part(1,"emergency shutoff button", 1, 1000, 0, 5, 5, 0, 0, false, false)
            }, false)
        }
    ),
};

export let reactor = {
    stats : {
        isAlive : true,
        integrity : 100,
        powerOutput : 0, // in MW
        temperature : 25, // in Celsius
        radiationLevel : 0, // in mSv/h
        coolantLevel : 100, // in percentage
        controlRodPosition : 100, // in percentage (0% = fully withdrawn, 100% = fully inserted)
        turbineSpeed : 0, // in RPM
        generatorOutput : 0, // in MW
        lastUpdateTime : Date.now() * 0.001 // in seconds
    },
    settings : {
        targetPowerOutput : 500, // in MW
        targetTemperature : 300, // in Celsius
        targetRadiationLevel : 50, // in mSv/h
        targetCoolantLevel : 80, // in percentage
        controlRodAdjustmentRate : 1, // in percentage per second
        coolantFlowRate : 10, // in percentage per second
        turbineAccelerationRate : 100, // in RPM per second
        generatorEfficiency : 0.9 // efficiency factor (0 to 1)
    }
};

export let abomination = new preset.abomination()
   


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