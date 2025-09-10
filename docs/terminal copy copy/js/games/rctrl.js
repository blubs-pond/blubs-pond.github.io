
import { Addon } from '../lib/index.js';

// ===== Helper Classes (Encapsulated) =====
class Thing {
    constructor(name = "_debug", durability = 1000000000) {
        this.name = name;
        this.durability = durability;
    }
}

class StatusEffect {
    constructor(name = "none", duration = 0, effect = {}, effect_on_Timer_over = {}, effect_per_second = {}, isPositive = true) {
        this.name = name;
        this.duration = duration;
        this.effect = effect;
        this.effect_on_Timer_over = effect_on_Timer_over;
        this.effect_per_second = effect_per_second;
        this.isPositive = isPositive;
        this.appliedTime = Date.now() / 1000;
    }
    apply(target, terminal) {
        // Apply initial effect
        Object.keys(this.effect).forEach(key => target.stats[key] += this.effect[key]);

        // Apply effect over time
        if (this.duration > 0) {
            const interval = setInterval(() => {
                Object.keys(this.effect_per_second).forEach(key => target.stats[key] += this.effect_per_second[key]);
            }, 1000);

            setTimeout(() => {
                clearInterval(interval);
                Object.keys(this.effect_on_Timer_over).forEach(key => target.stats[key] += this.effect_on_Timer_over[key]);
                const index = target.effects.indexOf(this);
                if (index > -1) {
                    target.effects.splice(index, 1);
                }
            }, this.duration * 1000);
        }
        target.effects.push(this);
    }
}


class Item extends Thing {
    constructor(id = 0, name = "_debug", amount = 1, durability = 1000000000, dmg = {}, effect = new StatusEffect()) {
        super(name, durability);
        this.id = id;
        this.count = amount;
        this.dmg = dmg;
        this.effect = effect;
    }

    use(target, terminal) {
        Object.keys(this.dmg).forEach(key => target.stats[key] += this.dmg[key]);
        if (this.effect.name !== "none") {
            this.effect.apply(target, terminal);
        }
        this.durability -= 1;
        if (this.durability <= 0) {
            terminal.print(`${this.name} broke!`);
        }
    }
}

class Part extends Item {
    constructor(id, name, amount, durability, dmg, maxLoad, powerin, powerout, lvl, isBroken, isHaunted, subComponent = {}) {
        super(id, name, amount, durability, dmg);
        this.maxLoad = maxLoad;
        this.powerin = powerin;
        this.powerout = powerout;
        this.lvl = lvl;
        this.isBroken = isBroken;
        this.isHaunted = isHaunted;
        this.subComponent = subComponent;
    }
    reboot() {
        if (this.isBroken && this.durability > 0) {
            this.isBroken = false;
        }
    }
    upgrade() {
        this.lvl += 1;
    }
}

class Fixture extends Thing {
    constructor(name, durability, cord, powerin, powerout, component = {}, isOn = true) {
        super(name, durability);
        this.cord = cord;
        this.powerin = powerin;
        this.powerout = powerout;
        this.component = component;
        this.isOn = isOn;
    }
}

class Cam extends Fixture {}

class Door extends Fixture {
    constructor(name, durability, cord, powerin, powerout, component, isOn, islock, isOpen) {
        super(name, durability, cord, powerin, powerout, component, isOn);
        this.islock = islock;
        this.isOpen = isOpen;
    }
}

class Location {
    constructor(fullName, roomCode, adjacentTo, connectedTo, tr, bl, door = {}, camera = {}) {
        this.fullName = fullName;
        this.roomCode = roomCode;
        this.adjacentTo = adjacentTo;
        this.connectedTo = connectedTo;
        this.TR = tr;
        this.BL = bl;
        this.door = door;
        this.cam = camera;
        this.items = [];
        this.monsters = [];
    }
}

class Room extends Location {
    constructor(fullName, roomCode, adjacentTo, connectedTo, tr, bl, door, cam, poi = {}) {
        super(fullName, roomCode, adjacentTo, connectedTo, tr, bl, door, cam);
        this.poi = poi;
    }
}

class Hallway extends Location {}

