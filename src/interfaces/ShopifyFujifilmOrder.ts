interface iOrderCustomerInfo {
  //name: string
  email: string
  acceptsMarketing: boolean
  phone?: string
  billingName?: string
  billingStreet?: string
  billingAddress1?: string
  billingAddress2?: string
  billingCompany?: string
  billingCity?: string
  billingZip?: string
  billingProvince?: string
  billingCountry?: string
  billingPhone?: string
  shippingName?: string
  shippingStreet?: string
  shippingAddress1?: string
  shippingAddress2?: string
  shippingCompany?: string
  shippingCity?: string
  shippingZip?: string
  shippingProvince?: string
  shippingCountry?: string
  shippingPhone?: string
  notes?: string
  noteAttributes?: string
}

interface iOrderLineItem {
  quantity: number
  name: string
  price: number
  compareAtPrice?: number
  sku?: string
  requiresShipping: boolean
  taxable: boolean
  fulfillmentStatus?: string
  discount?: number
}

interface iOrderTaxInfo {
  tax1Name?: string
  tax1Value?: number
  tax2Name?: string
  tax2Value?: number
  tax3Name?: string
  tax3Value?: number
  tax4Name?: string
  tax4Value?: number
  tax5Name?: string
  tax5Value?: number
}

interface iOrderInfo {
  financialStatus: string
  paidAt?: Date
  fulfillmentStatus: string
  fulfilledAt?: Date
  currency: string
  subtotal: number
  shipping: number
  taxes: number
  total: number
  discountCode?: string
  discountAmount?: number
  shippingMethod?: string
  createdAt: Date
  cancelledAt?: Date
  paymentMethod?: string
  paymentReference?: string
  refundedAmount?: number
  outstandingBalance?: number
  employee?: string
  location?: string
  deviceId?: string
  id: string
  tags?: string
  riskLevel?: string
  source?: string
  paymentId?: string
  paymentTermsName?: string
  nextPaymentDueAt?: Date
  paymentReferences?: string
  receiptNumber?: string
  duties?: number
}

interface iCustomOrderFields {
  vendor?: string
  category?: string
  sorApasNumber?: string
  codesales?: string
  receiptInvoice?: string // ใบเสร็จ/ใบกำกับภาษี
  plant?: string
  addressLine1?: string // Refer from Column AA: Building Address1
  subdistrict?: string
  city?: string
  stateProvinceRegion?: string
  zip?: string // Refer from Column AE: Billing Zip
  paymentReferencesRef?: string // Refer from Column AW: Payment Reference
  grandTotal?: number // Refer from Column I: Subtotal
  normalSrp?: number // Refer from Column S: Lineitem price
  discount?: number // Refer from Column N: Discount Amount
  srpAfterPromotion?: number // Refer from Column L: Total
  exvat?: number
  grandTotalFinal?: number // GRAND TOTAL
}

export interface iOrder {
  customer: iOrderCustomerInfo
  lineItems: iOrderLineItem[]
  order: iOrderInfo
  taxes: iOrderTaxInfo
  custom: iCustomOrderFields
}

type FieldType = 'number' | 'string' | 'boolean' | 'datetime'
export interface iExtractFile {
  objectColumnMapping: Record<string, string>
  stringColumnMapping: string[]
  stringHeaderMapping: string[]
  numberColumnMapping: string[]
  headerObjectMapping?: Record<string, { keyName: string; type: FieldType }>
}

export interface iShopifyFujifilmOrder {
  name: string
  email: string
  financialStatus: string
  paidAt: string
  fulfillmentStatus: string
  fulfilledAt: string
  acceptsMarketing: string
  currency: string
  subtotal: number
  shipping: number
  taxes: number
  total: number
  discountCode: string
  discountAmount: number
  shippingMethod: string
  createdAt: string
  lineitemQuantity: number
  lineitemName: string
  lineitemPrice: number
  lineitemCompareAtPrice: number
  lineitemSku: string
  lineitemRequiresShipping: boolean
  lineitemTaxable: boolean
  lineitemFulfillmentStatus: string
  billingName: string
  billingStreet: string
  billingAddress1: string
  billingAddress2: string
  billingCompany: string
  billingCity: string
  billingZip: string
  billingProvince: string
  billingCountry: string
  billingPhone: string
  shippingName: string
  shippingStreet: string
  shippingAddress1: string
  shippingAddress2: string
  shippingCompany: string
  shippingCity: string
  shippingZip: string
  shippingProvince: string
  shippingCountry: string
  shippingPhone: string
  notes: string
  noteAttributes: string
  cancelledAt: string
  paymentMethod: string
  paymentReference: string
  refundedAmount: number
  vendor: string
  outstandingBalance: number
  employee: string
  location: string
  deviceId: string
  id: number
  tags: string
  riskLevel: string
  source: string
  lineitemDiscount: number
  tax1Name: string
  tax1Value: string
  tax2Name: string
  tax2Value: string
  tax3Name: string
  tax3Value: string
  tax4Name: string
  tax4Value: string
  tax5Name: string
  tax5Value: string
  phone: number
  receiptNumber: string
  duties: string
  billingProvinceName: string
  shippingProvinceName: string
  paymentId: string
  paymentTermsName: string
  nextPaymentDueAt: string
  paymentReferences: string
}

export interface iShopeeFujifilmOrder {
  orderId: string
  orderStatus: string
  refundStatus: string
  buyerName: string
  orderDate: string
  paymentTime: string
  paymentMethod: string
  paymentDetails: string
  installmentPlan: string
  transactionFeePercent: string
  shippingOption: string
  shippingMethod: string
  trackingNumber: string
  estimatedDeliveryDate: string
  deliveryTime: string
  parentSKURef: string
  productName: string
  skuReferenceNo: string
  optionName: string
  originalPrice: number
  salePrice: number
  quantity: number
  returnedQuantity: number
  netSalePrice: number
  shopeeDiscount: number
  sellerVoucher: number
  coinsCashbackSeller: number
  shopeeVoucher: number
  discountCode: string
  bundleDeal: string
  bundleDiscountSeller: number
  bundleDiscountShopee: number
  coinsUsed: number
  allPaymentPromotions: number
  commissionFee: number
  transactionFee: number
  totalBuyerPaid: number
  shippingFeeBuyer: number
  shippingFeeShopee: number
  returnShippingFee: number
  serviceFee: number
  totalAmount: number
  estimatedShippingFee: number
  receiverName: string
  receiverPhone: string
  buyerNote: string
  shippingAddress: string
  shippingCountry: string
  shippingProvince: string
  shippingDistrict: string
  shippingPostalCode: string
  orderType: string
  orderSuccessTime: string
  orderNotes: string
  buyerInvoiceRequest: string
  invoiceType: string
  invoiceName: string
  invoiceBranchType: string
  invoiceBranchName: string
  invoiceBranchCode: string
  invoiceFullAddress: string
  invoiceAddressDetails: string
  invoiceSubDistrict: string
  invoiceDistrict: string
  invoiceProvince: string
  invoicePostalCode: string
  taxpayerId: string
  invoicePhoneNumber: string
  invoiceEmail: string
  category: string
  SOR_ApasNumber: string
  codeSales: string
  invoiceReceipt: string
}

export interface TaxCustomData {
  TaxCustomType?: string
  TaxCustomName?: string
  TaxCustomValid?: string
  TaxCustomID?: string
  TaxCustomAddress1?: string
  TaxCustomAddress2?: string
  TaxCustomDistrict?: string
  TaxCustomSubdistrict?: string
  TaxCustomPhone?: string
  TaxCustomProvince?: string
  TaxCustomPostcode: string
}
