export async function filterAllowedFields(input: Record<string, any>, allowed: string[]) {
  const allowedSet = new Set(allowed)
  return Object.entries(input).reduce((acc, [key, value]) => {
    if (allowedSet.has(key) && value !== undefined && value !== null && value !== '') {
      acc[key] = value
    }
    return acc
  }, {} as Record<string, any>)
}
