function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function appendOutput(text) {
    const outputArea = document.getElementById('output-area');
    if (!outputArea) {
        console.error("Output area not found!");
        return;
    }
    outputArea.innerHTML += `<p>${text}</p>`;
    outputArea.scrollTop = outputArea.scrollHeight;
}

function displayMap(state = 'default') {
    const mapArea = document.getElementById('map-area');
    if (!mapArea) {
        console.error("Map area not found!");
        appendOutput("Error: Map display area not found.");
        return;
    }

    if (typeof gameState === 'undefined' || typeof gameSettings === 'undefined') {
        console.error("gameState or gameSettings not defined!");
        appendOutput("Error: Game data not loaded.");
        return;
    }

    if (typeof gameSettings.facilityMap !== 'string') {
        console.error("Invalid map data format.");
        appendOutput("Error: Invalid map data.");
        return;
    }

    const mapLines = gameSettings.facilityMap.split('\n');
    const finalMapLines = mapLines.map(line => line.split(''));

    const placeMarker = ({ line, column }, marker) => {
        if (
            Number.isInteger(line) &&
            Number.isInteger(column) &&
            finalMapLines[line]?.[column] !== undefined
        ) {
            finalMapLines[line][column] = marker;
        }
    };

    // --- Player marker ---
    const playerLocationKey = gameState.currentLocation || gameState.playerLocation;
    const player = gameSettings.locations?.[playerLocationKey];
    const playerLine = parseInt(player?.line, 10);
    const playerColumn = parseInt(player?.column, 10);
    if (!isNaN(playerLine) && !isNaN(playerColumn)) {
        placeMarker({ line: playerLine, column: playerColumn }, '@');
    } else {
        console.warn(`Invalid player coordinates for location key: ${playerLocationKey}`);
    }

    // --- State-dependent markers ---
    if (['failed', 'show'].includes(state)) {
        for (const id in gameSettings.failedDevices) {
            placeMarker(gameSettings.failedDevices[id], 'X');
        }
    }

    if (state === 'players' || state === 'show') {
        for (const name in gameState.monsters) {
            const pos = gameState.monsters[name]?.mapPosition;
            if (pos) placeMarker(pos, name[0].toUpperCase());
        }
    }

    if (state === 'show') {
        for (const id in gameSettings.tasks) {
            placeMarker(gameSettings.tasks[id], '$');
        }
        for (const id in gameSettings.machines) {
            placeMarker(gameSettings.machines[id], '%');
        }
    }

    const finalMap = finalMapLines.map(line => line.join('')).join('\n');
    mapArea.textContent = finalMap;
}

function updateUI() {
    const { gameTime, playerMoney } = gameState;

    const inGameTimeElement = document.getElementById('inGameTime');
    if (inGameTimeElement && gameTime) {
        inGameTimeElement.textContent = `${String(gameTime.hours).padStart(2, '0')}:${String(gameTime.minutes).padStart(2, '0')}`;
    }

    const playerMoneyElement = document.getElementById('playerMoney');
    if (playerMoneyElement && typeof playerMoney === 'number') {
        playerMoneyElement.textContent = `$${playerMoney.toFixed(2)}`;
    }

    // TODO: Add more UI updates here as gameState evolves
}
