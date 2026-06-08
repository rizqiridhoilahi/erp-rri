export interface UTM {
  source: string
  medium: string
  campaign: string
  content?: string
  term?: string
}

const UTM_BASE = {
  source: 'erp-rri',
  medium: 'email',
}

export function addUtmToUrl(url: string, campaign: string, content?: string): string {
  const separator = url.includes('?') ? '&' : '?'
  const params = new URLSearchParams({
    utm_source: UTM_BASE.source,
    utm_medium: UTM_BASE.medium,
    utm_campaign: campaign,
  })
  if (content) params.set('utm_content', content)
  return `${url}${separator}${params.toString()}`
}

export function addUtmToHtmlLinks(html: string, campaign: string): string {
  return html.replace(/<a\s+([^>]*?)href="([^"]+)"([^>]*)>/gi, (match, before, url, after) => {
    if (url.startsWith('#') || url.startsWith('mailto:')) return match
    const urlWithUtm = addUtmToUrl(url, campaign)
    return `<a ${before}href="${urlWithUtm}"${after}>`
  })
}
