import { render, screen } from '@testing-library/react'
import App from './App'

it('renders every section of the portfolio', () => {
  render(<App />)
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Hi, I’m Winston.')
  for (const name of ['Get to know me.', 'Where I’ve worked.', 'Things I’ve built.', 'Where I studied.', 'Let’s build something.']) {
    expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument()
  }
  expect(screen.getByRole('img', { name: /Portrait of Winston Trinh/ })).toBeInTheDocument()
  expect(screen.getAllByRole('article')).toHaveLength(5 + 5 + 1)
})

it('orders sections with education right after experience', () => {
  const { container } = render(<App />)
  const ids = [...container.querySelectorAll('main > section')].map((s) => s.id)
  expect(ids).toEqual(['top', 'about', 'experience', 'education', 'projects', 'contact'])
})
