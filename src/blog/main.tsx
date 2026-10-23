import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BlogApp } from './BlogPages'
import '../styles/global.css'

const root = document.getElementById('root')!

createRoot(root).render(
  <StrictMode>
    <BlogApp page={root.dataset.page ?? 'index'} />
  </StrictMode>,
)
