import { useEffect, useState } from 'react'
import { getProducts } from '../../services/productApi'

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

function ProductCard({ product }) {
  return (
    <article className="h-full overflow-hidden rounded-2xl border border-black/10 bg-white">
      <div className="aspect-[4/3] bg-[#eeeee8] p-6 sm:p-8">
        <img
          src={product.image}
          alt={product.name}
          width="400"
          height="300"
          loading="lazy"
          className="h-full w-full object-contain"
        />
      </div>

      <div className="p-5">
        <p className="text-xs font-medium tracking-widest text-[#716f68] uppercase">
          {product.category}
        </p>
        <h3 className="mt-2 text-lg leading-snug font-semibold tracking-tight">
          {product.name}
        </h3>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-black/10 pt-4">
          <p className="text-lg font-semibold">
            {currency.format(product.price)}
          </p>
          <span className="text-xs text-[#716f68]">USD</span>
        </div>
      </div>
    </article>
  )
}

export default function ProductCollection() {
  const [products, setProducts] = useState([])
  const [status, setStatus] = useState('loading')
  const [attempt, setAttempt] = useState(0)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('default')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  const minimum = minPrice === '' ? 0 : Number(minPrice)
  const maximum = maxPrice === '' ? Infinity : Number(maxPrice)
  const invalidRange = minimum > maximum

  const query = search.trim().toLowerCase()
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(query) &&
    product.price >= minimum &&
    product.price <= maximum,
  )

  useEffect(() => {
    const controller = new AbortController()

    async function loadProducts() {
      try {
        const items = await getProducts(controller.signal)

        if (controller.signal.aborted) return

        setProducts(items)
        setStatus('success')
      } catch {
        if (controller.signal.aborted) return

        setStatus('error')
      }
    }

    loadProducts()

    return () => controller.abort()
  }, [attempt])

  function handleRetry() {
    setStatus('loading')
    setAttempt((previous) => previous + 1)
  }

  const visibleProducts = [...filteredProducts].sort((a, b) => {
    if (sort === 'price-asc') return a.price - b.price
    if (sort === 'price-desc') return b.price - a.price
    if (sort === 'name-asc') return a.name.localeCompare(b.name)
    return 0
  })

  return (
    <div className="mt-8" aria-busy={status === 'loading'}>
      {status === 'loading' && (
        <p role="status" className="py-12 text-center text-[#66665f]">
          Loading products...
        </p>
      )}

      {status === 'error' && (
        <div className="rounded-2xl border border-black/10 bg-white p-8 text-center">
          <p role="alert" className="text-[#66665f]">
            Products could not be loaded. Check your connection and try again.
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="mt-5 rounded-full bg-[#25251f] px-6 py-3 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25251f]"
          >
            Retry
          </button>
        </div>
      )}

      {status === 'success' && (
        <>
          <div className="mb-6">
            <label htmlFor="product-search" className="mb-2 block text-sm font-medium">
              Search products
            </label>
            <input
              id="product-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Try chair or table"
              className="w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25251f] sm:max-w-md"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="product-sort" className="mb-2 block text-sm font-medium">
              Sort by
            </label>
            <select
              id="product-sort"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25251f] sm:max-w-md"
            >
              <option value="default">Default order</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
          </div>

          <fieldset className="mb-6 sm:max-w-md">
            <legend className="mb-2 text-sm font-medium">Price range (USD)</legend>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="min-price" className="mb-2 block text-sm">
                  Minimum price
                </label>
                <input
                  id="min-price"
                  type="number"
                  min="0"
                  step="any"
                  value={minPrice}
                  onChange={(event) => setMinPrice(event.target.value)}
                  placeholder="No minimum"
                  aria-invalid={invalidRange}
                  aria-describedby={invalidRange ? 'price-error' : undefined}
                  className="w-full rounded-xl border border-black/20 bg-white px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25251f]"
                />
              </div>
              <div>
                <label htmlFor="max-price" className="mb-2 block text-sm">
                  Maximum price
                </label>
                <input
                  id="max-price"
                  type="number"
                  min="0"
                  step="any"
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                  placeholder="No maximum"
                  aria-invalid={invalidRange}
                  aria-describedby={invalidRange ? 'price-error' : undefined}
                  className="w-full rounded-xl border border-black/20 bg-white px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25251f]"
                />
              </div>
            </div>
            {invalidRange && (
              <p id="price-error" role="alert" className="mt-2 text-sm text-red-700">
                Maximum price must be equal to or greater than minimum price.
              </p>
            )}
          </fieldset>

          <p role="status" className="mb-5 text-sm text-[#66665f]">
            {products.length === 0
              ? 'No products available right now.'
              : filteredProducts.length === 0
                ? 'No matching products. Try another search.'
                : `${filteredProducts.length} of ${products.length} products. Demo catalogue powered by DummyJSON.`}
          </p>

          <ul
            aria-label="Product collection"
            className="grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 lg:grid-cols-4"
          >
            {visibleProducts.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