class Player {
    constructor(loc, inventory = [], stats = {}, isHiding = false) {
        this.loc = loc;
        this.inv = inventory;
        this.stats = stats;
        this.isHiding = isHiding;
        this.effects = [];
    }
}

class Monster {
     constructor(id, state, hostileLvl, canNoClip, stats, dps, spawn, loc, isImmune) {
        this.id = id;
        this.state = state; // 0=dormant, 1=roaming, 2=staking, 3=hunting, 4=searching, 5=haunting, 6=hiding, 7=seeking
        this.hostileLvl = hostileLvl;
        this.canNoClip = canNoClip;
        this.stats = stats;
        this.dps = dps;
        this.spawn = spawn;
        this.loc = loc;
        this.isImmune = isImmune;
        this.isNearPlayer = false;
        this.target = null;
        this.path = [];
    }

    move(location) {
        if ([1, 2, 3, 4, 7].includes(this.state)) {
            const possibleNewLoc = this.canNoClip ? location.adjacentTo : location.connectedTo;
            if (possibleNewLoc.includes(location.roomCode)) {
                this.loc = location;
            }
        }
    }
    
    attack(target, terminal) {
        if(target.stats.isAlive && target.loc === this.loc) {
            Object.keys(this.dps).forEach(key => target.stats[key] -= this.dps[key]);
            if(target.stats.hp <= 0) {
                target.stats.isAlive = false;
                terminal.print(`You have been killed by ${this.constructor.name}.`);
            }
        }
    }

    update(player, terminal) {
         if (this.loc === player.loc) {
            this.isNearPlayer = true;
            this.state = 3; // Hunting
            this.attack(player, terminal);
        } else {
            this.isNearPlayer = false;
            this.state = 1; // Roaming
        }
    }
}

class Experiment extends Monster {
    constructor(id, state, hostileLvl, canNoClip, stats, dps, spawn, loc, isImmune) {
        super(id, state, hostileLvl, canNoClip, stats, dps, spawn, loc, isImmune);
    }
}

// ===== Main Addon Class =====

export class ReactorControlGameAddon extends Addon {
    constructor() {
        super();
        this.name = "ReactorControl";
        this.game = null;
        this.gameLoop = null;
    }

    init(terminal) {
        super.init(terminal);
        this.setupGame();
        this.terminal.print("Launching Reactor Control...");
        this.terminal.print("Reactor Bolshoy Moshchnosti Kanalny at #### Site started. Awaiting next instructions.");
        this.terminal.print("Reactor Control System Initiated. Type 'help' for commands.");
        this.gameLoop = setInterval(() => this.update(), 1000);
    }

    setupGame() {
        this.game = {
            settings: {
                globalTimer: Date.now() / 1000,
                startTime: Date.now() / 1000,
                runTimer: 0,
                difficulty: 1,
                debug: false
            },
            player: new Player('CR', 
                [new Item(1, "PPSH-41", 1, 1000, { hp: 25 }), new Item(2, "Mabaro Scigar", 10, 1, { hunger: 5, sanity: -10 })],
                { isAlive: true, hp: 1000, hunger: 0, insomnia: 0, sanity: 100 }
            ),
            reactor: {
                 stats: { isAlive: true, integrity: 100, powerOutput: 0, temperature: 25, radiationLevel: 0, coolantLevel: 100, controlRodPosition: 100, turbineSpeed: 0, generatorOutput: 0 },
                 settings: { targetPowerOutput: 500, targetTemperature: 300, targetRadiationLevel: 50, targetCoolantLevel: 80, controlRodAdjustmentRate: 1, coolantFlowRate: 10, turbineAccelerationRate: 100, generatorEfficiency: 0.9 }
            },
            locations: {
                CR: new Room("ControlRoom", "CR", ["A", "B", "BU"], ["A", "B", "BU", "C"], [38, 19], [52, 30], {}, {}),
                 // Define other locations here...
            },
            monsters: [
                new Experiment(0, 0, 2, false, {isAlive:true, hp:10000}, {physical:100}, 'LAB', 'LAB', {holy_water:true, hide:true, physical:true})
            ]
        };
        // Add items to locations
        this.game.locations.CR.items.push(new Item(3, "coffee", 1, 1, { insomnia: -10, sanity: 5 }));
    }
    
