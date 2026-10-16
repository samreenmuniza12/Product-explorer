import { products } from '../../data/products'

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
  return (
    <div className="mt-8">
      <p className="mb-5 text-sm text-[#66665f]">
        A preview of everyday spaces. Sample products and prices.
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
    </div>
  )
}
