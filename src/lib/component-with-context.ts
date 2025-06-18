import { cloneElement, Component } from 'preact'

export class ComponentWithContext extends Component<any, never> {
  constructor(props: any) {
    super(props, props.context)
  }

  getChildContext() {
    return this.props.context
  }

  render() {
    const { context, children, rootElement, internals, ...rest } = this.props
    rest._rootElement = rootElement
    rest._internals = internals
    return cloneElement(children, rest)
  }
}
