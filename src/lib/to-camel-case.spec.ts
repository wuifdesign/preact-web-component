import { toCamelCase } from './to-camel-case'

const cases = [
  ['test', 'test'],
  ['test-value', 'testValue'],
  ['test-value-2', 'testValue2'],
  ['-test', 'Test'],
  ['test--value', 'test-Value'],
  ['test-', 'test-'],
] as const

describe('toCamelCase', () => {
  test.each(cases)('take %s and return %s', (input, result) => {
    expect(toCamelCase(input)).toBe(result)
  })
})
