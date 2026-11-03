import { type ComponentType, cloneElement, h, hydrate, render, type VNode } from 'preact'
import type { WebComponentProps } from '../types/web-component-props'
import { ComponentWithContext } from './component-with-context'
import { toCamelCase } from './to-camel-case'
import { toKebabCase } from './to-kebab-case'
import { addToSlot, toSlots, toVirtualDom } from './to-virtual-dom'

type ComponentDefinition<P> = ComponentType<P> & {
  tagName?: string
  observedAttributes?: string[]
}

type KebabCase<S extends string> = S extends `${infer First}${infer Rest}`
  ? `${First extends Lowercase<First> ? '' : '-'}${Lowercase<First>}${KebabCase<Rest>}`
  : S

type PropName<P> = Exclude<keyof P, keyof WebComponentProps> & string

/** A prop name of the component, in camelCase or kebab-case. */
export type AttributeName<P> = PropName<P> | KebabCase<PropName<P>>

/** The camelCase prop name of an attribute name, `first-name` is `firstName`. */
type PropOf<P, N> = N extends PropName<P> ? N : { [K in PropName<P>]: N extends KebabCase<K> ? K : never }[PropName<P>]

/**
 * Converts an attribute value, for example `String`, `Number` or `(value) => value.split(',')`. `Boolean` is a special
 * case, it is `true` while the attribute is set.
 */
export type PropType<T = unknown> = (value: string) => T

/** The types of the attributes, each one has to return a value of its prop. */
export type PropTypes<P, N extends string = AttributeName<P>> = {
  [K in N]: PropType<P[PropOf<P, K> & keyof P]>
}

/** The element created by `register()`, with a property for each observed attribute. */
export type WebComponentElement<P, N extends string = never> = HTMLElement & {
  // Names that exist on `HTMLElement` keep their native property
  [K in Exclude<PropOf<P, N>, keyof HTMLElement>]: P[K] | undefined
}

/** The class returned by `register()`. */
export type WebComponentConstructor<P, N extends string = never> = {
  new (): WebComponentElement<P, N>
  prototype: WebComponentElement<P, N>
}

export type RegisterOptions = {
  /**
   * Renders into a shadow root. An object is passed to `attachShadow()`, for example `{ mode: 'closed' }` or
   * `{ delegatesFocus: true }`, the mode defaults to `'open'`.
   */
  shadow?: boolean | Partial<ShadowRootInit>
  /** Styles for the shadow root, shared by all instances. */
  adoptedStyleSheets?: CSSStyleSheet[]
  /** Makes the element form-associated, the component gets the result of `attachInternals()` as `_internals`. */
  formAssociated?: boolean
}

// Only primitives can be reflected, the attribute is removed for `false`, `null` and objects
const REFLECTED_TYPES = ['string', 'number', 'bigint']

const convert = (type: PropType | undefined, value: string | null) => {
  if (type === Boolean) {
    return value != null
  }
  // Attributes use `null` as an empty value whereas `undefined` is more common in pure JS components, especially
  // with default parameters. When calling `node.removeAttribute()` we'll receive `null` as the new value.
  return value == null ? undefined : type ? type(value) : value
}

const getSlottedNodes = (element: Element) =>
  [...element.querySelectorAll('slot')]
    .filter((slot) => !slot.parentElement!.closest('slot'))
    .flatMap((slot) => [...slot.childNodes])

// Preact renders through this instead of the host, so its nodes can be told apart from children added by anyone else.
const createRenderRoot = (host: HTMLElement, owned: WeakSet<Node>): any => ({
  nodeType: 1,
  namespaceURI: host.namespaceURI,
  ownerDocument: host.ownerDocument,
  get firstChild() {
    return host.firstChild
  },
  get childNodes() {
    return host.childNodes
  },
  insertBefore(node: Node, child: Node | null) {
    owned.add(node)
    return host.insertBefore(node, child)
  },
  appendChild(node: Node) {
    owned.add(node)
    return host.appendChild(node)
  },
  removeChild: (node: Node) => host.removeChild(node),
})

