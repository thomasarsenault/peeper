import { promises as fs } from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import ignore from 'ignore';

let watcher;

export async function initFilePeeper(watchPath, storageBasePath) {
    await fs.mkdir(storageBasePath, { recursive: true });

    // Load ignore patterns from .peeperignore file
    const ig = ignore();
    try {
        const ignorePath = path.join(watchPath, '.peeperignore');
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

    watcher = chokidar.watch(watchPath, {
        ignored: (pathToCheck) => {
            try {
                const relativePath = path.relative(watchPath, pathToCheck);
                if (!relativePath) return false;
                return ig.ignores(relativePath);
            } catch (error) {
                console.warn('Error checking ignore pattern:', error);
                return false;
            }
        },
        persistent: true
    });

    watcher.on('change', async filepath => {
        await handleFileChange(filepath, storageBasePath);
    });
}

async function handleFileChange(filepath, storageBasePath) {
    try {
        const content = await fs.readFile(filepath, 'utf8');
        const fileDir = path.join(
            storageBasePath,
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