import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { BreadcrumbNav } from '@/components/breadcrumb-nav'

describe('BreadcrumbNav', () => {
  it('renders items without nested <a> elements', () => {
    const { container } = render(
      <BreadcrumbNav items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Master' },
      ]} />
    )
    const anchors = container.querySelectorAll('a')
    // Pastikan tidak ada <a> di dalam <a>
    for (const a of Array.from(anchors)) {
      expect(a.querySelector('a')).toBeNull()
    }
  })

  it('renders without nested <li> elements', () => {
    const { container } = render(
      <BreadcrumbNav items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Master' },
      ]} />
    )
    const listItems = container.querySelectorAll('li')
    for (const li of Array.from(listItems)) {
      expect(li.querySelector('li')).toBeNull()
    }
  })

  it('renders correct number of items', () => {
    const { getByText } = render(
      <BreadcrumbNav items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Master', href: '/dashboard/master' },
        { label: 'Barang' },
      ]} />
    )
    expect(getByText('Dashboard')).toBeInTheDocument()
    expect(getByText('Master')).toBeInTheDocument()
    expect(getByText('Barang')).toBeInTheDocument()
  })
})
