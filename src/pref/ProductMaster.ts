type ProductMasterUpdateConfig = {
  allowedFields: string[]
}

export const platformUpdateProductMaster: ProductMasterUpdateConfig = {
  allowedFields: ['plant', 'material', 'materialNumber', 'mg1', 'mg2', 'profitCenter', 'baseUnit', 'materialType', 'profile']
}
