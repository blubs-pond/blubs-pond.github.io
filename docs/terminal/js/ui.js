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

    if (typeof reactorCtrlGameState === 'undefined' || typeof reactorCtrlGameSetting === 'undefined') {
        console.error("gameState or gameSettings not defined!");
        appendOutput("Error: Game data not loaded.");
        return;
    }

    if (typeof reactorCtrlGameSetting.facilityMap !== 'string') {
        console.error("Invalid map data format.");
        appendOutput("Error: Invalid map data.");
        return;
    }

    const mapLines = reactorCtrlGameSetting.facilityMap.split('\n');
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
    const playerLocationKey = reactorCtrlGameState.currentLocation || reactorCtrlGameState.playerLocation;
    const player = reactorCtrlGameSetting.locations?.[playerLocationKey];
    const playerLine = parseInt(player?.line, 10);
    const playerColumn = parseInt(player?.column, 10);
    if (!isNaN(playerLine) && !isNaN(playerColumn)) {
        placeMarker({ line: playerLine, column: playerColumn }, '@');
    } else {
        console.warn(`Invalid player coordinates for location key: ${playerLocationKey}`);
    }

    // --- State-dependent markers ---
    if (['failed', 'show'].includes(state)) {
        for (const id in reactorCtrlGameSetting.failedDevices) {
            placeMarker(reactorCtrlGameSetting.failedDevices[id], 'X');
        }
    }

    if (state === 'players' || state === 'show') {
        for (const name in reactorCtrlGameState.monsters) {
            const pos = reactorCtrlGameState.monsters[name]?.mapPosition;
            if (pos) placeMarker(pos, name[0].toUpperCase());
        }
    }

    if (state === 'show') {
        for (const id in reactorCtrlGameSetting.tasks) {
            placeMarker(reactorCtrlGameSetting.tasks[id], '$');
        }
        for (const id in reactorCtrlGameSetting.machines) {
            placeMarker(reactorCtrlGameSetting.machines[id], '%');
        }
    }

    const finalMap = finalMapLines.map(line => line.join('')).join('\n');
    mapArea.textContent = finalMap;
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

export { appendTerminalOutput, appendTerminalSymbol, appendTerminalHTML, escapeRegExp, appendOutput, displayMap, updateUI, frog };