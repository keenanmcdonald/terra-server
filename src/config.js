module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret',
    JWT_EXPIRY: process.env.JWT_EXPIRY || '30d',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost/terra',
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://localhost/terra_test',
}