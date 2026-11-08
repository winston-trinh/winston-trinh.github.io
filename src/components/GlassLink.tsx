import { Glass } from 'glisse'
import type { AnchorHTMLAttributes, ReactNode } from 'react'
import styles from './GlassLink.module.css'

interface GlassLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  icon?: ReactNode
  variant?: 'glass' | 'filled'
  size?: 'regular' | 'large'
}

/** glisse's Button is a <button>; this is the same Liquid Glass capsule as a real link. */
export function GlassLink({ href, icon, variant = 'glass', size = 'regular', className, children, ...rest }: GlassLinkProps) {
  const external = /^https?:/.test(href) || href.endsWith('.pdf')
  return (
    <a
      href={href}
      className={[styles.link, size === 'large' ? styles.large : '', className].filter(Boolean).join(' ')}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      {...rest}
    >
      <Glass
        className="lg-button"
        data-variant={variant === 'filled' ? 'filled' : undefined}
        data-icon={icon == null ? undefined : children == null ? 'only' : ''}
      >
        {icon}
        {children}
      </Glass>
    </a>
  )
}
