import { fireEvent, render, screen } from '@testing-library/react'
import { Hero } from '../components/Hero'
import { applyTranslucency, readTranslucency } from './useGlass'

const root = document.documentElement

describe('glass translucency', () => {
  afterEach(() => {
    root.removeAttribute('style')
    delete root.dataset.translucency
  })

  it('starts halfway, on the slider and the glass tokens', () => {
    render(<Hero />)
    expect(screen.getByRole('slider', { name: 'Glass, from clear to frosted' })).toHaveValue('50')
    expect(root.dataset.translucency).toBe('0.50')
    expect(root.style.getPropertyValue('--glass-alpha')).toBe('0.590')
  })

  it('goes from frosted to clear, but never so clear that text gets hard to read', () => {
    applyTranslucency(0)
    expect(root.style.getPropertyValue('--lg-blur')).toBe('14.0px')
    applyTranslucency(1)
    expect(root.style.getPropertyValue('--lg-blur')).toBe('2.0px')
    expect(Number(root.style.getPropertyValue('--glass-alpha'))).toBeCloseTo(0.3)
  })

  it('only re-renders the slider while dragging, and saves once the drag settles', async () => {
    vi.useFakeTimers()
    try {
      render(<Hero />)
      const slider = screen.getByRole('slider', { name: 'Glass, from clear to frosted' })
      const portrait = screen.getByRole('img', { name: /Portrait/ })
      // Clear is on the left: dragging all the way left makes the glass fully clear.
      fireEvent.change(slider, { target: { value: '10' } })
      fireEvent.change(slider, { target: { value: '0' } })
      expect(screen.getByRole('img', { name: /Portrait/ })).toBe(portrait)
      expect(localStorage.getItem('glass')).toBeNull()
      vi.advanceTimersByTime(300)
      expect(localStorage.getItem('glass')).toBe('1')
      expect(root.dataset.translucency).toBe('1.00')
      expect(slider).toHaveAttribute('aria-valuetext', '0% frosted')

      fireEvent.change(slider, { target: { value: '100' } })
      vi.advanceTimersByTime(300)
      expect(root.dataset.translucency).toBe('0.00')
    } finally {
      vi.useRealTimers()
    }
  })

  it('restores a saved value and survives broken storage', () => {
    localStorage.setItem('glass', '0.8')
    expect(readTranslucency()).toBe(0.8)
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(readTranslucency()).toBe(0.5)
  })
})
