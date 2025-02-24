import { derive, nullable, state } from '../state.ts'

const $ = state({
  firstName: 'Jane',
  lastName: nullable<string>(null),
  fullName: derive<string | void>(($$): string => { // first type is the default value type and second is the actual value type
    const { firstName, lastName } = $.of($)
    $$() // default value when dependencies are missing
    return firstName + ' ' + lastName
  }),
})

$.fx(() => {
  const { fullName } = $.of($)
  $()
  console.log('runs')
  console.log(fullName)
})

$.lastName = 'Doe' // Jane Doe
