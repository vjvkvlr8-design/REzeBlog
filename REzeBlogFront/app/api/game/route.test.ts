// 게임 세션 API 테스트
// 작성일: 2026-04-18

import { GET, POST } from './route'
import { NextRequest } from 'next/server'

describe('Game API - GET', () => {
  test('익명 사용자 세션 조회', async () => {
    const request = new NextRequest('http://localhost:3000/api/game', {
      headers: {
        'x-user-id': 'anonymous-test'
      }
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('message')
  })

  test('헤더 없는 요청 처리', async () => {
    const request = new NextRequest('http://localhost:3000/api/game')
    const response = await GET(request)
    
    expect(response.status).toBe(200)
  })
})

describe('Game API - POST', () => {
  test('새 게임 세션 생성', async () => {
    const request = new NextRequest('http://localhost:3000/api/game', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: 'test-api-user',
        currentStage: 'intro',
        turnNumber: 1
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.session).toBeDefined()
    expect(data.message).toBe('Session updated successfully')
  })

  test('잘못된 JSON 요청 처리', async () => {
    const request = new NextRequest('http://localhost:3000/api/game', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: 'invalid-json'
    })

    const response = await POST(request)
    expect(response.status).toBe(500)
  })

  test('빈 body 요청 처리', async () => {
    const request = new NextRequest('http://localhost:3000/api/game', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.session).toBeDefined()
  })
})
