
export async function getHierarchicalFileSystem() {
    const response = await fetch('./js/file-system.json');
    const flatData = await response.json();

    const root = {
        kind: 'directory',
        children: {} 
    };

    for (const path in flatData) {
        const parts = path.split('/').filter(p => p.length > 0);
        let currentNode = root;

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const isLast = i === parts.length - 1;

            if (isLast) {
                const fileInfo = flatData[path];
                const content = fileInfo.ftype === 'link' ? `LINK: ${fileInfo.content}` : fileInfo.content;
                currentNode.children[part] = {
                    kind: 'file',
                    content: content
                };
            } else {
                if (!currentNode.children[part]) {
                    currentNode.children[part] = {
                        kind: 'directory',
                        children: {}
                    };
                }
                currentNode = currentNode.children[part];
            }
        }
    }
    return root;
}
