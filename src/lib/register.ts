import {
  type Attributes,
  cloneElement,
  type ComponentClass,
  type FunctionalComponent,
  type FunctionComponent,
  h,
  hydrate,
  render,
  type VNode,
} from 'preact'
import { ComponentWithContext } from './component-with-context'
import { toCamelCase } from './to-camel-case'
import { toVirtualDom } from './to-virtual-dom'

type ComponentDefinition = (FunctionComponent<any> | ComponentClass<any> | FunctionalComponent<any>) & {
  tagName?: string
  propTypes?: Record<string, any>
  observedAttributes?: string[]
}

export const register = (
  Component: ComponentDefinition,
  tagName?: string,
  propNames?: string[],
  options?: {
    shadow?: boolean
    mode?: 'open' | 'closed'
    extends?: string
    formAssociated?: boolean
    ExtendsComponent?: { new (...args: any[]): HTMLElement }
  },
) => {
  propNames = propNames || Component.observedAttributes || Object.keys(Component.propTypes || {})
  const BaseClass = options?.ExtendsComponent ?? HTMLElement
  const formAssociated = options?.formAssociated ?? false

  class PreactElement extends BaseClass {
    static formAssociated = formAssociated

    private readonly _root: HTMLElement | ShadowRoot
    private _props: Record<string, any> = {}
    private _internals: ElementInternals | undefined
    private _virtualDom: VNode<Attributes & { context: any }> | null = null
    private readonly _virtualDomComponent: ComponentDefinition

    constructor() {
      super()
      if (formAssociated) {
        this._internals = this.attachInternals()
      }
      this._virtualDomComponent = Component
      this._root = options && options.shadow ? this.attachShadow({ mode: options.mode || 'open' }) : this
    }

    static get observedAttributes() {
      return propNames
    }

    connectedCallback() {
      // Get a reference to the previous context by pinging the nearest higher up node that was rendered with Preact.
      // If one Preact component higher up receives our ping, it will set the `detail` property of our custom event.
      // This works because events are dispatched synchronously.
      const event = new CustomEvent<{ context?: any }>('_preact', {
        detail: {},
        bubbles: true,
        cancelable: true,
      })
      this.dispatchEvent(event)
      const context = event.detail.context

      this._virtualDom = h(
        ComponentWithContext,
        { ...this._props, context, rootElement: this, internals: this._internals },
        toVirtualDom(this, this._virtualDomComponent),
      )

      const renderFunction = this.hasAttribute('hydrate') ? hydrate : render
      renderFunction(this._virtualDom, this._root)
    }

    attributeChangedCallback(name: string, _: unknown, newValue: unknown) {
      if (!this._virtualDom) {
        return
      }
      // Attributes use `null` as an empty value whereas `undefined` is more common in pure JS components, especially
      // with default parameters.  When calling `node.removeAttribute()` we'll receive `null` as the new value.
      newValue = newValue == null ? undefined : newValue
      const props: Record<string, any> = {}
      props[name] = newValue
      props[toCamelCase(name)] = newValue
      this._virtualDom = cloneElement(this._virtualDom, props)
      render(this._virtualDom, this._root)
    }

    disconnectedCallback() {
      render((this._virtualDom = null), this._root)
    }
  }

  // Keep DOM properties and Preact props in sync
  propNames.forEach((name) => {
    Object.defineProperty(PreactElement.prototype, name, {
      get() {
        return this._vdom.props[name]
      },
      set(v) {
        if (this._vdom) {
          this.attributeChangedCallback(name, null, v)
        } else {
          if (!this._props) this._props = {}
          this._props[name] = v
          this.connectedCallback()
        }

        // Reflect property changes to attributes if the value is a primitive
        const type = typeof v
        if (v == null || type === 'string' || type === 'boolean' || type === 'number') {
          this.setAttribute(name, v)
        }
      },
    })
  })

  return customElements.define(tagName || Component.tagName || Component.displayName || Component.name, PreactElement, {
    extends: options?.extends,
  })
}
