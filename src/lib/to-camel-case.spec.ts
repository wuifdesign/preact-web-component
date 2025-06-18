import { toCamelCase } from './to-camel-case'

const cases = [
  ['test', 'test'],
  ['test-value', 'testValue'],
  ['test-value-2', 'testValue2'],
] as const

describe('toCamelCase', () => {
  test.each(cases)('take %s and return %s', (input, result) => {
    expect(toCamelCase(input)).toBe(result)
  })
})
