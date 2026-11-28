import assert from 'node:assert/strict'
import test from 'node:test'
import { currency } from './currency.js'

test('preserves cents in product prices and line totals', () => {
  assert.equal(currency.format(9.99), '$9.99')
  assert.equal(currency.format(3.49), '$3.49')
  assert.equal(currency.format(3.49 * 2), '$6.98')
})

test('formats whole-dollar and zero prices consistently', () => {
  assert.equal(currency.format(25), '$25.00')
  assert.equal(currency.format(0), '$0.00')
})
