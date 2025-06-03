const config = {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST']
    },
    socket: {
        pingTimeout: 60000,
        pingInterval: 25000
    }
};

module.exports = {
    config
}; 