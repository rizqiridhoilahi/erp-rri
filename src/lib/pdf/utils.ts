export function computeDefaultDistribution(
  total: number,
  firstPage: number,
  otherPages: number,
): number[] {
  const result: number[] = []
  let remaining = total
  let idx = 0
  while (remaining > 0) {
    const limit = idx === 0 ? firstPage : otherPages
    result.push(Math.min(limit, remaining))
    remaining -= result[result.length - 1]
    idx++
  }
  return result
}

export function getItemSlices(
  totalItems: number,
  itemsPerPage?: number[],
  defaultFirst = 16,
  defaultOther = 24,
): number[] {
  if (itemsPerPage && itemsPerPage.length > 0) {
    const slices: number[] = []
    let remaining = totalItems
    for (const count of itemsPerPage) {
      if (remaining <= 0) break
      slices.push(Math.min(count, remaining))
      remaining -= slices[slices.length - 1]
    }
    return slices
  }
  return computeDefaultDistribution(totalItems, defaultFirst, defaultOther)
}
