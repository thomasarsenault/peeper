import express from 'express';
import { createProxyMiddleware, responseInterceptor } from 'http-proxy-middleware';
import path from 'path';

const CODE_SERVER_URL = 'http://code-server:8443' //change to localhost when not in container
const PROXY_SERVER_PORT = 3001;

const app = express();

// debug
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.get('/peeper.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'peeper.js'));
});

const proxyOptions = {
    target: CODE_SERVER_URL,
    changeOrigin: true,
    secure: false,
    ws: true,
    selfHandleResponse: true,
    on: {
        proxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
            // inject the big brother code into the initial html returned
            // (code-server only makes one html request)  (except the login page)
            const contentType = proxyRes.headers['content-type'] || '';
            if (contentType.includes('text/html')) {
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
        proxyReqWs: (proxyReq, req) => {
            // socket requests need to come from same origin that was annoying to debug, shouldn't changeOrigin do that for me?
            try {
                proxyReq.setHeader('Origin', CODE_SERVER_URL);
                proxyReq.setHeader('Cookie', req.headers.cookie);
            } catch (e) {
                console.log('Proxy socket error:', e);
                res.status(500).send('Proxy encountered an error while proxying socket request.');
            }

        }
    },
    onError: (e, req, res) => {
        console.error('Proxy error:', err);
        res.status(500).send('Proxy encountered an error.');
    },
};

app.use('/', createProxyMiddleware(proxyOptions));

app.listen(PROXY_SERVER_PORT, () => {
    console.log(`Express proxy server is running on port ${PROXY_SERVER_PORT}`);
})