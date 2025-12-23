// utils/stringCases.ts

/** Converts a string to camelCase */
export function toCamelCase(str: string): string {
  return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase())
}

/** Converts a string to snake_case */
export function toSnakeCase(str: string): string {
  return str
    .replace(/\s+/g, '_')
    .replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
    .replace(/^_/, '')
    .toLowerCase()
}

/** Converts a string to PascalCase */
export function toPascalCase(str: string): string {
  return str.replace(/\w+/g, w => w[0].toUpperCase() + w.slice(1).toLowerCase()).replace(/\s+/g, '')
}

/** Converts a string to kebab-case */
export function toKebabCase(str: string): string {
  return str.trim().toLowerCase().replace(/\s+/g, '-')
}

/** Converts a string to Title Case */
export function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/\b(\w)/g, s => s.toUpperCase())
}

/** Infers a simple type from a sample value */
export function inferType(sampleValue: unknown): 'number' | 'boolean' | 'datetime' | 'string' {
  if (typeof sampleValue === 'number') return 'number'
  if (typeof sampleValue === 'boolean') return 'boolean'
  if (typeof sampleValue === 'string' && /^\d{4}-\d{2}-\d{2}/.test(sampleValue)) return 'datetime'
  return 'string'
}
