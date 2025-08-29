// ===== Class decoration =====
class monster{
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
            holy_water : false,
            hide : true,
            atc : true
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
    move(loc) {
    }
}

class location{
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

class room extends location {
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
