function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&\'');
}

function appendOutput(text) {
    const outputArea = document.getElementById('output-area');
    if (outputArea) {
        outputArea.innerHTML += `<p>${text}</p>`;
        // Scroll to the bottom
        outputArea.scrollTop = outputArea.scrollHeight;
    } else {
        console.error("Output area element not found!");
    }
}

function displayMap(state = 'default') {
    const mapArea = document.getElementById('map-area');
    if (!mapArea) {
        console.error("Map area element not found!");
        appendOutput("Error: Map display area not found."); // Fallback message in output
        return; // Stop execution if the map area isn't available
    }

    // Ensure gameState and gameSettings are loaded
    if (typeof gameState === 'undefined' || typeof gameSettings === 'undefined') {
        console.error("gameState or gameSettings not loaded!");
        appendOutput("Error: Game data not loaded to display map.");
        return;
    }

    // Ensure facilityMap exists and is a string
    if (typeof gameSettings.facilityMap !== 'string') {
        console.error("gameSettings.facilityMap is not a string!");
        appendOutput("Error: Invalid map data.");
        return;
    }

    let mapLines = gameSettings.facilityMap.split('\n');
    // Create a deep copy of mapLines to modify without affecting the original gameSettings
    let finalMapLines = mapLines.map(line => line.split('')); 

    // Helper function to place a marker on the map
    const placeMarker = ({ line, column }, marker) => {
        if (
            line >= 0 && line < finalMapLines.length &&
            column >= 0 && column < finalMapLines[line].length
        ) {
            finalMapLines[line][column] = marker;
        }
    };

    // --- Place player marker using coordinates ---
    const playerLocationKey = gameState.currentLocation || gameState.playerLocation;
    const playerLocation = gameSettings.locations?.[playerLocationKey]; // Use optional chaining

    // --- Place player marker using coordinates ---
    const playerLine = parseInt(playerLocation?.line, 10);
    const playerColumn = parseInt(playerLocation?.column, 10);

    if (!isNaN(playerLine) && !isNaN(playerColumn)) {
        placeMarker({ line: playerLine, column: playerColumn }, '@');
    } else {
        console.warn(`Invalid or missing numeric coordinates for player location: ${playerLocationKey}. Skipping player marker placement.`);
    }

    // --- Handle different display states ---
    switch (state) {
        case 'failed':
            for (const deviceId in gameSettings.failedDevices) {
                placeMarker(gameSettings.failedDevices[deviceId], 'X');
            }
            break;

        case 'players':
            for (const monsterName in gameState.monsters) {
                const monster = gameState.monsters[monsterName];
                if (monster.mapPosition) {
                    placeMarker(monster.mapPosition, monsterName[0].toUpperCase());
                }
            }
            break;

        case 'show':
            for (const taskId in gameSettings.tasks) {
                placeMarker(gameSettings.tasks[taskId], '$');
            }
            for (const machineId in gameSettings.machines) {
                placeMarker(gameSettings.machines[machineId], '%');
            }
            for (const deviceId in gameSettings.failedDevices) {
                placeMarker(gameSettings.failedDevices[deviceId], 'X');
            }
            for (const monsterName in gameState.monsters) {
                const monster = gameState.monsters[monsterName];
                if (monster.mapPosition) {
                    placeMarker(monster.mapPosition, monsterName[0].toUpperCase());
                }
            }
            break;

        case 'default':
        default:
            // No extra markers needed
            break;
        } // Added missing closing curly brace for switch

    // --- Render final map ---
    const finalMap = finalMapLines.map(line => line.join('')).join('\n');
    mapArea.textContent = finalMap; // Display the map in the dedicated area
}

// Function to update the UI elements
function updateUI() {
    const inGameTimeElement = document.getElementById('inGameTime');
    if (inGameTimeElement) {
        inGameTimeElement.textContent = `${String(gameState.gameTime.hours).padStart(2, '0')}:${String(gameState.gameTime.minutes).padStart(2, '0')}`;
    }

    // TODO: Update other UI elements like player money, inventory, stats, etc.
    const playerMoneyElement = document.getElementById('playerMoney');
    if (playerMoneyElement) {
        playerMoneyElement.textContent = `$${gameState.playerMoney.toFixed(2)}`;
    }
    // Add updates for other new variables here
    // Example: document.getElementById('hungerLevel').textContent = gameState.hungerLevel.toFixed(1);
}