// 게임 분기 API 테스트
// 작성일: 2026-04-18

import { GET } from './route'
import { NextRequest } from 'next/server'

describe('Branches API - GET', () => {
  test('특정 분기 조회 (intro)', async () => {
    const request = new NextRequest('http://localhost:3000/api/branches?id=intro')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.branch).toBeDefined()
    expect(data.branch.branch_id).toBe('intro')
    expect(data.seo).toBeDefined()
    expect(data.seo.title).toBeDefined()
  })

  test('존재하지 않는 분기 조회 (404)', async () => {
    const request = new NextRequest('http://localhost:3000/api/branches?id=non-existent')
    const response = await GET(request)

    expect(response.status).toBe(404)
  })

  test('스테이지별 분기 목록 조회 (intro)', async () => {
    const request = new NextRequest('http://localhost:3000/api/branches?stage=intro')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.branches).toBeDefined()
    expect(Array.isArray(data.branches)).toBe(true)
  })

  test('모든 활성 분기 조회', async () => {
    const request = new NextRequest('http://localhost:3000/api/branches')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.branches).toBeDefined()
    expect(Array.isArray(data.branches)).toBe(true)
    expect(data.branches.length).toBeGreaterThan(0)
  })

  test('응답 시간 체크 (< 200ms)', async () => {
    const start = Date.now()
    const request = new NextRequest('http://localhost:3000/api/branches?id=intro')
    await GET(request)
    const duration = Date.now() - start

    expect(duration).toBeLessThan(200)
  })
})
