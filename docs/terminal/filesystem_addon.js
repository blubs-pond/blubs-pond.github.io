
import { Addon } from '@clockworksproduction-studio/cwp-open-terminal-emulator';

export class FileSystemAddon extends Addon {
    constructor() {
        super('FileSystemLoader');
    }

    async onStart() {
        const vOS = this.term.vOS;

        try {
            const response = await fetch('./js/file-system.json');
            if (!response.ok) {
                throw new Error(`Failed to fetch file-system.json: ${response.statusText}`);
            }
            const fileData = await response.json();

            vOS.clear();

            for (const path in fileData) {
                const fileInfo = fileData[path];
                if (fileInfo.type === 'file') {
                    const content = fileInfo.ftype === 'link' ? `LINK: ${fileInfo.content}` : fileInfo.content;
                    vOS.writeFile(path, content);
                }
            }
            
            this.term._print("\nCustom file system loaded successfully.\n");

        } catch (error) {
            console.error("FileSystemAddon Error:", error);
            this.term._print(`\n<span style="color: #ff4d4d;">Error loading custom file system: ${error.message}</span>\n`);
        }
    }
}
