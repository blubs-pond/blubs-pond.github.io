function appendTerminalOutput(message) {
    const terminalOutput = document.getElementById('terminalOutput');
    const p = document.createElement('p');
    p.textContent = message;
    terminalOutput.appendChild(p);
}

function appendTerminalSymbol(message) {
    const terminalSymbol = document.getElementById('terminal-prompt-symbol');
    const p = document.createElement('p');
    p.textContent = message;
    terminalSymbol.replaceChildren(p);
}

function appendTerminalHTML(html) {
    const terminalOutput = document.getElementById("terminalOutput");
    const container = document.createElement("div");
    container.innerHTML = html;
    terminalOutput.appendChild(container);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function appendOutput(text) {
    const outputArea = document.getElementById('terminalOutput');
    if (!outputArea) {
        console.error("Output area not found!");
        return;
    }
    outputArea.innerHTML += `<p>${text}</p>`;
    outputArea.scrollTop = outputArea.scrollHeight;
}

function displayMap(gameState, gameSettings, state = 'default') {
    // console.log("displayMap gameSettings:", gameSettings);
    const mapArea = document.getElementById('map-area');
    if (!mapArea) {
        console.error("Map area not found!");
        appendOutput("Error: Map display area not found.");
        return;
    }
 mapArea.style.display = 'block';

    if (typeof gameState === 'undefined' || typeof gameSettings.locations === 'undefined' || typeof gameSettings.facilityMapString === 'undefined') { // Added check for facilityMapString
        console.error("gameState or gameSettings not defined!");
        appendOutput("Error: Game data not loaded.");
        return;
    }    

    if (typeof gameSettings.facilityMapString !== 'string') {
        console.error("Invalid map data format.");
        appendOutput("Error: Invalid map data.");
        return;
    }

    const mapLines = gameSettings.facilityMapString.split('\n').map(line => line.trim());
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
    const playerLocationKey = gameState.currentLocation || gameState.player.location;
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
        for (const id in gameState.failedDevices) {
            console.log("Placing failed device marker:", id);
            placeMarker(gameState.failedDevices[id], 'X');
        }
    }

    if (state === 'players' || state === 'show') {
        for (const name in gameState.monsters) {
            console.log("Checking monster for map display:", name);
            const pos = gameState.monsters[name]?.mapPosition;
            if (pos) placeMarker({ line: pos[0], column: pos[1] }, name[0].toUpperCase()); // Changed to use gameState.monsters and correct coordinate passing
        }
    }

    if (state === 'show') {
        for (const id in gameState.tasks) {
            console.log("Placing task marker:", id);
            placeMarker(gameState.tasks[id], '$');
        }
        for (const id in gameState.machines) { // Changed to use gameState.machines
            console.log("Placing machine marker:", id);
            placeMarker(gameState.machines[id], '%');
        }
    }

    const finalMap = finalMapLines.map(line => line.join('')).join('\n');
    // console.log("Final map:", finalMap);
    mapArea.textContent = finalMap;
}

function updateGameUI(gameId) {
    const statBar = document.getElementById('stat-bar'); // Assuming stat-bar is the id for the status bar
    const mapArea = document.getElementById('map-area');

    const displayStyle = (gameId === 'reactor-ctrl') ? 'block' : 'none';

    if (statBar) statBar.style.display = displayStyle;
    if (mapArea) mapArea.style.display = displayStyle;
}

function updateUI() {
    const { gameTime, playerMoney } = reactorCtrlGameState;

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

let frogClick = 0;

function frog() {
    frogClick++;
    appendTerminalOutput(`frog clicked ${frogClick} times`);
}

export { appendTerminalOutput, appendTerminalSymbol, appendTerminalHTML, escapeRegExp, appendOutput, displayMap, updateUI, frog, updateGameUI };