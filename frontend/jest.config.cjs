module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: [
        "**/__tests__/**/*.test.[jt]s?(x)",
    ],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1', // This maps @ to src directory
    }
};