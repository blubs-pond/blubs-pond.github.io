
// =========================
// filesystem_addon.js
// Loads website-specific files and directories into the VirtualOS.
// =========================

export function loadFileSystemAddon(vOS) {
    // --- Create Website-Specific Directories ---
    vOS.createDirectory('/pages');
    vOS.createDirectory('/documents');
    vOS.createDirectory('/pictures');
    vOS.createDirectory('/pictures/fan-art');
    vOS.createDirectory('/games');

    // --- Add Content Files ---

    // A readme file in the root
    vOS.createFile('/readme.txt', `
Welcome to Blub's Terminal!

This is a simulated terminal environment running on my personal website.
You can use BASH-like commands (ls, cd, cat, etc.) to explore the virtual file system.

Try 'tree /' to see the whole directory structure.
Try 'ls pages' to see available pages.
Type 'open <page-name>' (e.g., 'open fan-art') to navigate to that page.
`);

    // Page files - simple text representations of the main site pages
    vOS.createFile('/pages/index.txt', 'The main page of the website. Contains the portal and latest updates.');
    vOS.createFile('/pages/best-of-blub.txt', 'A collection of the best moments and highlights.');
    vOS.createFile('/pages/fan-art.txt', 'A gallery of amazing fan art. Use 'ls /pictures/fan-art' to see the file list.');
    vOS.createFile('/pages/commissions.txt', 'Information about my commissions. Use 'cat /documents/commissions-info.md' for pricing details.');

    // Document files with more detailed content
    vOS.createFile('/documents/commissions-info.md', `
### Blub's Commissions Info

**Pricing (USD)**
*   Base price for a new render: $250
*   Base price for a pre-made scene (YCH): $75
*   Note: I can modify pre-made scenes for you within reason :3

**Modifiers**
*   If a license is required for your avatar's base model, 50% of the base cost will be added.
*   Allowing the scene to be used for other people's renders gives a $50 discount.

To order, please fill out the ticket form. You can get a template with 'cat /documents/commission-ticket.md'.
    `);

    vOS.createFile('/documents/commission-ticket.md', `
--- Commission Ticket ---

**Fursona / Name:**
**Discord UserName:**

**Commission Type:** (New Render / Pre-made Scene)
**Number of New Models (if applicable):**
**I need a custom texture made (requires ref sheet):** (Yes/No)
**Allow scene to be used for other people's renders (-$50):** (Yes/No)

**Notes/Description:**
`);

    // Picture files - just file names for now
    vOS.createFile('/pictures/fan-art/Minity_fanart.png', '');
    vOS.createFile('/pictures/fan-art/Shiny_blub_by_Drakgaron.png', '');
    vOS.createFile('/pictures/fan-art/Shiny_scared_blub_by_Drakgaron.png', '');
    vOS.createFile('/pictures/JabulbaRender1.png', '');
    
    // --- Add Game Files ---
    vOS.createFile('/games/reactor-ctrl.exe', 'Reactor Control Game Executable');

}
