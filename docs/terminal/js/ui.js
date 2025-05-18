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

export { appendTerminalOutput, appendTerminalSymbol };
