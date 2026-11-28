import assert from 'node:assert/strict'
import test from 'node:test'
import { addCartItem, changeCartQuantity, reconcileCart, canCheckout, getStockLimit } from './cartRules.js'

const product = { id: 1, name: 'Desk Lamp', price: 3.49, stock: 2 }
const item = { product, quantity: 1 }

test('adds a product and merges repeat additions without duplicates', () => {
  const once = addCartItem([], product)
  const twice = addCartItem(once, product)
  assert.equal(twice.length, 1)
  assert.equal(twice[0].quantity, 2)
  assert.equal(once[0].quantity, 1)
})

test('does not add products beyond available stock', () => {
  const items = [{ product, quantity: 2 }]
  assert.strictEqual(addCartItem(items, product), items)
})

test('zero, missing or invalid stock cannot be added', () => {
  for (const stock of [0, undefined, null, -1, 1.5, Infinity, '2']) {
    assert.equal(addCartItem([], { ...product, stock }).length, 0)
    assert.equal(getStockLimit({ stock }), 0)
  }
})

test('quantity changes respect minimum and stock maximum', () => {
  assert.equal(changeCartQuantity([item], 1, 99)[0].quantity, 2)
  assert.equal(changeCartQuantity([item], 1, 0)[0].quantity, 1)
  assert.equal(item.quantity, 1)
})

test('invalid quantity updates do not change the cart', () => {
  const items = [item]
  for (const value of [NaN, Infinity, 1.5, '2']) {
    assert.strictEqual(changeCartQuantity(items, 1, value), items)
  }
})

test('updating an item leaves other items unchanged', () => {
  const other = { product: { ...product, id: 2 }, quantity: 1 }
  const result = changeCartQuantity([item, other], 1, 2)
  assert.strictEqual(result[1], other)
})

test('refreshing availability reduces excess quantities and updates prices', () => {
  const saved = [{ product: { id: 1, name: 'Old name', price: 2 }, quantity: 8 }]
  const result = reconcileCart(saved, [{ id: 1, product }])
  assert.equal(result.items[0].quantity, 2)
  assert.equal(result.items[0].product.price, 3.49)
  assert.equal(result.items[0].product.name, 'Desk Lamp')
  assert.equal(result.adjusted, true)
  assert.equal(saved[0].quantity, 8)
})

test('removed or sold-out products remain visible for manual removal', () => {
  for (const latest of [null, { ...product, stock: 0 }]) {
    const result = reconcileCart([item], [{ id: 1, product: latest }])
    assert.equal(result.items.length, 1)
    assert.equal(result.items[0].product.stock, 0)
    assert.equal(result.unavailable, true)
    assert.equal(canCheckout(result.items, 'ready'), false)
  }
})

test('an availability response does not restore a removed cart item', () => {
  assert.deepEqual(reconcileCart([], [{ id: 1, product }]).items, [])
})

test('checkout waits for stock verification and blocks unavailable items', () => {
  assert.equal(canCheckout([item], 'checking'), false)
  assert.equal(canCheckout([item], 'error'), false)
  assert.equal(canCheckout([item], 'ready'), true)
  assert.equal(canCheckout([], 'ready'), false)
  assert.equal(canCheckout([{ product, quantity: 3 }], 'ready'), false)
  assert.equal(canCheckout([{ product: { ...product, stock: undefined }, quantity: 1 }], 'ready'), false)
})

test('unchanged stock preserves quantities and does not report an adjustment', () => {
  const result = reconcileCart([item], [{ id: 1, product }])
  assert.deepEqual(result.items, [item])
  assert.equal(result.adjusted, false)
  assert.equal(result.unavailable, false)
})
