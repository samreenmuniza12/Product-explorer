const CART_STORAGE_KEY = 'product-explorer-cart'

function isValidCartRecord(record) {
  return (
    record !== null &&
    typeof record === 'object' &&
    Number.isSafeInteger(record.id) &&
    record.id > 0 &&
    typeof record.name === 'string' &&
    record.name.trim() !== '' &&
    typeof record.price === 'number' &&
    Number.isFinite(record.price) &&
    record.price >= 0 &&
    Number.isSafeInteger(record.quantity) &&
    record.quantity >= 1
  )
}

export function loadCartItems() {
  if (typeof window === 'undefined') return []

  let serializedItems
  try {
    serializedItems = window.localStorage.getItem(CART_STORAGE_KEY)
  } catch (error) {
    console.warn('Cart data could not be read from local storage.', error)
    return []
  }

  if (serializedItems === null) return []

  let records
  try {
    records = JSON.parse(serializedItems)
  } catch (error) {
    console.warn('Saved cart data is invalid JSON.', error)
    return []
  }

  if (!Array.isArray(records) || !records.every(isValidCartRecord)) {
    console.warn('Saved cart data contains invalid records.')
    return []
  }

  const productIds = records.map((record) => record.id)
  if (new Set(productIds).size !== productIds.length) {
    console.warn('Saved cart data contains duplicate products.')
    return []
  }

  return records.map(({ id, name, price, quantity }) => ({
    product: { id, name, price },
    quantity,
  }))
}

export function saveCartItems(items) {
  if (typeof window === 'undefined') return

  const records = items.map(({ product, quantity }) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    quantity,
  }))

  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(records))
  } catch (error) {
    console.warn('Cart changes could not be saved to local storage.', error)
  }
}
