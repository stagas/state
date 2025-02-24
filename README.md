# @stagas/state

Minimalistic signals state management for React, Preact, and more.

Uses the wonderful [@preact/signals](https://preactjs.com/guide/v10/signals/) under the hood and provides a minimalistic API to use signals anywhere in your code.

Supports React / Preact.

```ts
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

$.fx(() => {
  const { count, nullable } = $.of($) // reactive
  $() // stop subscribing to signals here and break if missing any dependencies
  i++
  const { foo } = $ // not reactive because it's after the break
  x = count
})
```

## License

MIT
