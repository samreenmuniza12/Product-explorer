import { useRef, useState } from 'react'
import { currency } from '../../utils/currency'
import { getStockLimit, canCheckout } from '../../utils/cartRules'
import { getCatalogUrl, navigateOnClick } from '../../utils/productNavigation'

export default function ShoppingCart({ items, onQuantityChange, onRemove, onConfirmOrder, stockStatus = 'checking' }) {
  const checkoutDialog = useRef(null)
  const [orderNumber, setOrderNumber] = useState(null)
  const checkoutAllowed = canCheckout(items, stockStatus)
  const fieldClassName = 'mt-1 w-full rounded-lg border border-black/20 px-3 py-2 text-base focus-visible:outline-2 focus-visible:outline-[#6d48e5]'

  function handlePlaceOrder(event) {
    event.preventDefault()
    if (!checkoutAllowed) return
    const number = `PE-${crypto.randomUUID().slice(0, 13).toUpperCase()}`
    checkoutDialog.current.close()
    setOrderNumber(number)
    onConfirmOrder()
  }
  const totalUnits = items.reduce((total, item) => total + item.quantity, 0)
  const subtotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0)
  const catalogUrl = getCatalogUrl()

  return (
    <section aria-labelledby="cart-title" className="mx-auto max-w-7xl py-12 sm:py-16">
      <h1 id="cart-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Your cart
      </h1>

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-black/10 bg-white p-8 text-center sm:p-12">
          {orderNumber ? (
            <>
              <h2
                tabIndex={-1}
                ref={(heading) => { heading?.focus() }}
                className="text-2xl font-semibold text-[#20201e]"
              >
                Order confirmed
              </h2>
              <p className="mt-2 mb-5 text-sm text-[#66665f]">
                Demo order number <strong>{orderNumber}</strong>
              </p>
            </>
          ) : (
            <p role="status" className="mb-5 text-base font-medium text-[#20201e]">
              Your cart is empty.
            </p>
          )}
          <a
            href={catalogUrl}
            onClick={(event) => navigateOnClick(event, catalogUrl)}
            className="inline-flex rounded-full bg-[#25251f] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25251f]"
          >
            Continue shopping
          </a>
        </div>
      ) : (
        <>
          <div className="mt-8 overflow-hidden rounded-2xl border border-black/10 bg-white">
            <div
              aria-hidden="true"
              className="hidden grid-cols-[minmax(0,1fr)_8rem_9rem_8rem_6rem] gap-4 border-b border-black/10 bg-[#eeeee8] px-6 py-4 text-xs font-semibold tracking-wider text-[#66665f] uppercase lg:grid"
            >
              <span>Product</span>
              <span>Unit price</span>
              <span>Quantity</span>
              <span>Line total</span>
              <span />
            </div>

            <ul aria-label="Cart items" className="m-0 list-none divide-y divide-black/10 p-0">
              {items.map(({ product, quantity }) => (
                <li
                  key={product.id}
                  className="grid grid-cols-2 gap-x-4 gap-y-4 p-5 lg:grid-cols-[minmax(0,1fr)_8rem_9rem_8rem_6rem] lg:items-center lg:gap-4 lg:px-6"
                >
                  <div className="col-span-2 lg:col-span-1">
                    <h2 className="text-base font-semibold leading-snug">{product.name}</h2>
                    <p className={`mt-2 text-sm ${stockStatus === 'ready' && getStockLimit(product) === 0 ? 'text-red-700' : 'text-[#66665f]'}`}>
                      {stockStatus !== 'ready' ? 'Availability not verified yet.'
                        : getStockLimit(product) === 0 ? 'Unavailable. Remove this item to continue.'
                        : `${getStockLimit(product)} available`}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-[#66665f] lg:hidden">Unit price</p>
                    <p>{currency.format(product.price)}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-[#66665f] lg:hidden">Quantity</p>
                    <div className="inline-flex items-center rounded-lg border border-black/15">
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${product.name}`}
                        disabled={quantity <= 1 || stockStatus !== 'ready' || getStockLimit(product) === 0}
                        onClick={() => onQuantityChange(product.id, quantity - 1)}
                        className="grid size-10 place-items-center rounded-l-lg text-lg transition-colors hover:bg-[#eeeee8] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#6d48e5]"
                      >
                        <span aria-hidden="true">−</span>
                      </button>
                      <span className="min-w-9 text-center tabular-nums" aria-live="polite">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${product.name}`}
                        disabled={stockStatus !== 'ready' || quantity >= getStockLimit(product)}
                        onClick={() => onQuantityChange(product.id, quantity + 1)}
                        className="grid size-10 place-items-center rounded-r-lg text-lg transition-colors hover:bg-[#eeeee8] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#6d48e5]"
                      >
                        <span aria-hidden="true">+</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-[#66665f] lg:hidden">Line total</p>
                    <p className="font-semibold">{currency.format(product.price * quantity)}</p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${product.name} from cart`}
                    onClick={() => onRemove(product.id)}
                    className="justify-self-start rounded-sm text-sm font-medium text-[#6d48e5] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6d48e5] lg:justify-self-end"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <section
            aria-labelledby="cart-summary-title"
            className="ml-auto mt-6 w-full max-w-sm rounded-2xl border border-black/10 bg-white p-6"
          >
            <h2 id="cart-summary-title" className="text-lg font-semibold">
              Cart summary
            </h2>
            <dl className="mt-4 space-y-3">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-sm text-[#66665f]">Total units</dt>
                <dd className="font-medium tabular-nums">{totalUnits}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-t border-black/10 pt-3">
                <dt className="text-sm text-[#66665f]">Subtotal</dt>
                <dd className="text-2xl font-semibold tabular-nums">
                  {currency.format(subtotal)}
                </dd>
              </div>
            </dl>
            <button
              type="button"
              aria-haspopup="dialog"
              disabled={!checkoutAllowed}
              aria-describedby="cart-checkout-help"
              onClick={() => checkoutDialog.current.showModal()}
              className="mt-5 w-full rounded-full bg-[#25251f] px-5 py-3 text-sm font-semibold text-white enabled:hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25251f]"
            >
              Proceed to checkout
            </button>
            <p id="cart-checkout-help" className="mt-3 text-sm text-[#66665f]">
              {stockStatus === 'checking' ? 'Checking current prices and stock...'
                : stockStatus === 'error' ? 'Retry the availability check above to continue.'
                : !checkoutAllowed ? 'Remove unavailable items before checkout.'
                : 'Availability checked. This is a demo checkout; no payment is taken.'}
            </p>

            <dialog
              ref={checkoutDialog}
              aria-labelledby="checkout-review-title"
              className="m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl bg-white p-6 text-[#20201e] backdrop:bg-black/50"
            >
              <h2 id="checkout-review-title" className="text-xl font-semibold">
                Checkout review
              </h2>
              <p className="mt-2 text-sm text-[#66665f]">
                Review your items and use sample delivery details to place a demo order.
              </p>

              <ul className="mt-4 list-none divide-y divide-black/10 p-0">
                {items.map(({ product, quantity }) => (
                  <li key={product.id} className="flex justify-between gap-4 py-2 text-sm">
                    <span>{product.name} ({quantity})</span>
                    <span className="shrink-0">{currency.format(product.price * quantity)}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-3 flex justify-between gap-4 border-t border-black/10 pt-3 font-semibold">
                <span>Subtotal</span>
                <span>{currency.format(subtotal)}</span>
              </p>

              <form onSubmit={handlePlaceOrder} className="mt-5 space-y-4">
                <fieldset className="min-w-0 space-y-3">
                  <legend className="mb-2 font-semibold">Delivery details</legend>
                  <label className="block text-sm font-medium">
                    Phone number
                    <input
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      pattern="\+?(?:[0-9][ \-]?){6,14}[0-9]"
                      title="Enter 7 to 15 digits. Spaces and dashes are allowed."
                      required
                      className={fieldClassName}
                    />
                  </label>
                  <label className="block text-sm font-medium">
                    Delivery address
                    <input
                      name="address"
                      autoComplete="street-address"
                      pattern=".*\S.*"
                      maxLength={200}
                      required
                      className={fieldClassName}
                    />
                  </label>
                  <label className="block text-sm font-medium">
                    Region / province
                    <input
                      name="region"
                      autoComplete="address-level1"
                      pattern=".*\S.*"
                      maxLength={80}
                      required
                      className={fieldClassName}
                    />
                  </label>
                </fieldset>

                <fieldset className="space-y-2">
                  <legend className="mb-2 font-semibold">Payment method</legend>
                  <label className="flex items-center gap-3 rounded-lg border border-black/20 px-3 py-2 text-sm">
                    <input type="radio" name="paymentMethod" value="cash" required />
                    Cash on delivery
                  </label>
                  <label className="flex items-center gap-3 rounded-lg border border-black/20 px-3 py-2 text-sm">
                    <input type="radio" name="paymentMethod" value="card" />
                    Card (demo)
                  </label>
                </fieldset>

                <div className="flex flex-wrap gap-3">
                  <button type="submit" disabled={!checkoutAllowed} className="disabled:cursor-not-allowed disabled:opacity-50 rounded-full bg-[#25251f] px-5 py-2 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-4">
                    Place demo order
                  </button>
                  <button
                    type="button"
                    onClick={() => checkoutDialog.current.close()}
                    className="rounded-full border border-black/20 px-5 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4"
                  >
                    Back to cart
                  </button>
                </div>
              </form>
            </dialog>
          </section>
        </>
      )}
    </section>
  )
}
