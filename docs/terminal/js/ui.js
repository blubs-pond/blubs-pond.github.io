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

export { appendTerminalOutput, appendTerminalSymbol, appendTerminalHTML };
