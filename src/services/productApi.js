const PRODUCTS_URL = 'https://dummyjson.com/products/category/furniture'

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





