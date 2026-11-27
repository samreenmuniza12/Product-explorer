import assert from 'node:assert/strict'
import test from 'node:test'
import { loadCartItems, saveCartItems } from './cartStorage.js'

test('loads the saved cart quantity', (t) => {
  const storage = new Map()
  globalThis.window = {
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => { storage.set(key, value) },
    },
  }

  t.after(() => { delete globalThis.window })

  const cart = [
    { product: { id: 1, name: 'Desk Lamp', price: 25 }, quantity: 3 },
  ]

  saveCartItems(cart)

  assert.deepEqual(loadCartItems(), cart)
})

test('returns an empty cart when saved JSON is invalid', (t) => {
  globalThis.window = {
    localStorage: {
      getItem: () => '{broken JSON',
    },
  }

  t.after(() => { delete globalThis.window })
  const warn = t.mock.method(console, 'warn', () => {})

  assert.deepEqual(loadCartItems(), [])
  assert.equal(warn.mock.callCount(), 1)
})
