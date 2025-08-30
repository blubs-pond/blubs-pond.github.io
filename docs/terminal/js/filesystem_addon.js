
// =========================
// filesystem_addon.js
// Loads the original file and directory structure from dir.js into the VirtualOS.
// This version uses the correct relative paths for images based on the new file structure.
// =========================

export function loadFileSystemAddon(vOS) {
    // --- Create the directory structure ---
    vOS.createDirectory('/C/Program Files/game/reactor-ctrl');
    vOS.createDirectory('/C/Users/Blub/Homework');
    vOS.createDirectory('/C/Users/CWPStudio');
    vOS.createDirectory('/C/Users/ClassyDestroyer/Pictures');
    vOS.createDirectory('/C/Users/Minty');
    vOS.createDirectory('/C/Users/Rune');
    vOS.createDirectory('/C/Users/Philo');
    vOS.createDirectory('/D/Audio');

    // --- Add files with their specific types and corrected paths ---

    // Reactor executable
    vOS.createFile('/C/Program Files/game/reactor-ctrl/reactor.exe', 'reactor', 'exe');

    // Blub's files
    vOS.createFile('/C/Users/Blub/Homework/secret.md', 'DO NOT OPEN 𓆏', 'text');
    // Corrected path: relative from /terminal/index.html
    vOS.createFile('/C/Users/Blub/Homework/DoNotOpen.png', 'js/ref/Shiny_scared_blub.png', 'image');
    vOS.createFile('/C/Users/Blub/Homework/TODO', `
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

    // ClassyDestroyer's files
    // Corrected path: relative from /terminal/index.html
    vOS.createFile('/C/Users/ClassyDestroyer/Pictures/MnM.jpg', 'js/ref/MnM.jpg', 'image');

    // README file
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
Blubs' TODO list    - Philo
Terminal            - CWP Studio
---------------------------------------------
`, 'text');

    // Audio file path needs to go up from /docs/terminal/ to the root, then into /untitled.wav
    // Let's assume untitled.wav is in the project root with docs. So we go up two levels.
    vOS.createFile('/D/Audio/awa.wav', '../../untitled.wav', 'audio');
}
