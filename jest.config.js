const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^components/(.*)$': '<rootDir>/src/components/$1',
    '^context/(.*)$': '<rootDir>/src/context/$1',
    '^hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^pages/(.*)$': '<rootDir>/src/pages/$1',
    '^service/(.*)$': '<rootDir>/src/service/$1',
    '^styles/(.*)$': '<rootDir>/src/styles/$1',
    '^types/(.*)$': '<rootDir>/src/types/$1',
    '^utils/(.*)$': '<rootDir>/src/utils/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
}

module.exports = createJestConfig(customJestConfig)