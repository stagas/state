import assert from 'node:assert'
import test from 'node:test'
import { derive, nullable, state } from './state.ts'

console.log('---')

test('state', () => {
  const $ = state({
    count: 42,
    foo: nullable('bar'),
    nullable: nullable<string>(null),
    a: 11,
    b: 22,
    c: 33,
    sum: derive<number>($$ => {
      const { a, b, nullable } = $.of($)
      $$(42) // default value when dependencies are missing
      const { c } = $
      return a + b + c
    }),
  })

  assert.ok($)
  assert.equal($.count, 42)
  assert.strictEqual($.sum, 42)

  let i = 0
  let x = 0

  $.fx(() => {
    const { count, nullable } = $.of($) // reactive
    $() // stop subscribing to signals here and break if missing any dependencies
    i++
    const { foo } = $ // not reactive because it's after the break
    x = count
  })

  assert.equal(i, 0)
  $.count = 42
  assert.equal(i, 0)

  $.nullable = 'something'
  assert.equal(i, 1)
  assert.equal(x, 42)

  $.foo = 'baz'
  assert.equal(i, 1)

  assert.equal($.sum, 66)
  $.a = 12
  assert.equal($.sum, 67)
  $.c = 34 // should not trigger
  assert.equal($.sum, 67)
})
