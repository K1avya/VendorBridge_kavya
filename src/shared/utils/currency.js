/**
 * Format amount as Indian Rupees (INR)
 * @param {number} amount - Amount in rupees
 * @returns {string} Formatted amount (e.g., "₹1,234.50")
 */
const formatINR = (amount) => {
  if (amount === null || amount === undefined) return '₹0.00'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format amount in Lakhs/Crores for dashboard display
 * @param {number} amount - Amount in rupees
 * @returns {string} Formatted amount (e.g., "₹12.34 L" for lakhs, "₹1.23 Cr" for crores)
 */
const formatLakh = (amount) => {
  if (amount === null || amount === undefined) return '₹0.00'
  
  const crore = 10000000
  const lakh = 100000

  if (amount >= crore) {
    return `₹${(amount / crore).toFixed(2)} Cr`
  }
  
  if (amount >= lakh) {
    return `₹${(amount / lakh).toFixed(2)} L`
  }
  
  return formatINR(amount)
}

/**
 * Parse INR formatted string to number
 * @param {string} formattedAmount - Formatted INR amount
 * @returns {number} Numeric amount
 */
const parseINR = (formattedAmount) => {
  if (typeof formattedAmount !== 'string') return 0
  const numeric = formattedAmount.replace(/[₹,]/g, '').trim()
  return parseFloat(numeric) || 0
}

module.exports = {
  formatINR,
  formatLakh,
  parseINR,
}
