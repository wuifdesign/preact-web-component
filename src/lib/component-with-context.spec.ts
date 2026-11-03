import { ComponentWithContext } from './component-with-context'

describe('ComponentWithContext', () => {
  test('should pass its context to the children', () => {
    const component = new ComponentWithContext({ a: 1, context: 'test' })
    expect(component).toMatchObject({
      props: {
        a: 1,
        context: 'test',
      },
    })
    expect(component.getChildContext()).toBe('test')
    expect(component.props).toEqual({ a: 1, context: 'test' })
  })
})
