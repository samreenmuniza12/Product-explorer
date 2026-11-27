export function getStockLimit(product) {
  return Number.isSafeInteger(product?.stock) && product.stock >= 0 ? product.stock : 0
}

export function addCartItem(items, product) {
  const limit = getStockLimit(product)
  if (limit === 0) return items
  const existing = items.find(item => item.product.id === product.id)
  if (existing?.quantity >= limit) return items
  if (!existing) return [...items, { product, quantity: 1 }]
  return items.map(item => item.product.id === product.id
    ? { product: { ...item.product, ...product }, quantity: item.quantity + 1 }
    : item)
}

export function changeCartQuantity(items, productId, quantity) {
  if (!Number.isSafeInteger(quantity)) return items
  return items.map(item => {
    if (item.product.id !== productId) return item
    const limit = getStockLimit(item.product)
    if (limit === 0) return item
    return { ...item, quantity: Math.min(limit, Math.max(1, quantity)) }
  })
}

export function reconcileCart(items, availability) {
  const products = new Map(availability.map(result => [result.id, result.product]))
  let adjusted = false
  let unavailable = false
  const updated = items.map(item => {
    if (!products.has(item.product.id)) return item
    const latest = products.get(item.product.id)
    const limit = getStockLimit(latest)
    if (!latest || limit === 0) {
      unavailable = true
      return { ...item, product: { ...item.product, stock: 0 } }
    }
    const quantity = Math.min(item.quantity, limit)
    if (quantity !== item.quantity || latest.price !== item.product.price) adjusted = true
    return { product: { ...item.product, ...latest }, quantity }
  })
  return { items: updated, adjusted, unavailable }
}

export function canCheckout(items, stockStatus) {
  return stockStatus === 'ready' && items.length > 0 && items.every(item =>
    Number.isSafeInteger(item.quantity) && item.quantity >= 1 &&
    item.quantity <= getStockLimit(item.product))
}
