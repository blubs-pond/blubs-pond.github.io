
    go(args) {
        const loc = args[0];
        if (this.game.rooms[loc]) {
            if (this.game.rooms[loc].status === "safe") {
                this.game.player.loc = loc;
                this.term.print(`You move to the ${loc}.`);
                if (this.game.rooms[loc].items.length > 0) {
                    this.term.print(`You see the following items: ${this.game.rooms[loc].items.map(i => i.name).join(", ")}.`);
                }
                if (this.game.rooms[loc].fire && this.game.rooms[loc].fire.size > 0) {
                    this.term.print(`There is a fire here! You need to put it out quickly!`);
                    this.game.rooms[loc].status = "on fire";
                }
            } else if (this.game.rooms[loc].status === "on fire") {
                this.term.print(`The ${loc} is on fire! You can't go there until the fire is out!`);
            } else if (this.game.rooms[loc].status === "locked") {
                this.term.print(`The ${loc} is locked! You can't go there until you unlock it!`);
            } else {
                this.term.print(`You can't go to the ${loc} right now.`);
            }
        } else {
            this.term.print(`There is no location named ${loc}.`);
        }
    }

    get(args) {
        const obj = args[0];
        const amount = parseInt(args[1] || "1");
        const itemIndex = this.game.rooms[this.game.player.loc].items.findIndex(i => i.name === obj);
        if (itemIndex !== -1) {
            const item = this.game.rooms[this.game.player.loc].items[itemIndex];
            if (item.count >= amount) {
                item.count -= amount;
                const invItemIndex = this.game.player.inv.items.findIndex(i => i.name === obj);
                if (invItemIndex !== -1) {
                    this.game.player.inv.items[invItemIndex].count += amount;
                } else {
                    this.game.player.inv.add(new Item(item.id, item.name, amount, item.durability, item.dmg));
                }
                this.term.print(`You pick up ${amount} ${obj}(s).`);
                if (item.count === 0) {
                    this.game.rooms[this.game.player.loc].items.splice(itemIndex, 1);
                }
            } else {
                this.term.print(`There are not enough ${obj}(s) here to pick up.`);
            }
        } else {
            this.term.print(`There is no ${obj} here to pick up.`);
        }
    }

    drop(args) {
        const obj = args[0];
        const amount = parseInt(args[1] || "1");
        const invItemIndex = this.game.player.inv.items.findIndex(i => i.name === obj);
        if (invItemIndex !== -1) {
            const item = this.game.player.inv.items[invItemIndex];
            if (item.count >= amount) {
                item.count -= amount;
                const roomItemIndex = this.game.rooms[this.game.player.loc].items.findIndex(i => i.name === obj);
                if (roomItemIndex !== -1) {
                    this.game.rooms[this.game.player.loc].items[roomItemIndex].count += amount;
                } else {
                    this.game.rooms[this.game.player.loc].items.push(new Item(item.id, item.name, amount, item.durability, item.dmg));
                }
                this.term.print(`You drop ${amount} ${obj}(s).`);
                if (item.count === 0) {
                    this.game.player.inv.items.splice(invItemIndex, 1);
                }
            } else {
                this.term.print(`You don't have enough ${obj}(s) to drop.`);
            }
        } else {
            this.term.print(`You don't have any ${obj} to drop.`);
        }
    }

    use(args) {
        const obj = args[0];
        const target = args[1];
        if (obj === "fire extinguisher" && target === "fire") {
            if (this.game.rooms[this.game.player.loc].fire && this.game.rooms[this.game.player.loc].fire.size > 0) {
                this.game.rooms[this.game.player.loc].fire.size -= 1;
                this.term.print("You use the fire extinguisher to put out some of the fire.");
                if (this.game.rooms[this.game.player.loc].fire.size === 0) {
                    this.term.print("The fire is completely out.");
                    this.game.rooms[this.game.player.loc].status = "safe";
                }
            } else {
                this.term.print("There is no fire to put out.");
            }
        } else if (obj === "fire extinguisher" && target !== "fire") {
            this.term.print("You can't use the fire extinguisher on that.");
        } else {
            this.term.print("You can't use that.");
        }
    }

    look() {
        const loc = this.game.player.loc;
        this.term.print(`You are in the ${loc}.`);
        this.term.print(this.game.rooms[loc].desc);
        if (this.game.rooms[loc].items.length > 0) {
            this.term.print(`You see the following items: ${this.game.rooms[loc].items.map(i => i.name).join(", ")}.`);
        }
        if (this.game.rooms[loc].fire && this.game.rooms[loc].fire.size > 0) {
            this.term.print(`There is a fire here! You need to put it out quickly!`);
            this.game.rooms[loc].status = "on fire";
        }
        if (this.game.rooms[loc].exits.length > 0) {
            this.term.print(`Exits: ${this.game.rooms[loc].exits.join(", ")}.`);
        }
        if (this.game.rooms[loc].monsters.length > 0) {
            this.term.print(`You see the following creatures: ${this.game.rooms[loc].monsters.map(m => m.name).join(", ")}.`);
        }
    }

    inv() {
        if (this.game.player.inv.items.length > 0) {
            this.term.print(`You are carrying: ${this.game.player.inv.items.map(i => `${i.name} (x${i.count})`).join(", ")}.`);
        } else {
            this.term.print("You are not carrying anything.");
        }
    }

    exam(args) {
        this.term.print("You examine your surroundings carefully, but find nothing unusual.");
    }

    help(args) {
        this.term.print("\n        TODO added the help text\n        ");
    }

    fix(args) {
        const obj = args[0];
        this.term.print(`You attempt to fix the ${obj}, but realize you need proper tools and knowledge to do so.`);
    }

    reboot(args) {
        const obj = args[0];
        this.term.print(`You attempt to reboot the ${obj}, but it seems to be functioning normally.`);
    }

    stat() {
        this.term.print(`Player Stats:\nHP: ${this.game.player.stats.hp}\nHunger: ${this.game.player.stats.hunger}\nInsomnia: ${this.game.player.stats.insomnia}\nSanity: ${this.game.player.stats.sanity}`);
    }

    upgrade(args) {
        this.term.print("You look around for upgrade options, but find none available at the moment.");
    }

    peak(args) {
        const loc = args[0];
        if (this.game.rooms[loc]) {
            this.term.print(`You peek into the ${loc}.`);
            this.term.print(this.game.rooms[loc].desc);
            if (this.game.rooms[loc].items.length > 0) {
                this.term.print(`You see the following items: ${this.game.rooms[loc].items.map(i => i.name).join(", ")}.`);
            }
            if (this.game.rooms[loc].fire && this.game.rooms[loc].fire.size > 0) {
                this.term.print(`There is a fire there! You need to put it out quickly!`);
                this.game.rooms[loc].status = "on fire";
            }
            if (this.game.rooms[loc].exits.length > 0) {
                this.term.print(`Exits: ${this.game.rooms[loc].exits.join(", ")}.`);
            }
            if (this.game.rooms[loc].monsters.length > 0) {
                this.term.print(`You see the following creatures: ${this.game.rooms[loc].monsters.map(m => m.name).join(", ")}.`);
            }
        } else {
            this.term.print(`There is no location named ${loc}.`);
        }
    }

    cam(args) {
        const num = args[0];
        if (this.game.cameras[num]) {
            this.term.print(`You access camera ${num}.`);
            this.term.print(this.game.cameras[num].desc);
            if (this.game.cameras[num].status === "offline") {
                this.term.print("The camera is currently offline.");
            } else {
                this.term.print("The camera feed is live.");
            }
        } else {
            this.term.print(`There is no camera numbered ${num}.`);
        }
    }

    about() {
        this.term.print("Reactor Control Terminal v1.0. Manage the reactor and ensure safety protocols are followed.");
    }

    settings(args) {
        const opt = args[0];
        const arg = args.slice(1);
        if (opt === "volume") {
            const vol = parseInt(arg[0]);
            if (!isNaN(vol) && vol >= 0 && vol <= 100) {
                this.game.settings.volume = vol;
                this.term.print(`Volume set to ${vol}%.`);
            } else {
                this.term.print("Invalid volume level. Please specify a value between 0 and 100.");
            }
        } else if (opt === "difficulty") {
            const diff = arg[0].toLowerCase();
            if (["easy", "normal", "hard"].includes(diff)) {
                this.game.settings.difficulty = diff;
                this.term.print(`Difficulty set to ${diff}.`);
            } else {
                this.term.print("Invalid difficulty level. Please choose 'easy', 'normal', or 'hard'.");
            }
        } else {
            this.term.print("Unknown setting option.");
        }
    }

    hide() {
        this.term.print("You find a safe spot to hide and wait for any danger to pass.");
    }
