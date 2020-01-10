module.exports = {
    PORT: process.eventNames.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret',
    JWT_EXPIRY: process.env.JWT_EXPIRY || '30d',
    DB_URL: process.env.DB_URL || 'postgresql://localhost/terra',
}