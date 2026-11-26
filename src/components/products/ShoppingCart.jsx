import { currency } from '../../utils/currency'
import { getCatalogUrl, navigateOnClick } from '../../utils/productNavigation'

export default function ShoppingCart({ items, onQuantityChange, onRemove }) {
  const subtotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0)
  const catalogUrl = getCatalogUrl()

  return (
    <section aria-labelledby="cart-title" className="mx-auto max-w-7xl py-12 sm:py-16">
      <h1 id="cart-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Your cart
      </h1>

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-black/10 bg-white p-8 text-center sm:p-12">
          <p className="text-[#66665f]">Your cart is empty.</p>
          <a
            href={catalogUrl}
            onClick={(event) => navigateOnClick(event, catalogUrl)}
            className="mt-5 inline-flex rounded-full bg-[#25251f] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25251f]"
          >
            Continue shopping
          </a>
        </div>
      ) : (
        <>
          <div className="mt-8 overflow-hidden rounded-2xl border border-black/10 bg-white">
            <div
              aria-hidden="true"
              className="hidden grid-cols-[minmax(0,1fr)_8rem_9rem_8rem_6rem] gap-4 border-b border-black/10 bg-[#eeeee8] px-6 py-4 text-xs font-semibold tracking-wider text-[#66665f] uppercase sm:grid"
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
                  className="grid grid-cols-2 gap-x-4 gap-y-4 p-5 sm:grid-cols-[minmax(0,1fr)_8rem_9rem_8rem_6rem] sm:items-center sm:gap-4 sm:px-6"
                >
                  <h2 className="col-span-2 text-base font-semibold leading-snug sm:col-span-1">
                    {product.name}
                  </h2>
                  <div>
                    <p className="mb-1 text-xs text-[#66665f] sm:hidden">Unit price</p>
                    <p>{currency.format(product.price)}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-[#66665f] sm:hidden">Quantity</p>
                    <div className="inline-flex items-center rounded-lg border border-black/15">
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${product.name}`}
                        disabled={quantity <= 1}
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
                        onClick={() => onQuantityChange(product.id, quantity + 1)}
                        className="grid size-10 place-items-center rounded-r-lg text-lg transition-colors hover:bg-[#eeeee8] focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#6d48e5]"
                      >
                        <span aria-hidden="true">+</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-[#66665f] sm:hidden">Line total</p>
                    <p className="font-semibold">{currency.format(product.price * quantity)}</p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${product.name} from cart`}
                    onClick={() => onRemove(product.id)}
                    className="justify-self-start rounded-sm text-sm font-medium text-[#6d48e5] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6d48e5] sm:justify-self-end"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="ml-auto mt-6 flex max-w-sm items-baseline justify-between gap-6 border-t border-black/15 pt-5">
            <h2 className="text-lg font-semibold">Subtotal</h2>
            <p className="text-2xl font-semibold tabular-nums">{currency.format(subtotal)}</p>
          </div>
        </>
      )}
    </section>
  )
}
