import { appendTerminalOutput } from './ui.js';

class file {
    constructor(name, path, type, content) {
        this.name = name;
        this.path = path;
        this.type = type;
        this.content = content;
    }
}

class directory {
    constructor(name, path, files, subdirectories) {
        this.name = name;
        this.path = path;
        this.files = files;
        this.subdirectories = subdirectories;
    }
}

// Dir declaration
const rootDirectory = new directory('', '', [], []); // root dir

const sysDirectory = new directory('C:/', 'C:/', [], []); // sys dir

const dataDirectory = new directory('D:/', 'D:/', [], []); // data dir

// added sub dir of root to root
rootDirectory.subdirectories.push(sysDirectory);
rootDirectory.subdirectories.push(dataDirectory);

// added sub dir of sys to sys
sysDirectory.subdirectories.push(new directory('Program Files', 'C:/Program Files', [], []));
sysDirectory.subdirectories.push(new directory('Users', 'C:/Users', [], []));

const README = new file('README', 'C:/README', 'text', `
hi, if you are reading this you like found this file in the terminal.
I know you ahve so many question as to what or why this is here but the 
    ` )


function handleDirCommand(dir) {
    
}

function handlePwdCommand() {
    appendTerminalOutput('YOU DO NOT HAVE PERMISSION TO DO SO YET');
}

function handleCdCommand(dir) {
    handleDirCommand(dir);
}

function handleLsCommand(dir) {
    handleDirCommand(dir);
}

export {
    handleDirCommand,
    handlePwdCommand,
    handleCdCommand,
    handleLsCommand
}