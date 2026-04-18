// Save/Load Hook
// 작성일: 2026-04-18
// 기능: 클라이언트에서 게임 저장/로드 관리

'use client'

import { useState, useCallback } from 'react'

interface SaveData {
  currentStage?: string
  turnNumber?: number
  productionRate?: number
  unlockedMenus?: string[]
  employees?: any[]
  inventory?: any[]
  gameState?: Record<string, any>
  seoMetadata?: Record<string, any>
}

interface SaveSlot {
  save_slot: number
  save_name: string
  current_stage: string
  turn_number: number
  saved_at: string
  hours_ago: number
}

export function useSaveLoad(userId: string = 'anonymous') {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 저장 목록 조회
  const getSaves = useCallback(async (): Promise<SaveSlot[]> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/saves?list=true', {
        headers: { 'x-user-id': userId }
      })
      
      if (!response.ok) throw new Error('저장 목록 조회 실패')
      
      const data = await response.json()
      return data.saves || []
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  // 게임 저장
  const save = useCallback(async (
    slot: number, 
    name: string, 
    saveData: SaveData
  ): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/saves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({
          slot,
          name,
          ...saveData
        })
      })
      
      if (!response.ok) throw new Error('저장 실패')
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  // 게임 로드
  const load = useCallback(async (slot: number): Promise<SaveData | null> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/saves?slot=${slot}`, {
        headers: { 'x-user-id': userId }
      })
      
      if (!response.ok) throw new Error('로드 실패')
      
      const data = await response.json()
      return data.save
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  // 저장 삭제
  const deleteSave = useCallback(async (slot: number): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/saves?slot=${slot}`, {
        method: 'DELETE',
        headers: { 'x-user-id': userId }
      })
      
      if (!response.ok) throw new Error('삭제 실패')
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  // 자동 저장
  const autoSave = useCallback(async (saveData: SaveData): Promise<boolean> => {
    return await save(0, '자동 저장', saveData)
  }, [save])

  return {
    isLoading,
    error,
    getSaves,
    save,
    load,
    deleteSave,
    autoSave
  }
}
