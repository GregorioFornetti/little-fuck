module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: [
        "**/__tests__/**/*",
        "!**/__tests__/**/setupTests.[jt]s?(x)"
    ],
};