import { promises as fs } from 'fs';
import path from 'path';
import chokidar, { FSWatcher } from 'chokidar';
import ignore, { Ignore } from 'ignore';

let watcher: FSWatcher;

// can override w/ env vars
const DEFAULT_WATCH_PATH = '/config/workspace';
const DEFAULT_STORAGE_PATH = '/proxy/diffs';

export async function initFilePeeper(
    watchPath: string = process.env.WATCH_PATH || DEFAULT_WATCH_PATH,
    storageBasePath: string = process.env.STORAGE_PATH || DEFAULT_STORAGE_PATH
): Promise<void> {
    await fs.mkdir(storageBasePath, { recursive: true });

    // load ignore patterns from .peeperignore file
    const ig: Ignore = ignore();
    try {
        const ignorePath = path.join(watchPath, '.peeperignore');
        const ignoreFile = await fs.readFile(ignorePath, 'utf8');
        ig.add(ignoreFile);
    } catch (error) {
        // if no .peeperignore file exists, use default patterns
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
        ignored: (pathToCheck: string) => {
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

    watcher.on('change', async (filepath: string) => {
        await handleFileChange(filepath, storageBasePath);
    });
}

async function handleFileChange(filepath: string, storageBasePath: string): Promise<void> {
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