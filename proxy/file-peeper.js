import { promises as fs } from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import ignore from 'ignore';

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

        // Load ignore patterns from .peeperignore file
        const ig = ignore();
        try {
            const ignorePath = path.join(this.watchPath, '.peeperignore');
            const ignoreFile = await fs.readFile(ignorePath, 'utf8');
            ig.add(ignoreFile);
        } catch (error) {
            // If no .peeperignore file exists, use default patterns
            ig.add([
                'node_modules',
                'build',
                'dist',
                '.git',
                '*.log',
                'coverage'
            ].join('\n'));
        }

        this.watcher = chokidar.watch(this.watchPath, {
            ignored: (pathToCheck) => {
                try {
                    // Convert absolute path to relative path
                    const relativePath = path.relative(this.watchPath, pathToCheck);
                    // Handle root path case
                    if (!relativePath) return false;
                    return ig.ignores(relativePath);
                } catch (error) {
                    console.warn('Error checking ignore pattern:', error);
                    return false;
                }
            },
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