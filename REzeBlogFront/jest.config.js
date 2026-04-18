// Jest 설정 파일
// 작성일: 2026-04-18

const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Next.js 앱 경로
  dir: './',
})

// Jest에 추가할 커스텀 설정
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    // Handle module aliases
    '^@/(.*)$': '<rootDir>/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}

// createJestConfig는 Next.js의 비동기 설정을 위해보내짐
module.exports = createJestConfig(customJestConfig)
