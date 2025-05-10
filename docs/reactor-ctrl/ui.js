// ui.js

function displayMap() {
    // Get the base map lines from gameSettings
    let mapLines = gameSettings.facilityMap.split('\n');
    let finalMapLines = mapLines.map(line => line.split('')); // Create a modifiable copy

    // Find player location and marker
    const playerLocationKey = gameState.playerLocation;
    const playerLocation = gameSettings.locations[playerLocationKey];
    const playerMarker = playerLocation ? playerLocation.mapMarker : null;

    // Find coordinates of the player marker and place '@'
    if (playerMarker) {
        // This logic needs to be adapted to find the marker in the multi-line string
        // and get its line and column.
        // A more robust way might be to store the marker coordinates directly in gameSettings.locations
        // and retrieve them here. For now, we'll use a placeholder logic.

        // *** Placeholder Logic (Needs refinement based on how you store coordinates) ***
        // Assuming you have line and column stored for the player's location marker
        const markerLine = playerLocation.line;    // You need to have line property in gameSettings.locations[location].line
        const markerColumn = playerLocation.column; // You need to have column property in gameSettings.locations[location].column

        if (markerLine !== undefined && markerColumn !== undefined) {
             // Ensure coordinates are within bounds before placing the marker
            if (markerLine >= 0 && markerLine < finalMapLines.length && markerColumn >= 0 && markerColumn < finalMapLines[markerLine].length) {
                 // Place the '@' symbol
                finalMapLines[markerLine][markerColumn] = '@';
            }
        } else {
            console.warn(`Map marker coordinates not found for location: ${playerLocationKey}`);
        }
        // *** End Placeholder Logic ***
    }


    // Join the lines back together and display
    const finalMap = finalMapLines.map(line => line.join('')).join('\n');
    const mapArea = document.getElementById('map-area');
    if (mapArea) {
        mapArea.textContent = finalMap;
    }
}

function appendOutput(message) {
    const outputDiv = document.getElementById('output-area');
    if (outputDiv) {
        const p = document.createElement('p');
        p.textContent = message;
        outputDiv.appendChild(p);
        // Auto-scroll to the bottom
        outputDiv.scrollTop = outputDiv.scrollHeight;
    }
}

// If not using ES6 modules, you might need to make these functions globally accessible
// window.displayMap = displayMap;
// window.appendOutput = appendOutput;

// If using ES6 modules, export them
// export { displayMap, appendOutput };
