const PRODUCTS_URL = 'https://dummyjson.com/products?limit=0&select=id,title,category,price,thumbnail'
const PRODUCT_URL = 'https://dummyjson.com/products/'

export async function getProducts(signal) {
  const response = await fetch(PRODUCTS_URL, { signal })

  if (!response.ok) {
    throw new Error('Products could not be loaded. Please try again.')
  }

  const data = await response.json()

  if (!Array.isArray(data.products)) {
    throw new Error('The server returned an unexpected response.')
  }

  return data.products.map((product) => ({
    id: product.id,
    name: product.title,
    category: product.category,
    price: product.price,
    image: product.thumbnail,
  }))
}

export async function getProductById(id, signal) {
  const response = await fetch(`${PRODUCT_URL}${encodeURIComponent(id)}`, { signal })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error('The product could not be loaded. Please try again.')
  }

  const product = await response.json()

  if (!product || typeof product !== 'object' || !product.id || !product.title) {
    throw new Error('The server returned an unexpected response.')
  }

  return {
    id: product.id,
    name: product.title,
    category: product.category,
    description: product.description,
    price: product.price,
    image: product.thumbnail || product.images?.[0] || '',
    rating: product.rating,
    stock: product.stock,
  }
}

