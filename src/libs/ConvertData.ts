export function convertQueryStringToBoolean(value: string | null): boolean | null {
  if (value === null) return null
  const normalizedValue = value.trim().toLowerCase()
  if (normalizedValue === 'true' || normalizedValue === '1') {
    return true
  } else if (normalizedValue === 'false' || normalizedValue === '0') {
    return false
  } else {
    return null
  }
}
