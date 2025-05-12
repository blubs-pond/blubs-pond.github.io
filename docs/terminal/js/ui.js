export function appendTerminalOutput(message) {
    const terminalOutput = document.getElementById('terminalOutput');
    const p = document.createElement('p');
    p.textContent = message;
    terminalOutput.appendChild(p);
}
