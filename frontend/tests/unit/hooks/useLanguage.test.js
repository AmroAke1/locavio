import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

vi.mock('../../../src/i18n', () => ({
  default: { changeLanguage: vi.fn() },
}))

import { useLanguage } from '../../../src/hooks/useLanguage'
import { useUiStore } from '../../../src/store/uiStore'
import i18n from '../../../src/i18n'

beforeEach(() => {
  localStorage.clear()
  useUiStore.setState({ language: 'en', sidebarOpen: false })
  vi.clearAllMocks()
})

describe('useLanguage', () => {
  it('returns current language from store', () => {
    const { result } = renderHook(() => useLanguage())
    expect(result.current.language).toBe('en')
  })

  it('changeLanguage() updates store and calls i18n', () => {
    const { result } = renderHook(() => useLanguage())
    act(() => { result.current.changeLanguage('fr') })
    expect(useUiStore.getState().language).toBe('fr')
    expect(i18n.changeLanguage).toHaveBeenCalledWith('fr')
  })

  it('changeLanguage() to ar sets document dir to rtl', () => {
    const { result } = renderHook(() => useLanguage())
    act(() => { result.current.changeLanguage('ar') })
    expect(document.dir).toBe('rtl')
  })

  it('changeLanguage() to non-ar sets document dir to ltr', () => {
    document.dir = 'rtl'
    const { result } = renderHook(() => useLanguage())
    act(() => { result.current.changeLanguage('en') })
    expect(document.dir).toBe('ltr')
  })
})