export const register = <P = any, N extends AttributeName<P> = never>(
  Component: ComponentDefinition<P>,
  tagName?: string,
  propNames?: readonly N[] | PropTypes<P, N>,
  options: RegisterOptions = {},
): WebComponentConstructor<P, N> | undefined => {
  // Server rendering imports the same module, there is nothing to register
  if (typeof customElements === 'undefined') {
    return
  }
  const name = (tagName || Component.tagName)!
  // A definition can't be replaced, hot module replacement registers again on every update
  const defined = customElements.get(name)
  if (defined) {
    return defined as WebComponentConstructor<P, N>
  }

  const names = (propNames || Component.observedAttributes || []) as string[] | Record<string, PropType>
  // HTML lowercases attribute names, so camelCase names are observed in their kebab form
  const entries: [string, PropType?][] = Array.isArray(names) ? names.map((name) => [name]) : Object.entries(names)
  const types = Object.fromEntries(entries.map(([name, type]) => [toKebabCase(name), type]))
  const observedNames = Object.keys(types)
  // The camelCase prop of each attribute, `first-name` is `firstName`
  const propOf: Record<string, string> = Object.fromEntries(observedNames.map((name) => [name, toCamelCase(name)]))
  // A missing boolean attribute is `false`, not `undefined`
  const defaultProps = Object.fromEntries(
    observedNames.filter((name) => types[name] === Boolean).map((name) => [propOf[name], false]),
  )
  // Native properties like `style` or `hidden` keep working, the attribute still updates the prop
  const propertyNames = observedNames.filter((name) => !(propOf[name]! in HTMLElement.prototype))
  const formAssociated = !!options.formAssociated
  const shadowRootInit: ShadowRootInit | null = options.shadow
    ? Object.assign({ mode: 'open' as ShadowRootMode }, options.shadow)
    : null

  class PreactElement extends HTMLElement {
    static formAssociated = formAssociated

    readonly #root: HTMLElement | ShadowRoot
    readonly #shadowRoot: ShadowRoot | undefined
    #props: Record<string, any> = { ...defaultProps }
    #internals: ElementInternals | undefined
    #virtualDom: VNode<any> | null = null
    #slots = toSlots([])
    #context: any
    #hydrated = false
    #reflecting = false
    #formDisabled = false
    readonly #owned = new WeakSet<Node>()
    // Only needed without a shadow root, created on the first connect
    #observer: MutationObserver | undefined

    constructor() {
      super()
      if (formAssociated) {
        this.#internals = this.attachInternals()
      }
      if (shadowRootInit) {
        // A declarative shadow root is reused, as `attachShadow()` would empty it. A closed one is only reachable through
        // the internals.
        if (!this.shadowRoot && shadowRootInit.mode === 'closed' && !this.#internals) {
          this.#internals = this.attachInternals()
        }
        const root = this.shadowRoot ?? this.#internals?.shadowRoot ?? this.attachShadow(shadowRootInit)
        if (options.adoptedStyleSheets) {
          root.adoptedStyleSheets = options.adoptedStyleSheets
        }
        this.#root = this.#shadowRoot = root
      } else {
        this.#root = createRenderRoot(this, this.#owned)
      }
    }

    static get observedAttributes() {
      return observedNames
    }

    static {
      // Keep DOM properties and Preact props in sync, the `first-name` attribute is the `firstName` property
      propertyNames.forEach((attribute) => {
        const name = propOf[attribute]!
        Object.defineProperty(PreactElement.prototype, name, {
          configurable: true,
          get(this: PreactElement) {
            return this.#props[name]
          },
          set(this: PreactElement, value) {
            this.#setProperty(attribute, value)
          },
        })
      })
    }

    connectedCallback() {
      // Callbacks are queued, a parent handling its own move may already have removed this element again.
      if (!this.isConnected) {
        return
      }

      // Properties set before the element was upgraded shadow the accessors on the prototype.
      const self = this as Record<string, any>
      propertyNames.forEach((attribute) => {
        const name = propOf[attribute]!
        if (Object.hasOwn(self, name)) {
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
        // Reaches providers outside the shadow roots of other elements
        composed: true,
      })
      this.dispatchEvent(event)
      this.#context = event.detail.context

      // Only the first connect has server output, reconnecting finds the children restored by disconnecting.
      const shouldHydrate = this.hasAttribute('hydrate') && !this.#hydrated
      this.#hydrated = true
      const light = !this.#shadowRoot
      // Server output has the children inside its slots, everything else in there is reused as the rendered output.
      this.#slots = toSlots(light && shouldHydrate ? getSlottedNodes(this) : [...this.childNodes])
      this.#virtualDom = this.#createVirtualDom()

      // Without a shadow root the slots take over the children until disconnecting.
      if (light && !shouldHydrate) {
        this.replaceChildren()
      }

      const renderFunction = shouldHydrate ? hydrate : render
      renderFunction(this.#virtualDom, this.#root)

      if (light) {
        // Hydrating reuses nodes without inserting them
        this.childNodes.forEach((node) => this.#owned.add(node))
        this.#observer ??= new MutationObserver((records) => this.#onChildrenChanged(records))
        this.#observer.observe(this, { childList: true })
      }
    }

    #createVirtualDom() {
      return h(
        ComponentWithContext,
        { ...this.#rootProps(), context: this.#context },
        toVirtualDom(this, Component, this.#slots, !this.#shadowRoot),
      )
    }

    #rerender() {
      render((this.#virtualDom = this.#createVirtualDom()), this.#root)
    }

    #onChildrenChanged(records: MutationRecord[]) {
      const added = records
        .flatMap((record) => [...record.addedNodes] as ChildNode[])
        .filter((node) => node.parentNode === this && !this.#owned.has(node))
      if (!added.length) {
        return
      }

      // `textContent` and `innerHTML` replace everything in one go, so there is no output left to update
      const replaced = records.some(
        (record) => record.addedNodes.length && [...record.removedNodes].some((node) => this.#owned.has(node)),
      )
      if (replaced) {
        render(null, this.#root)
        this.replaceChildren()
        this.#slots = toSlots([])
      } else {
        added.forEach((node) => node.remove())
      }

      added.forEach((node) => addToSlot(this.#slots, node))
      this.#rerender()
    }

    // Children live inside the slots, so a parent like Preact can pass a reference node that isn't a direct child.
    override insertBefore<T extends Node>(node: T, child: Node | null): T {
      const parent = child?.parentNode
      return parent && parent !== this
        ? parent.insertBefore(node, child)
        : super.insertBefore(node, parent ? child : null)
    }

    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
      // A property setter already passes the value with its original type
      if (!this.#reflecting && oldValue !== newValue) {
        this.#setProps(name, convert(types[name], newValue))
      }
    }

    #setProperty(name: string, value: unknown) {
      this.#reflecting = true
      try {
        if (value === true) {
          this.setAttribute(name, '')
        } else if (REFLECTED_TYPES.includes(typeof value)) {
          this.setAttribute(name, String(value))
        } else {
          this.removeAttribute(name)
        }
      } finally {
        this.#reflecting = false
      }
      this.#setProps(name, value === null ? undefined : value)
    }

    // `ComponentWithContext` copies the attributes into a new vnode, so `#props` can be passed without a copy
    #rootProps() {
      return {
        attrs: this.#props,
        host: {
          _rootElement: this,
          _internals: this.#internals,
          _shadowRoot: this.#shadowRoot,
          _formDisabled: formAssociated ? this.#formDisabled : undefined,
        },
      }
    }

    #setProps(name: string, value: unknown) {
      // `#props` outlives `#virtualDom`, so values are kept while disconnected and restored when reconnecting.
      this.#props[propOf[name]!] = value
      this.#update()
    }

    #update() {
      if (this.#virtualDom) {
        this.#virtualDom = cloneElement(this.#virtualDom, this.#rootProps())
        render(this.#virtualDom, this.#root)
      }
    }

    // The browser only calls the form callbacks of form-associated elements. It looks them up on the class when
    // defining it, so a component can't add them itself.
    formDisabledCallback(disabled: boolean) {
      // Can be called before connecting, the first render picks the value up
      this.#formDisabled = disabled
      this.#update()
    }

    formResetCallback() {
      this.dispatchEvent(new Event('formreset'))
    }

    formStateRestoreCallback(state: unknown, mode: 'restore' | 'autocomplete') {
      this.dispatchEvent(new CustomEvent('formstaterestore', { detail: { state, mode } }))
    }

    disconnectedCallback() {
      this.#observer?.disconnect()
      render((this.#virtualDom = null), this.#root)
      if (!this.#shadowRoot) {
        this.prepend(...Object.values(this.#slots).flat())
        this.#slots = toSlots([])
      }
    }
  }

  customElements.define(name, PreactElement)
  return PreactElement as unknown as WebComponentConstructor<P, N>
}
