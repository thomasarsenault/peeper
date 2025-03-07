import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createProxyMiddleware, responseInterceptor } from 'http-proxy-middleware';
import { fileURLToPath } from 'url';
import { initFilePeeper } from './file-peeper.js';

const CODE_SERVER_URL = 'http://code-server:8443'; //change to localhost when not in container
const PROXY_SERVER_PORT = 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// debug
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.get('/peeper.js', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public/peeper.js'));
});

const proxyOptions = {
    target: CODE_SERVER_URL,
    changeOrigin: true,
    secure: false,
    ws: true,
    selfHandleResponse: true,
    router: {
        '/proxy/5173': 'http://code-server:5173'
    },
    on: {
        proxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
            const contentType = proxyRes.headers['content-type'] || '';
            if (contentType.includes('text/html') && req.url === '/?folder=/config/workspace') {
                let response = responseBuffer.toString('utf8');

                if (response.includes('</head>')) {
                    const scriptTag = '<script src="/peeper.js"></script>';
                    response = response.replace('</head>', `${scriptTag}</head>`);
                    console.log('Injected peeper.js into HTML.');
                } else {
                    console.log('No </head> tag found in HTML response.');
                }

                return response;
            }

            return responseBuffer;
        }),
        proxyReqWs: (proxyReq: any, req: any) => {
            try {
                proxyReq.setHeader('Origin', CODE_SERVER_URL);
                if (req.headers.cookie) {
                    proxyReq.setHeader('Cookie', req.headers.cookie);
                }
            } catch (e) {
                console.log('Proxy socket error:', e);
            }
        }
    },
    onError: (err: Error, req: Request, res: Response) => {
        console.error('Proxy error:', err);
        res.status(500).send('Proxy encountered an error.');
    },
};

app.use('/', createProxyMiddleware(proxyOptions));

app.listen(PROXY_SERVER_PORT, () => {
    console.log(`Express proxy server is running on port ${PROXY_SERVER_PORT}`);
});

try {
    await initFilePeeper();
    console.log('file peeper initialized successfully');
} catch (e) {
    console.error('Failed to init file peeper:', e);
} 