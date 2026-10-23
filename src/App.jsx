import ProductCollection from './components/products/ProductCollection'

function App() {
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
            <a
              href="#collection"
              className="rounded-full border border-black/15 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-white"
            >
              Explore collection <span aria-hidden="true">↗</span>
            </a>
          </nav>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-7xl px-5 sm:px-8">
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
      </main>
    </>
  )
}

export default App

