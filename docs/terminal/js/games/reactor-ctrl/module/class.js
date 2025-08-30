import * as ui from '../../../ui.js';
import * as init from './init.js';
import * as logic from './logic.js';
import * as optcode from './opt.js';
import * as persisted from './persisted.js';

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
        dmg = 100000000
    ) {
        this.id = id;
        super(name);
        this.count = amount;
        super(durability);
        this.dmg = dmg;
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
        subComponent = []
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
        component = [
            new part(1,"control panel", 1, 1000, 0)
        ],
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
        component = [
            new part(1,"control panel", 1, 1000, 0)
        ],
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
        component = [
            new part(1,"control panel", 1, 1000, 0)
        ],
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
        camara = new cam()
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
        poi
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
        caffeineEffectTimer = 0.0,
        caffeineCrashTimer = 0.0,
        caffeineOverdosed = false,
        hidingAbuseCounter = 0.0,
        isHiding = false,
        experimentEntryTimer = -1.0,
        doorBeingHeld = "none",
    ) {
        this.loc = loc;
        this.inv = inventory;
        this.stats = stats;
        this.caffeineEffectTimer = caffeineEffectTimer;
        this.caffeineCrashTimer = caffeineCrashTimer;
        this.caffeineOverdosed =  caffeineOverdosed;
        this.hidingAbuseCounter = hidingAbuseCounter;
        this.isHiding = isHiding;
        this.experimentEntryTimer = experimentEntryTimer;
        this.doorBeingHeld = doorBeingHeld;
    }
    move(location) {

    }
    addItem(items = new item()) {
        this.inv.add(items);
    }
}

// === monster ===
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

