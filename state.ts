import { computed, effect, signal } from '@preact/signals'
import type { $, Fx, Of } from './core.ts'
import { Derived, MissingProp, MissingDerivedProp } from './core.ts'
export { derive, nullable } from './core.ts'

export function state<T extends Record<string, unknown>>($: T): $<T> {
  let depth = 0
  let peeking = false
  let thrown: Error | symbol | null = null
  let value: unknown = null

  const state$ = function brk(_value?: unknown) {
    value = _value
    if (thrown && depth) {
      const error = thrown
      thrown = null
      throw error
    }
    thrown = null
    peeking = true
  }

  const fx: Fx = function fx(fn) {
    effect(() => {
      ++depth
      try {
        return fn()
      }
      catch (e) {
        if (e === MissingProp || e === MissingDerivedProp) return
        throw e
      }
      finally {
        if (!--depth) thrown = null
        peeking = false
      }
    })
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
      const s = computed(() => {
        ++depth
        try {
          return (val as any).fn(state$)
        }
        catch (e) {
          if (e === MissingDerivedProp) return value
          throw e
        }
        finally {
          if (!--depth) thrown = null
          value = null
        }
      })
      $$[key] = s
      Object.defineProperty(state$, key, {
        get() {
          if (peeking) return s.peek()
          const ret = s.value
          if (depth && ret == null) thrown = MissingDerivedProp
          return ret
        }
      })
    }
    else {
      const s = signal(val)
      $$[key] = s
      Object.defineProperty(state$, key, {
        get() {
          if (peeking) return s.peek()
          const ret = s.value
          if (depth && ret == null) thrown = MissingDerivedProp
          return ret
        },
        set(value) {
          s.value = value
        }
      })
    }
  }

  return state$ as $<T>
}
