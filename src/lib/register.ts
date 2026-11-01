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
  const observedNames = propNames || Component.observedAttributes || Object.keys(Component.propTypes || {})
  const BaseClass = options?.ExtendsComponent ?? HTMLElement
  const formAssociated = options?.formAssociated ?? false

  class PreactElement extends BaseClass {
    static formAssociated = formAssociated

    private readonly _root: HTMLElement | ShadowRoot
    private _props: Record<string, any> = {}
    private _internals: ElementInternals | undefined
    private _virtualDom: VNode<Attributes & { context: any }> | null = null
    private _lightChildren: ChildNode[] = []
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
      return observedNames
    }

    connectedCallback() {
      // Callbacks are queued, a parent handling its own move may already have removed this element again.
      if (!this.isConnected) {
        return
      }

      // Properties set before the element was upgraded shadow the accessors on the prototype.
      const self = this as Record<string, any>
      observedNames.forEach((name) => {
        if (Object.prototype.hasOwnProperty.call(self, name)) {
          const value = self[name]
          delete self[name]
          self[name] = value
        }
      })

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

      const shouldHydrate = this.hasAttribute('hydrate')
      // Without a shadow root the children are rendered from the virtual DOM, so the originals have to make way for them
      // until disconnecting. Hydrating reuses the existing nodes instead.
      if (this._root === this && !shouldHydrate) {
        this._lightChildren = [...this.childNodes]
        this.replaceChildren()
      }

      const renderFunction = shouldHydrate ? hydrate : render
      renderFunction(this._virtualDom, this._root)
    }

    attributeChangedCallback(name: string, _: unknown, newValue: unknown) {
      // Attributes use `null` as an empty value whereas `undefined` is more common in pure JS components, especially
      // with default parameters.  When calling `node.removeAttribute()` we'll receive `null` as the new value.
      newValue = newValue == null ? undefined : newValue
      const props: Record<string, any> = {}
      props[name] = newValue
      props[toCamelCase(name)] = newValue
      // `_props` outlives `_virtualDom`, so values are kept while disconnected and restored when reconnecting.
      Object.assign(this._props, props)
      if (!this._virtualDom) {
        return
      }
      this._virtualDom = cloneElement(this._virtualDom, props)
      render(this._virtualDom, this._root)
    }

    disconnectedCallback() {
      render((this._virtualDom = null), this._root)
      this.prepend(...this._lightChildren)
      this._lightChildren = []
    }
  }

  // Keep DOM properties and Preact props in sync
  observedNames.forEach((name) => {
    Object.defineProperty(PreactElement.prototype, name, {
      get() {
        return this._props[name]
      },
      set(v) {
        // Reflect property changes to attributes if the value is a primitive
        const type = typeof v
        if (v == null) {
          this.removeAttribute(name)
        } else if (type === 'string' || type === 'boolean' || type === 'number') {
          this.setAttribute(name, v)
        }

        // Has to run after reflecting, which reports the value as a string, to keep the original type
        this.attributeChangedCallback(name, null, v)
      },
    })
  })

  return customElements.define(tagName || Component.tagName || Component.displayName || Component.name, PreactElement, {
    extends: options?.extends,
  })
}
