import { useEffect, useState } from 'react'
import { getProductById } from '../../services/productApi'
import { currency } from '../../utils/currency'
import { getStockLimit } from '../../utils/cartRules'
import { getCatalogUrl, navigateOnClick } from '../../utils/productNavigation'

function BackToProducts() {
  const catalogUrl = getCatalogUrl()

  return (
    <a
      href={catalogUrl}
      onClick={(event) => navigateOnClick(event, catalogUrl, true)}
      className="inline-flex rounded-sm text-sm font-medium text-[#6d48e5] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6d48e5]"
    >
      Back to products
    </a>
  )
}

export default function ProductDetails({ productId, onAddToCart, cartReady = true, cartQuantity = 0 }) {
  const [request, setRequest] = useState({ key: null, status: 'loading', product: null })
  const [attempt, setAttempt] = useState(0)
  const numericId = Number(productId)
  const isValidId = Number.isSafeInteger(numericId) && numericId > 0
  const requestKey = `${productId}:${attempt}`
  const requestMatches = request.key === requestKey
  const status = !isValidId
    ? 'not-found'
    : requestMatches
      ? request.status
      : 'loading'
  const product = requestMatches ? request.product : null
  const availableStock = getStockLimit(product)
  const atStockLimit = cartQuantity >= availableStock
  const addDisabled = !cartReady || availableStock === 0 || atStockLimit

  useEffect(() => {
    if (!isValidId) return undefined

    const controller = new AbortController()
    let isCurrent = true

    async function loadProduct() {
      try {
        const result = await getProductById(numericId, controller.signal)

        if (!isCurrent) return

        setRequest({
          key: requestKey,
          status: result ? 'success' : 'not-found',
          product: result,
        })
      } catch {
        if (!isCurrent) return

        setRequest({ key: requestKey, status: 'error', product: null })
      }
    }

    loadProduct()

    return () => {
      isCurrent = false
      controller.abort()
    }
  }, [isValidId, numericId, productId, requestKey])

  return (
    <section className="mx-auto max-w-7xl py-8 sm:py-12" aria-busy={status === 'loading'}>
      <BackToProducts />

      {status === 'loading' && (
        <p role="status" className="py-16 text-center text-[#66665f]">
          Loading product details...
        </p>
      )}

      {status === 'not-found' && (
        <div className="py-16 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Product not found</h1>
          <p className="mt-3 text-[#66665f]">
            This product may have been removed or the link may be incorrect.
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="py-16 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Unable to load product</h1>
          <p role="alert" className="mt-3 text-[#66665f]">
            Check your connection and try again.
          </p>
          <button
            type="button"
            onClick={() => setAttempt((previous) => previous + 1)}
            className="mt-5 rounded-full bg-[#25251f] px-6 py-3 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25251f]"
          >
            Retry
          </button>
        </div>
      )}

      {status === 'success' && product && (
        <article className="mt-8 grid overflow-hidden rounded-3xl border border-black/10 bg-white lg:grid-cols-2">
          <div className="flex min-h-72 items-center justify-center bg-[#eeeee8] p-8 sm:min-h-96 sm:p-12">
            <img
              src={product.image}
              alt={`Image of ${product.name}`}
              className="max-h-[32rem] w-full object-contain"
            />
          </div>

          <div className="p-6 sm:p-10 lg:p-12">
            <p className="text-xs font-medium tracking-widest text-[#716f68] uppercase">
              {product.category}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-5 text-base leading-7 text-[#66665f]">
              {product.description}
            </p>
            <p className="mt-8 text-3xl font-semibold">{currency.format(product.price)}</p>
            <button
              type="button"
              disabled={addDisabled}
              aria-describedby="product-cart-help"
              onClick={() => onAddToCart(product)}
              className="mt-5 rounded-full bg-[#25251f] px-6 py-3 text-sm font-medium text-white transition-colors enabled:hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25251f]"
            >
              {availableStock === 0 ? 'Out of stock' : atStockLimit ? 'Maximum in cart' : 'Add to cart'}
            </button>
            <p id="product-cart-help" role="status" className="mt-3 text-sm text-[#66665f]">
              {!cartReady ? 'Wait for the cart availability check, or retry it above.'
                : availableStock === 0 ? 'This product is currently unavailable.'
                : atStockLimit ? `All ${availableStock} available units are already in your cart.`
                : `${availableStock} available. ${cartQuantity} in your cart.`}
            </p>
            <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-black/10 pt-6">
              <div>
                <dt className="text-sm text-[#66665f]">Rating</dt>
                <dd className="mt-1 font-medium">{product.rating} / 5</dd>
              </div>
              <div>
                <dt className="text-sm text-[#66665f]">Stock</dt>
                <dd className="mt-1 font-medium">{availableStock} available</dd>
              </div>
            </dl>
          </div>
        </article>
      )}
    </section>
  )
}
