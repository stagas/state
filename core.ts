import type { Signal } from '@preact/signals'

export type Fx = (fn: () => void) => void

export type Of = <T extends Record<string, unknown>>(state: $<T>) => {
  [K in keyof T]-?: T[K] & {}
}

export type $<T> = T & {
  <U>(v?: U): void
  $: {
    [K in keyof T]: Signal<T[K]>
  }
  fx: Fx
  of: Of
}

export const MissingProp = Symbol('MissingProp')
export const Derived = Symbol('Derived')

export function nullable<T>(v: T | null): T | null {
  return v
}

export function derive<T>(
  fn: {
    ($$: {
      (v: T): void
    }): void
  }
): T {
  return { [Derived]: true, fn } as any
}
