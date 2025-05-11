export function appendOutput(message) {
    const outputArea = document.getElementById('output-area');
    const p = document.createElement('p');
    p.textContent = message;
    outputArea.appendChild(p);
}
