export function getCatalogUrl() {
  const url = new URL(window.location.href)
  url.searchParams.delete('productId')
  url.searchParams.delete('view')
  return `${url.pathname}${url.search}${url.hash}`
}

export function getCartUrl() {
  const url = new URL(window.location.href)
  url.searchParams.delete('productId')
  url.searchParams.set('view', 'cart')
  return `${url.pathname}${url.search}${url.hash}`
}

export function getProductDetailsUrl(productId) {
  const url = new URL(window.location.href)
  url.searchParams.set('productId', productId)
  url.searchParams.delete('view')
  return `${url.pathname}${url.search}${url.hash}`
}

export function navigateOnClick(event, href, replace = false) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.currentTarget.target && event.currentTarget.target !== '_self' ||
    event.currentTarget.hasAttribute('download')
  ) {
    return
  }

  event.preventDefault()
  const method = replace ? 'replaceState' : 'pushState'
  window.history[method](window.history.state, '', href)
  window.dispatchEvent(new PopStateEvent('popstate'))
}
