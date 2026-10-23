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
          <p role="status" className="mb-5 text-sm text-[#66665f]">
            {products.length === 0
              ? 'No products available right now.'
              : `${products.length} products. Demo catalogue powered by DummyJSON.`}
          </p>

          <ul
            aria-label="Product collection"
            className="grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 lg:grid-cols-4"
          >
            {products.map((product) => (
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
