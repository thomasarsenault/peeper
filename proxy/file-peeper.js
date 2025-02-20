import { promises as fs } from 'fs';
import path from 'path';
import chokidar from 'chokidar';

export class FilePeeper {
    watchPath;
    diffStoragePath;
    watcher;

    constructor(watchPath, storageBasePath) {
        this.watchPath = watchPath;
        this.storageBasePath = storageBasePath;
    }

    async init() {
        await fs.mkdir(this.storageBasePath, { recursive: true });

        this.watcher = chokidar.watch(this.watchPath, {
            ignored: /(^|[\/\\])\../, // ignore hidden files
            persistent: true
        });

        this.watcher.on('change', async filepath => {
            await this.handleFileChange(filepath);
        });
    }

    async handleFileChange(filepath) {
        try {
            const content = await fs.readFile(filepath, 'utf8');
            const fileDir = path.join(
                this.storageBasePath,
                path.basename(filepath)
            );

            await fs.mkdir(fileDir, { recursive: true });

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const versionPath = path.join(
                fileDir,
                `${timestamp}.txt`
            );
            
            await fs.writeFile(versionPath, content);
        } catch (error) {
            console.error('Error saving file version:', error);
        }
    }
}