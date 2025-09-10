
import { Addon } from './lib/index.js';

/**
 * ==========================
 * FileSystemAddon.js
 * An addon to populate the virtual file system.
 * ==========================
 */

export class FileSystemAddon extends Addon {
    constructor() {
        super();
        this.name = "FileSystem";
    }

    init(terminal) {
        super.init(terminal);
        const vOS = this.terminal.vfs;

        // Program Files
        vOS.createDirectory('/C/Program Files/game');
        vOS.createDirectory('/C/Program Files/game/reactor-ctrl');
        vOS.createFile('/C/Program Files/game/reactor-ctrl/reactor.exe', 'reactor', 'exe');

        // User Directories
        vOS.createDirectory('/C/Users/Blub');
        vOS.createDirectory('/C/Users/Blub/Homework');
        vOS.createDirectory('/C/Users/CWPStudio');
        vOS.createDirectory('/C/Users/ClassyDestroyer');
        vOS.createDirectory('/C/Users/ClassyDestroyer/Pictures');
        vOS.createDirectory('/C/Users/Minty');
        vOS.createDirectory('/C/Users/Rune');
        vOS.createDirectory('/C/Users/Philo');

        // User Files
        vOS.createFile('/C/README', `
------------ Blubs Pond Terminal -------------

--------- About Blubs Pond Terminal ----------
Started on 9 May 2025

Created for twitch.tv/blubbyblubfish
Created by CWP Studio & blubbyblubfish Mods

=============================================

--- Contributors of Blubs Pond & Terminal ---

------------- Main Contributors -------------
Commission Art      - Blubby Blub Fish
Code & Moderating   - ClassyDestroyer
Code & CLI + Game   - CWP Studio
(1st) Fan Art       - Minty

---------- Suggestion Contributors ----------
"awa" button        - Rune
Homework folder     - ClassyDestroyer
bob the frog        - Blubby Blub Fish
Blubs\' TODO list    - Philo
Terminal            - CWP Studio
---------------------------------------------
`);
        vOS.createFile('/C/Users/Blub/Homework/secret.md', 'DO NOT OPEN 𓆏', 'text');
        vOS.createFile('/C/Users/Blub/Homework/DoNotOpen.png', './js/ref/Shiny_scared_blub.png', 'image');
        vOS.createFile('/C/Users/Blub/Homework/QUOTE',`THAT NOT MY MANKINI (a big LIE)`, 'text');
        vOS.createFile('/C/Users/Blub/Homework/TODO',`
--- TODO ---
Yearly Shower

Years   Status
2020    Done
2021    Done
2022    Done
2023    Pending
2024    Pending
2025    Not Started
`, 'text');
        vOS.createFile('/C/Users/ClassyDestroyer/Pictures/MnM.jpg', './js/ref/MnM.jpg', 'image');

        // Data Drive
        vOS.createDirectory('/D/Audio');
        vOS.createFile('/D/Audio/awa.wav', '../assets/awa.wav', 'audio');
        
        this.terminal.print("File system populated.");
    }

    getCommands() {
        // This addon provides no commands.
        return [];
    }
}
