
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    
app.use(
    '/save',
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
    '/api',
    createProxyMiddleware({
        target: 'https://atttcheck.herokuapp.com',
        secure : false ,
        changeOrigin: true,
        })
    );
};
