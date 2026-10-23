import { render, screen } from '@testing-library/react'
import { Education } from './Education'

it('links the school logo to the same page as the school name', () => {
  const { container } = render(<Education />)
  const name = screen.getByRole('link', { name: 'University of Southern California' })
  const logo = container.querySelector('img')!.closest('a')!
  expect(logo).toHaveAttribute('href', name.getAttribute('href'))
})
