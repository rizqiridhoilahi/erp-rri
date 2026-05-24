import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Badge } from '@/components/ui/badge'

describe('Badge', () => {
  it('renders children text', () => {
    const { getByText } = render(<Badge>Active</Badge>)
    expect(getByText('Active')).toBeInTheDocument()
  })

  it('applies destructive variant class', () => {
    const { container } = render(<Badge variant="destructive">Inactive</Badge>)
    expect(container.firstChild).toHaveClass('bg-destructive')
  })

  it('applies default variant class', () => {
    const { container } = render(<Badge>Default</Badge>)
    expect(container.firstChild).toHaveClass('bg-primary')
  })

  it('applies success variant class', () => {
    const { container } = render(<Badge variant="success">Success</Badge>)
    expect(container.firstChild).toHaveClass('bg-success')
  })

  it('forwards additional className', () => {
    const { container } = render(<Badge className="custom-class">Custom</Badge>)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
