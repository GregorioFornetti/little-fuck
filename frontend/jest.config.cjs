module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: [
        "**/__tests__/**/*",
        "!**/__tests__/**/setupTests.[jt]s?(x)",
        "!**/__tests__/**/_*"
    ],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1', // This maps @ to src directory
    }
};