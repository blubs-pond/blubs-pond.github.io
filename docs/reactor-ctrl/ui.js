function displayMap(state = 'default') {
    let mapLines = gameSettings.facilityMap.split('\n');
    let finalMapLines = mapLines.map(line => line.split('')); // Modifiable 2D array

    // Helper function to place a marker on the map
    const placeMarker = ({ line, column }, marker) => {
        if (
            line >= 0 && line < finalMapLines.length &&
            column >= 0 && column < finalMapLines[line].length
        ) {
            finalMapLines[line][column] = marker;
        }
    };

    // --- Place player marker ---
    const playerLocationKey = gameState.currentLocation || gameState.playerLocation;
    const playerLocation = gameSettings.locations[playerLocationKey];
    if (playerLocation && playerLocation.line !== undefined && playerLocation.column !== undefined) {
        placeMarker({ line: playerLocation.line, column: playerLocation.column }, '@');
    } else if (playerLocation?.mapMarker) {
        // Fallback if only mapMarker string is available, not coordinates
        const markerRegex = new RegExp(escapeRegExp(playerLocation.mapMarker), 'gi');
        for (let i = 0; i < mapLines.length; i++) {
            const match = markerRegex.exec(mapLines[i]);
            if (match) {
                const colIndex = match.index;
                placeMarker({ line: i, column: colIndex }, '@');
                break;
            }
        }
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
    }

    // --- Render final map ---
    const finalMap = finalMapLines.map(line => line.join('')).join('\n');
    const mapArea = document.getElementById('map-area');
    if (mapArea) {
        mapArea.textContent = finalMap;
    } else {
        appendOutput(finalMap);
    }
}

// Helper to safely use RegExp with literal strings
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Fallback output if map-area is not available
function appendOutput(message) {
    const outputDiv = document.getElementById('output-area');
    if (outputDiv) {
        const p = document.createElement('p');
        p.textContent = message;
        outputDiv.appendChild(p);
        outputDiv.scrollTop = outputDiv.scrollHeight;
    }
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