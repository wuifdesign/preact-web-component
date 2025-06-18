import { SlotComponent } from './slot-component'

describe('ComponentWithContext', () => {
  test('should have context', () => {
    const component = new SlotComponent({ a: 1 }, 'test')
    expect(component).toEqual({
      _listener: undefined,
      _ref: undefined,
      context: 'test',
      props: {
        a: 1,
      },
    })
    expect(component.props).toEqual({ a: 1 })
    expect(component.render().type).toBe('slot')
  })
})
