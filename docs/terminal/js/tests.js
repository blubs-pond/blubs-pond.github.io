import * as ui from './ui.js';
import * as cmd from './cmd.js';
import { fileSystem, currentDir } from './dir.js';
import * as r_ctrl from './games/reactor-ctrl/reactor-ctrl-module.js';
import {
 handlePwdCommand, handleCdCommand, handleLsCommand, handleTreeCommand,
 runCommand, playCommand, openCommand
} from './dir.js';
// Destructure commonly used functions and variables for easier access
const { appendTerminalOutput } = ui;
const {
    clearTerminal, echoCommand, getDateTime, catCommand, historyCommand,
    handleCmdHelpCommand, handleExitCommand, currentGame, isDevMode
} = cmd;
// Directory related functions are in dir.js now


function testClearTerminal() {
    const terminalOutput = document.getElementById('terminalOutput');
    // Add some content to the terminal output
    appendTerminalOutput("Line 1");
    appendTerminalOutput("Line 2");

    clearTerminal(); // Call the function to clear the terminal

    // Assert that the terminal output is empty
    console.assert(terminalOutput.innerHTML === '', 'testClearTerminal: terminalOutput should be empty after clearTerminal.');
}

function testEchoCommand() {
    const terminalOutput = document.getElementById('terminalOutput');
    const testArgs = ['hello', 'world'];
    echoCommand(testArgs); // Call the echoCommand function

    // Get the text content of the last paragraph added to the terminal output
    const lastOutput = terminalOutput.lastElementChild;
    console.assert(lastOutput && lastOutput.textContent === 'hello world', `testEchoCommand: Expected 'hello world', but got '${lastOutput ? lastOutput.textContent : 'no output'}'.`);
}

function testGetDateTime() {
    const terminalOutput = document.getElementById('terminalOutput');
    const initialOutputCount = terminalOutput.children.length;

    getDateTime(); // Call the getDateTime function

    // Check if two lines (Date and Time) were added
    console.assert(terminalOutput.children.length === initialOutputCount + 2, 'testGetDateTime: Should add two lines to terminal output.');

    // Basic check on the content format (doesn't validate the actual date/time)
    const timeLine = terminalOutput.lastElementChild;
    const dateLine = timeLine.previousElementSibling;
    console.assert(dateLine && dateLine.textContent.startsWith('Date:'), 'testGetDateTime: First line should start with "Date:".');
    console.assert(timeLine && timeLine.textContent.startsWith('Time:'), 'testGetDateTime: Second line should start with "Time:".');
}

function testCatCommand() {
    const terminalOutput = document.getElementById('terminalOutput');
    const initialOutputCount = terminalOutput.children.length;

    catCommand([]); // catCommand doesn't use args currently

    console.assert(terminalOutput.children.length === initialOutputCount + 1, 'testCatCommand: Should add one line to terminal output.');
    const lastOutput = terminalOutput.lastElementChild;
    console.assert(lastOutput && lastOutput.textContent === 'YOU DO NOT HAVE PERMISSION TO DO SO YET', 'testCatCommand: Output should be "YOU DO NOT HAVE PERMISSION TO DO SO YET".');
}

function testHistoryCommand() {
    // This test is basic and assumes some commands are in history
    // A more robust test would involve manipulating commandHistory directly
    const terminalOutput = document.getElementById('terminalOutput');
    const initialOutputCount = terminalOutput.children.length;

    // Add some dummy commands to history for testing
    const originalCommandHistory = [...cmd.commandHistory]; // Backup original history

    historyCommand([]); // Test showing history
    console.assert(terminalOutput.children.length > initialOutputCount, 'testHistoryCommand: Should add history lines to terminal output.');

    // Clean up history
    cmd.commandHistory.length = 0;
    commandHistory.push(...originalCommandHistory); // Restore original history

    // Note: Testing history execution (!<number>) requires more complex mocking
}

function testHandleCmdHelpCommand() {
    const terminalOutput = document.getElementById('terminalOutput');
    const initialOutputCount = terminalOutput.children.length;

    handleCmdHelpCommand([]); // help command doesn't use args currently

    console.assert(terminalOutput.children.length > initialOutputCount, 'testHandleCmdHelpCommand: Should add help lines to terminal output.');
    const lastOutput = terminalOutput.lastElementChild;
    console.assert(lastOutput && lastOutput.textContent.startsWith('-'), 'testHandleCmdHelpCommand: Help output lines should start with "-".');
}

