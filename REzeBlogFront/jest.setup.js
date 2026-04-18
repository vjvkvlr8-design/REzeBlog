// Jest 테스트 설정
// 작성일: 2026-04-18

// 필요한 경우 글로벌 설정 추가
// 예: import '@testing-library/jest-dom'

// 환경 변수 설정
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/rezeblog_test'
process.env.NODE_ENV = 'test'
