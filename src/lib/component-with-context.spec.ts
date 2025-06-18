import { ComponentWithContext } from './component-with-context'

describe('ComponentWithContext', () => {
  test('should have context', () => {
    const component = new ComponentWithContext({ a: 1, context: 'test' })
    expect(component).toEqual({
      context: 'test',
      props: {
        a: 1,
        context: 'test',
      },
    })
    expect(component.getChildContext()).toBe('test')
    expect(component.props).toEqual({ a: 1, context: 'test' })
  })
})
