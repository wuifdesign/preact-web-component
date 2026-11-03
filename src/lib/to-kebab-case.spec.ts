import { toKebabCase } from './to-kebab-case'

const cases = [
  ['test', 'test'],
  ['testValue', 'test-value'],
  ['testValue2', 'test-value2'],
  ['test-value', 'test-value'],
  ['testABC', 'test-a-b-c'],
] as const

describe('toKebabCase', () => {
  test.each(cases)('take %s and return %s', (input, result) => {
    expect(toKebabCase(input)).toBe(result)
  })
})