    update() {
        this.game.settings.runTimer = (Date.now() / 1000) - this.game.settings.startTime;
        
        if (this.game.player.stats.isAlive) {
            // Update player effects
            this.game.player.effects.forEach(effect => {
                // This logic should be expanded based on the StatusEffect implementation
            });

            // Update monster AI
            this.game.monsters.forEach(monster => {
                monster.update(this.game.player, this.terminal);
            });

            // Check for game over conditions
            if(this.game.player.stats.hp <= 0) {
                this.game.player.stats.isAlive = false;
                this.terminal.print("GAME OVER: You have died.");
                clearInterval(this.gameLoop);
            }
        }
    }

    getCommands() {
        return [
            {
                name: "go",
                description: "Move to a new location. Usage: go [location]",
                execute: (args) => {
                    const targetLocCode = args[0];
                    if (!targetLocCode) {
                        this.terminal.print("Where do you want to go?");
                        return;
                    }

                    const currentLoc = this.game.locations[this.game.player.loc];
                    if (currentLoc.connectedTo.includes(targetLocCode)) {
                        this.game.player.loc = targetLocCode;
                        this.terminal.print(`You move to the ${this.game.locations[targetLocCode].fullName}.`);
                        this.getCommands().find(cmd => cmd.name === 'look').execute();
                    } else {
                        this.terminal.print("You can't go there from here.");
                    }
                }
            },
            {
                name: "look",
                description: "Examine your surroundings.",
                execute: () => {
                    const currentLoc = this.game.locations[this.game.player.loc];
                    this.terminal.print(`You are in the ${currentLoc.fullName}.`);
                    // Add more descriptive text from location object if available
                    
                    if (currentLoc.items.length > 0) {
                         this.terminal.print(`You see: ${currentLoc.items.map(i => i.name).join(", ")}.`);
                    }
                    if (currentLoc.connectedTo.length > 0) {
                        this.terminal.print(`Exits: ${currentLoc.connectedTo.join(", ")}.`);
                    }
                }
            },
            {
                name: "get",
                description: "Pick up an item. Usage: get [item]",
                execute: (args) => {
                    const itemName = args[0];
                    const loc = this.game.locations[this.game.player.loc];
                    const itemIndex = loc.items.findIndex(i => i.name.toLowerCase() === itemName.toLowerCase());
                    if (itemIndex > -1) {
                        const [item] = loc.items.splice(itemIndex, 1);
                        this.game.player.inv.push(item);
                        this.terminal.print(`You picked up the ${item.name}.`);
                    } else {
                        this.terminal.print("You don't see that here.");
                    }
                }
            },
             {
                name: "inv",
                description: "Check your inventory.",
                execute: () => {
                    if (this.game.player.inv.length > 0) {
                        this.terminal.print(`You are carrying: ${this.game.player.inv.map(i => `${i.name} (x${i.count})`).join(", ")}.`);
                    } else {
                        this.terminal.print("You are not carrying anything.");
                    }
                }
            },
            {
                name: "stat",
                description: "Display your current stats.",
                execute: () => {
                    const pStats = this.game.player.stats;
                    this.terminal.print(`HP: ${pStats.hp}, Hunger: ${pStats.hunger}, Sanity: ${pStats.sanity}, Insomnia: ${pStats.insomnia}`);
                }
            },
            {
                name: "help",
                description: "Shows a list of available commands.",
                execute: () => {
                    const commands = this.terminal.commandProcessor.getCommands();
                    this.terminal.print("Available commands:");
                    Object.values(commands).forEach(cmd => {
                        this.terminal.print(`- ${cmd.name}: ${cmd.description || 'No description available.'}`);
                    });
                }
            },
            {
                name: "about",
                description: "About the game.",
                execute: () => {
                     this.terminal.print("Reactor Control Terminal v2.0. Manage the reactor and survive.");
                }
            }
        ];
    }

    // De-init addon
    remove() {
        clearInterval(this.gameLoop);
        this.terminal.print("Reactor Control addon unloaded.");
    }
}
