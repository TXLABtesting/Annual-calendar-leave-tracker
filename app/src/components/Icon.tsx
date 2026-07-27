import type { CSSProperties } from 'react'
import { ICON_PATHS } from './icon-paths'

export type IconWeight = 'regular' | 'bold' | 'fill'

interface IconProps {
  name: string
  weight?: IconWeight
  className?: string
  style?: CSSProperties
}

/**
 * Renders a Phosphor glyph inline. Sized in `em` so the surrounding CSS keeps
 * controlling it with `font-size`, exactly as the icon-font version did.
 * Run `npm run icons` after adding a name to `scripts/build-icons.mjs`.
 */
export function Icon({ name, weight = 'regular', className, style }: IconProps) {
  const path = ICON_PATHS[`${weight}/${name}`]
  if (!path) {
    if (import.meta.env.DEV) console.warn(`Icon "${weight}/${name}" is not in the generated set`)
    return null
  }

  return (
    <svg
      className={className ? `icon ${className}` : 'icon'}
      style={style}
      viewBox="0 0 1024 1024"
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d={path} />
    </svg>
  )
}
