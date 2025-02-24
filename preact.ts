import { effect, useComputed, useSignal } from '@preact/signals'
import { useMemo } from 'preact/hooks'
import type { $, Fx, Of } from './core.ts'
import { Derived, MissingProp } from './core.ts'

export { derive, nullable } from './core.ts'
export { state } from './state.ts'

export function use<T>($: T): $<T> {
  let runs = false
  let thrown: any = null
  let value: any = null
  let peeking = false

  const state$ = function brk(_value?: unknown) {
    value = _value
    if (thrown) throw thrown
    peeking = true
  }

  const fx: Fx = function fx(fn) {
    useMemo(() => {
      effect(() => {
        runs = true
        try {
          fn()
        }
        catch (e) {
          if (e === MissingProp) return
          throw e
        }
        finally {
          runs = false
          peeking = false
          thrown = null
        }
      })
    }, [])
  }
  state$.fx = fx

  const $of: Of = function $of(state) {
    return state as any
  }
  state$.of = $of

  const $$ = {} as any
  state$.$ = $$

  for (const key in $) {
    const val = $[key]
    if (typeof val === 'object' && val !== null && Derived in val) {
      // Wrap getters in computed
      const s = useComputed(() => {
        runs = true
        try {
          return (val as any).fn(state$)
        }
        catch (e) {
          if (e === MissingProp) return value
          throw e
        }
        finally {
          runs = false
          thrown = null
          value = null
        }
      })
      $$[key] = s
      Object.defineProperty(state$, key, {
        get() {
          if (peeking) return s.peek()
          const ret = s.value
          if (runs && ret == null) thrown = MissingProp
          return ret
        }
      })
    }
    else {
      // Regular properties use signal
      const s = useSignal(val)
      $$[key] = s
      Object.defineProperty(state$, key, {
        get() {
          if (peeking) return s.peek()
          const ret = s.value
          if (runs && ret == null) thrown = MissingProp
          return ret
        },
        set(value) {
          s.value = value
        }
      })
    }
  }

  return useMemo(() => state$ as $<T>, [])
}
