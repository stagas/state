/** @jsxImportSource preact */

import { GlobalRegistrator } from '@happy-dom/global-registrator'
GlobalRegistrator.register()

import { render } from '@testing-library/preact'
import { expect } from 'expect'
import test from 'node:test'
import { nullable, state, use } from './preact.ts'

console.log('---')

test('jsx', async () => {
  let trigger: (() => void) | undefined

  const App = () => {
    const $ = use({
      count: 42,
    })
    trigger = () => {
      $.count = 69
    }

    return <div>{$.count}</div>
  }

  const app = render(<App />)

  expect(app.container.textContent).toBe('42')

  trigger?.()

  await new Promise<void>(queueMicrotask)

  expect(app.container.textContent).toBe('69')
})

test('jsx external', async () => {
  const $ = state({
    count: 42,
  })

  const App = () => {

    return <div>{$.count}</div>
  }

  const app = render(<App />)

  expect(app.container.textContent).toBe('42')

  $.count = 69

  await new Promise<void>(queueMicrotask)

  expect(app.container.textContent).toBe('69')
})

test('jsx nullable', async () => {
  let trigger: (() => void) | undefined

  let i = 0
  const App = () => {
    const $ = use({
      count: nullable<number>(null),
    })

    $.fx(() => {
      const { count } = $.of($)
      $()
      i++
    })

    trigger = () => {
      $.count = 69
    }

    return <div>{$.count}</div>
  }

  const app = render(<App />)

  expect(i).toBe(0)
  expect(app.container.textContent).toBe('')

  trigger?.()

  await new Promise<void>(queueMicrotask)

  expect(i).toBe(1)
  expect(app.container.textContent).toBe('69')
})

test('jsx edge case', async () => {
  const $ = state({
    count: 42,
  })

  function ShowCount({ getCount }: { getCount: () => number }) {
    return <div>{getCount()}</div>
  }

  function App() {
    return <ShowCount getCount={() => $.count} />
  }

  const app = render(<App />)

  expect(app.container.textContent).toBe('42')

  $.count = 69

  await new Promise<void>(queueMicrotask)

  expect(app.container.textContent).toBe('69')
})

test('jsx optimized', async () => {
  const $ = state({
    count: 42,
  })

  let slow = 0
  let fast = 0

  function CounterSlow() {
    slow++
    return <>{$.count}</>
  }

  // Optimized: Will update the text node directly
  function CounterFast() {
    fast++
    return <>{$.$.count}</>
  }

  function AppSlow() {
    return <CounterSlow />
  }

  function AppFast() {
    return <CounterFast />
  }

  const appSlow = render(<AppSlow />)
  const appFast = render(<AppFast />)

  expect(appSlow.container.textContent).toBe('42')
  expect(appFast.container.textContent).toBe('42')
  expect(slow).toBe(1)
  expect(fast).toBe(1)

  $.count = 69

  await new Promise<void>(queueMicrotask)

  expect(appSlow.container.textContent).toBe('69')
  expect(appFast.container.textContent).toBe('69')
  expect(slow).toBe(2)
  expect(fast).toBe(1)
})
