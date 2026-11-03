import { cloneElement, Component } from 'preact'
import { SlotComponent } from './slot-component'

// Attributes are nested in `attrs`, so observed names like `context` or `children` can't replace the values used here.
export class ComponentWithContext extends Component<any, never> {
  getChildContext() {
    return this.props.context
  }

  render() {
    const { attrs, host, children } = this.props
    // Assigned after cloning, as `cloneElement` would take `key` and `ref` for the vnode
    const vnode = cloneElement(children)
    const props = vnode.props as Record<string, any>
    for (const name in attrs) {
      // `children` and slots take precedence over attributes with the same name
      if (name !== 'children' && props[name]?.type !== SlotComponent) {
        props[name] = attrs[name]
      }
    }
    Object.assign(props, host)
    return vnode
  }
}
