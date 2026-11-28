import { useEffect, useState } from 'react'
import ProductCollection from './components/products/ProductCollection'
import ProductDetails from './components/products/ProductDetails'
import ShoppingCart from './components/products/ShoppingCart'
import { loadCartItems, saveCartItems } from './services/cartStorage'
import { getCartUrl, getCatalogUrl, navigateOnClick } from './utils/productNavigation'
import { getProductById } from './services/productApi'
import { addCartItem, changeCartQuantity, reconcileCart } from './utils/cartRules'

function App() {
  const [productId, setProductId] = useState(
    () => new URLSearchParams(window.location.search).get('productId'),
  )
  const [isCartView, setIsCartView] = useState(
    () => new URLSearchParams(window.location.search).get('view') === 'cart',
  )
  const [cart, setCart] = useState(() => {
    const items = loadCartItems()
    return { items, stockStatus: items.length ? 'checking' : 'ready', notice: '' }
  })
  const { items: cartItems, stockStatus, notice } = cart
  const [stockCheckIds, setStockCheckIds] = useState(() => cartItems.map(item => item.product.id))

  useEffect(() => {
    if (stockCheckIds.length === 0) return undefined
    const controller = new AbortController()
    async function checkSavedStock() {
      try {
        const availability = await Promise.all(stockCheckIds.map(async id => ({
          id, product: await getProductById(id, controller.signal),
        })))
        if (controller.signal.aborted) return
        setCart(current => {
          const result = reconcileCart(current.items, availability)
          const messages = []
          if (result.adjusted) messages.push('Cart quantities or prices were updated to current availability.')
          if (result.unavailable) messages.push('An item is unavailable. Remove it to continue to checkout.')
          return { items: result.items, stockStatus: 'ready', notice: messages.join(' ') }
        })
      } catch {
        if (!controller.signal.aborted) {
          setCart(current => current.items.some(item => stockCheckIds.includes(item.product.id))
            ? { ...current, stockStatus: 'error', notice: '' } : current)
        }
      }
    }
    checkSavedStock()
    return () => controller.abort()
  }, [stockCheckIds])

  function retryStockCheck() {
    setCart(current => ({ ...current, stockStatus: current.items.length ? 'checking' : 'ready', notice: '' }))
    setStockCheckIds(cartItems.map(item => item.product.id))
  }

  useEffect(() => {
    saveCartItems(cartItems)
  }, [cartItems])

  useEffect(() => {
    function handlePopState() {
      const params = new URLSearchParams(window.location.search)
      setProductId(params.get('productId'))
      setIsCartView(params.get('view') === 'cart')
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const catalogUrl = getCatalogUrl()
  const cartUrl = getCartUrl()
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  function addToCart(product) {
    setCart(current => {
      if (current.stockStatus !== 'ready') return current
      const items = addCartItem(current.items, product)
      return { ...current, items, notice: items === current.items
        ? `No more ${product.name} are available.` : `Added ${product.name} to your cart.` }
    })
  }

  function updateCartQuantity(productId, quantity) {
    setCart(current => current.stockStatus !== 'ready' ? current : ({
      ...current, items: changeCartQuantity(current.items, productId, quantity), notice: '',
    }))
  }

  function removeFromCart(productId) {
    setCart(current => {
      const items = current.items.filter(item => item.product.id !== productId)
      return { ...current, items, stockStatus: items.length ? current.stockStatus : 'ready', notice: '' }
    })
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-white focus:p-4"
      >
        Skip to content
      </a>

      <header className="border-b border-black/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-6 sm:px-8">
          <a
            href="./"
            aria-label="Product Explorer home"
            className="flex items-center gap-3 text-lg font-bold tracking-tight"
          >
            <span
              aria-hidden="true"
              className="grid size-9 place-items-center rounded-xl bg-[#20201e] text-white"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            Product Explorer<span className="text-[#6d48e5]">.</span>
          </a>

          <nav aria-label="Main navigation">
            <div className="flex items-center gap-3">
              <a
                href={productId || isCartView ? catalogUrl : '#collection'}
                onClick={
                  productId || isCartView
                    ? (event) => navigateOnClick(event, catalogUrl, true)
                    : undefined
                }
                className="rounded-full border border-black/15 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25251f]"
              >
                Explore collection <span aria-hidden="true">↗</span>
              </a>
              <a
                href={cartUrl}
                aria-current={isCartView ? 'page' : undefined}
                onClick={(event) => {
                  const currentCartUrl = getCartUrl()
                  event.currentTarget.href = currentCartUrl
                  navigateOnClick(event, currentCartUrl)
                }}
                className="rounded-full border border-black/15 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25251f]"
              >
                Cart <span aria-hidden="true">({cartCount})</span>
                <span className="sr-only">
                  , {cartCount} {cartCount === 1 ? 'unit' : 'units'}
                </span>
              </a>
            </div>
          </nav>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-5 sm:px-8">
        {stockStatus === 'checking' && <p role="status" className="mt-5 rounded-lg bg-[#eeeee8] p-4 text-sm">Checking saved cart availability...</p>}
        {stockStatus === 'error' && <div role="alert" className="mt-5 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm">
          <p>Cart availability could not be checked. Your items are still here. Retry before adding more or checking out.</p>
          <button type="button" onClick={retryStockCheck} className="mt-2 min-h-11 rounded-lg px-3 font-semibold underline focus-visible:outline-2 focus-visible:outline-offset-2">Retry stock check</button>
        </div>}
        {notice && <p role="status" className="mt-5 rounded-lg bg-[#eeeee8] p-4 text-sm">{notice}</p>}
        {isCartView ? (
          <ShoppingCart
            items={cartItems}
            onQuantityChange={updateCartQuantity}
            onRemove={removeFromCart}
            stockStatus={stockStatus}
            onConfirmOrder={() => setCart({ items: [], stockStatus: 'ready', notice: '' })}
          />
        ) : productId ? (
          <ProductDetails productId={productId} onAddToCart={addToCart}
            cartReady={stockStatus === 'ready'}
            cartQuantity={cartItems.find(item => item.product.id === Number(productId))?.quantity ?? 0} />
        ) : (
          <>
            <section aria-labelledby="hero-title" className="py-16 sm:py-24">
              <div className="grid items-end gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
                <div>
                  <p className="mb-6 flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase">
                    <span aria-hidden="true" className="size-2 rounded-full bg-[#6d48e5]" />
                    A little less searching
                  </p>
                  <h1
                    id="hero-title"
                    className="max-w-3xl text-5xl leading-[1.06] font-semibold tracking-[-0.055em] sm:text-7xl lg:text-8xl"
                  >
                    Find your next
                    <br />
                    <span className="text-[#6d48e5]">good find.</span>
                  </h1>
                </div>

                <p className="max-w-sm text-base leading-7 text-[#66665f] sm:text-lg sm:leading-8">
                  Explore the details. Compare your options.
                  Discover products that fit your everyday.
                </p>
              </div>
            </section>

            <section
              id="collection"
              aria-labelledby="collection-title"
              className="scroll-mt-8 border-t border-black/15 py-8"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 id="collection-title" className="text-2xl font-semibold tracking-tight">
                  The collection
                </h2>
                <p className="text-sm text-[#66665f]">Discover. Compare. Decide.</p>
              </div>
              <ProductCollection />
            </section>
          </>
        )}
      </main>
    </>
  )
}

export default App

