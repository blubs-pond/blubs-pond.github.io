import * as ui from '../../../ui.js';
import * as init from './init.js';
import * as logic from './logic.js';
import * as optcode from './opt.js';
import * as persisted from './persisted.js';

// ===== Class decoration =====

// === obj item ===
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
        lvl = 0,
        isBroken = false,
        isHaunted = false
    ) {
        super(id);
        super(name);
        super(amount);
        super(durability);
        super(dmg);
        this.maxLoad = maxLoad;
        this.powerin = powerin;
        this.lvl = lvl;
        this.isBroken = isBroken;
        this.isHaunted = isHaunted;
    }
}

export class fixture extends thing {
    constructor(
        name = "_debug",
        durability = 1000000000,
        TL = (0,0),
        BR = (0,0),
        powerin = 0,
        powerout = 0,
        component = [
            new part(1,"control panel", 1, 1000, 0, )
        ]
    ) {
        super(name);
        super(durability);
        this.TL = TL;
        this.BR = BR;

    }
}

// === monster ===
export class monster{
    constructor(
        id = 0,
        state = "dormant",
        isNearPlayer = false,
        isHostile = true,
        canNoClip = false,
        hp = 100,
        dmg = 1,
        target = null,
        goal = [],
        path = [],
        spawn = null,
        location = null,
        isImmune = {
            holy_water:false,
            hide:true,
            physical:true
        }
    ) {
        this.id = id;
        this.state = state;
        this.isNearPlayer = isNearPlayer;
        this.isHostile = isHostile;
        this.canNoClip = canNoClip;
        this.hp = hp;
        this.dmg = dmg;
        this.target = target;
        this.goal = goal;
        this.path = path;
        this.spawn = spawn;
        this.location = location;
        this.isImmune = isImmune;
    }
    move(location) {
    }
}

// === location and structure ===
export class location{
    constructor(
        fullName,
        roomCode,
        TL,
        BR,
        adjacentTo,
        connectedTo
    ) {
        this.fullName = fullName;
        this.roomCode = roomCode;
        this.TL = TL;
        this.BR = BR;
        this.adjacentTo = adjacentTo;
        this.connectedTo = connectedTo;
    }
}

export class room extends location {
    constructor(
        fullName,
        roomCode,
        TL,
        BR,
        adjacentTo,
        connectedTo,

    ) {
        super(fullName);
        super(roomCode);
        super(TL);
        super(BR);
        super(adjacentTo);
        super(connectedTo);
    }
}

export class hallway extends location {
    constructor(
        fullName,
        roomCode,
        TL,
        BR,
        adjacentTo,
        connectedTo,

    ) {
        super(fullName);
        super(roomCode);
        super(TL);
        super(BR);
        super(adjacentTo);
        super(connectedTo);
    }
}



// ===== player ====
export class player {
    constructor(
        loc =  persisted.loc.CR,
        inventory =  [],
        stats =  {
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


