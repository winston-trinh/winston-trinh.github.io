import { act, fireEvent, render, screen } from '@testing-library/react'
import { GAZE_STEPS as S } from '../lib/gaze'
import { setMedia } from '../test/setup'
import { GazeFace } from './GazeFace'

function mockRect() {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    left: 0, top: 0, width: 300, height: 300, right: 300, bottom: 300, x: 0, y: 0, toJSON: () => ({}),
  } as DOMRect)
}

function move(x: number, y: number) {
  act(() => {
    fireEvent.pointerMove(window, { clientX: x, clientY: y })
  })
}

describe('GazeFace', () => {
  beforeEach(() => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0)
      return 1
    })
    mockRect()
  })

  it('starts looking straight ahead', () => {
    render(<GazeFace name="Winston" />)
    expect(screen.getByRole('img')).toHaveAttribute('src', '/gaze/gaze_px0_py0.webp')
  })

  it('looks toward the pointer', () => {
    render(<GazeFace name="Winston" />)
    const img = screen.getByRole('img')

    move(2000, -2000) // far top-right
    expect(img).toHaveAttribute('src', `/gaze/gaze_px${S}_py-${S}.webp`)

    move(-2000, 135) // far left, level with the eyes
    expect(img).toHaveAttribute('src', `/gaze/gaze_px-${S}_py0.webp`)

    move(150, 2000) // straight down
    expect(img).toHaveAttribute('src', `/gaze/gaze_px0_py${S}.webp`)
  })

  it('stays centered when reduced motion is preferred', () => {
    setMedia('(prefers-reduced-motion: reduce)', true)
    render(<GazeFace name="Winston" />)
    move(2000, -2000)
    expect(screen.getByRole('img')).toHaveAttribute('src', '/gaze/gaze_px0_py0.webp')
  })
})
