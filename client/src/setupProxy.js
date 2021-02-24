
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    
app.use(
    '/saveDB',
    createProxyMiddleware({
        target: 'http://localhost:8080',
        secure : false,
        changeOrigin: true,
        })
    );
app.use(
    '/attendance',
    createProxyMiddleware({
        target: 'http://localhost:8080',
        secure : false,
        changeOrigin: true,
        })
    );
app.use(
    '/load',
    createProxyMiddleware({
        target: 'http://localhost:8080',
        secure : false,
        changeOrigin: true,
        })
    );   
app.use(
   '/stuInfo',
    createProxyMiddleware({
        target: 'http://localhost:8080',
        secure : false,
        changeOrigin: true,
        })
    );      
app.use(
    '/api',
    createProxyMiddleware({
        target: 'https://atttcheck.herokuapp.com',
        secure : false ,
        changeOrigin: true,
        })
    );
};