// Basic file system command tests - these require mocking fileSystem and currentDir for robust testing
function testHandlePwdCommand() {
    const terminalOutput = document.getElementById('terminalOutput');
    const initialOutputCount = terminalOutput.children.length;

    const originalCurrentDirPath = currentDir.path;
    currentDir.path = '/test/path'; // Set a mock path

    handlePwdCommand([]);

    console.assert(terminalOutput.children.length === initialOutputCount + 1, 'testHandlePwdCommand: Should add one line to terminal output.');
    const lastOutput = terminalOutput.lastElementChild;
    console.assert(lastOutput && lastOutput.textContent === '/test/path', `testHandlePwdCommand: Expected path '/test/path', got '${lastOutput ? lastOutput.textContent : 'no output'}'.`);

    currentDir.path = originalCurrentDirPath; // Restore original path
}

function testHandleLsCommand() {
    // This is a very basic test; a proper test would mock fileSystem
    const terminalOutput = document.getElementById('terminalOutput');
    const initialOutputCount = terminalOutput.children.length;

    handleLsCommand([]);

    // Check if at least one line of output was added (assuming the root has content)
    console.assert(terminalOutput.children.length > initialOutputCount, 'testHandleLsCommand: Should add output lines for directory contents.');
}

function testHandleCdCommand() {
    const originalCurrentDir = { ...currentDir }; // Backup original currentDir
    const originalFileSystem = { ...fileSystem }; // Backup original fileSystem (shallow copy)

    // Add a mock directory for testing
    fileSystem['/'].testdir = { type: 'dir', content: {} };

    // Test changing to a valid directory
    handleCdCommand(['testdir']);
    console.assert(currentDir === fileSystem['/'].testdir.content, 'testHandleCdCommand: Should change directory to "testdir".');
    console.assert(currentDir.path === '/testdir', 'testHandleCdCommand: Path should be updated to "/testdir".');

    // Test changing back to parent directory
    handleCdCommand(['..']);
    console.assert(currentDir === fileSystem['/'].content, 'testHandleCdCommand: Should change back to root directory.');
    console.assert(currentDir.path === '/', 'testHandleCdCommand: Path should be updated to "/".');

    // Test changing to a non-existent directory
    const initialOutputCount = document.getElementById('terminalOutput').children.length;
    handleCdCommand(['nonexistent']);
    console.assert(document.getElementById('terminalOutput').children.length === initialOutputCount + 1, 'testHandleCdCommand: Should output an error message for nonexistent directory.');

    // Restore original fileSystem and currentDir
    // Note: Deep copying and restoring complex objects like fileSystem can be tricky in hardcoded tests
    Object.assign(fileSystem, originalFileSystem);
    Object.assign(currentDir, originalCurrentDir);
}

function testHandleTreeCommand() {
    // This is a very basic test; a proper test would mock fileSystem
    const terminalOutput = document.getElementById('terminalOutput');
    const initialOutputCount = terminalOutput.children.length;

    handleTreeCommand([]);

    // Check if at least one line of output was added (assuming the file system is not empty)
    console.assert(terminalOutput.children.length > initialOutputCount, 'testHandleTreeCommand: Should add output lines for the file system tree.');
}

function testRunCommand() {
    // Testing runCommand requires mocking the execution of files, which is complex
    console.log("testRunCommand: Manual testing required to verify file execution.");
    // A basic check might be to see if it attempts to append output for "Running file..."
    // but this is unreliable without mocking
}

function testPlayCommand() {
    // Testing playCommand requires mocking audio playback or file handling, which is complex
    console.log("testPlayCommand: Manual testing required to verify audio playback.");
    // Similar to runCommand, a basic check might be unreliable
}

function testOpenCommand() {
    // Testing openCommand requires mocking window.open or link creation, which is complex
    console.log("testOpenCommand: Manual testing required to verify link opening.");
    // A basic check might be to see if it attempts to append output for "Opening..."
    // but this is unreliable without mocking
}

function testHandleExitCommand() {
    // Testing window.location.href changes directly in unit tests is problematic.
    // You would typically mock window.location.href in a testing framework.
    console.log("testHandleExitCommand: Manual testing required to verify navigation.");
    // You could add a simple check here if the function is called during manual testing
    // console.assert(true, "testHandleExitCommand: Function was called (requires manual verification of navigation).");
}

function runTests() {
    appendTerminalOutput("Running basic tests...");
    testClearTerminal(); // Call the test function
    testEchoCommand(); // Call the echo test function
    testGetDateTime();
    testCatCommand();
    testHistoryCommand();
    testHandleCmdHelpCommand();
    testHandlePwdCommand();
    testHandleLsCommand();
    testHandleCdCommand();
    testHandleTreeCommand();
    testRunCommand();
    testPlayCommand();
    testOpenCommand();
    testHandleExitCommand();
}

export{
    runTests
}