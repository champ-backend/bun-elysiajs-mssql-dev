export function extractVat(priceIncludingVat: number, vatRatePercent: number): { priceExVat: number; vatAmount: number } {
  const vatRate = vatRatePercent / 100
  const priceExVat = priceIncludingVat / (1 + vatRate)
  const vatAmount = priceIncludingVat - priceExVat
  return { priceExVat: parseFloat(priceExVat.toFixed(2)), vatAmount: parseFloat(vatAmount.toFixed(2)) }
}

export function matchesStockWhere(item: any, where: object) {
  return Object.entries(where).every(([key, value]) => item[key] === value)
}
