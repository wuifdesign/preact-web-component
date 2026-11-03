import { cloneElement, Component, createContext, type FunctionComponent, h, render, type VNode } from 'preact'
import { useContext, useLayoutEffect, useState } from 'preact/hooks'
import { Slot } from '../index'
import type { WebComponentProps } from '../types/web-component-props'
import { register } from './register'

const Theme = createContext('light')

const Context: FunctionComponent<{ name: string }> = (props) => {
  return <Theme.Provider value="dark">{props.children}</Theme.Provider>
}

const WithContext: FunctionComponent<{ name: string }> = (props) => {
  const theme = useContext(Theme)
  return (
    <div>
      Hello {props.name}! ({theme})
    </div>
  )
}

const WithSlot: FunctionComponent<{ name: string }> = (props) => {
  return (
    <div>
      Pre - <slot></slot> - After ({props.name})
    </div>
  )
}

const WithNamedSlot: FunctionComponent<{ name: string }> = (props) => {
  return (
    <div>
      Pre - <slot name="header"></slot> - Mid - <slot name="footer"></slot> - After ({props.name})
    </div>
  )
}

const FormAssociated: FunctionComponent<WebComponentProps> = (props) => {
  useLayoutEffect(() => {
    props._internals?.setFormValue('demo')
  })
  return 'Test'
}

const DynamicContext: FunctionComponent<{ name: string }> = (props) => {
  return <Theme.Provider value={props.name}>{props.children}</Theme.Provider>
}

const ClonedChildren: FunctionComponent<{ name: string }> = (props) => {
  return <Theme.Provider value="dark">{cloneElement(props.children as VNode)}</Theme.Provider>
}

const WithChildren: FunctionComponent<{ name: string }> = (props) => {
  return <div>{props.children}</div>
}

let setRootLoading: (loading: boolean) => void
const SwitchesRoot: FunctionComponent = (props) => {
  const [loading, setLoading] = useState(false)
  setRootLoading = setLoading
  return loading ? <p>Loading</p> : <div>{props.children}</div>
}

const ShowProps: FunctionComponent<Record<string, unknown>> = ({ children, _rootElement, _internals, ...rest }) => {
  return <div>{JSON.stringify(rest)}</div>
}

const ShowFlag: FunctionComponent<{ flag?: boolean; hidden?: boolean }> = (props) => {
  return <div>{String(props.flag ?? props.hidden)}</div>
}

const RootElement: FunctionComponent<WebComponentProps> = (props) => {
  return <div>{props._rootElement?.tagName}</div>
}

const ReservedNames: FunctionComponent<Record<string, any>> = (props) => {
  return (
    <Theme.Provider value="dark">
      <div>{JSON.stringify({ context: props.context, key: props.key, ref: props.ref })}</div>
      {props.children}
    </Theme.Provider>
  )
}

const SlotContext: FunctionComponent = () => {
  return (
    <Theme.Provider value="dark">
      <Slot />
    </Theme.Provider>
  )
}

const renderedTypes: string[] = []
const RecordTypes: FunctionComponent<{ name?: unknown }> = (props) => {
  renderedTypes.push(typeof props.name)
  return <div>{String(props.name)}</div>
}

const KebabSlot: FunctionComponent<{ myHeader?: VNode }> = (props) => {
  return <div>{props.myHeader}</div>
}

let shadowRootProp: ShadowRoot | undefined
const ShadowRootProp: FunctionComponent<WebComponentProps> = (props) => {
  shadowRootProp = props._shadowRoot
  return <div>shadow</div>
}

const Exposed: FunctionComponent<WebComponentProps> = (props) => {
  const [open, setOpen] = useState(false)
  useLayoutEffect(() => {
    Object.assign(props._rootElement!, { open: () => setOpen(true) })
  }, [])
  return <div>{open ? 'open' : 'closed'}</div>
}

let instances = 0
const lifecycle: string[] = []
const Lifecycle: FunctionComponent<{ name: string }> = (props) => {
  const [instance] = useState(() => ++instances)
  useLayoutEffect(() => {
    lifecycle.push('mount')
    return () => {
      lifecycle.push('unmount')
    }
  }, [])
  return (
    <div>
      {instance}: {props.name}
    </div>
  )
}

const NamedContext: FunctionComponent<{ header?: VNode }> = (props) => {
  return <Theme.Provider value="dark">{props.header}</Theme.Provider>
}

const connectedRenders: boolean[] = []
const Connected: FunctionComponent<WebComponentProps> = (props) => {
  connectedRenders.push(props._rootElement!.isConnected)
  return <div>Connected</div>
}

const FormControl: FunctionComponent<WebComponentProps> = ({ _internals, _rootElement, _formDisabled }) => {
  const [value, setValue] = useState('initial')
  useLayoutEffect(() => {
    _internals?.setFormValue(value)
  }, [value])
  useLayoutEffect(() => {
    const reset = () => setValue('initial')
    const restore = (event: Event) => setValue((event as CustomEvent).detail.state)
    _rootElement!.addEventListener('formreset', reset)
    _rootElement!.addEventListener('formstaterestore', restore)
    return () => {
      _rootElement!.removeEventListener('formreset', reset)
      _rootElement!.removeEventListener('formstaterestore', restore)
    }
  }, [])
  return (
    <button type="button" disabled={_formDisabled} onClick={() => setValue('changed')}>
      {value}
    </button>
  )
}

register(Connected, 'x-connected')
register(FormControl, 'x-form-control', [], { shadow: true, formAssociated: true })
register(Context, 'x-context', ['name'], { shadow: true })
register(Context, 'x-context-light', ['name'])
register(NamedContext, 'x-context-named')
register(DynamicContext, 'x-dynamic-context', ['name'], { shadow: true })
register(ClonedChildren, 'x-cloned-children', ['name'], { shadow: true })
register(WithChildren, 'x-with-children', ['name'])
register(WithChildren, 'x-with-children-shadow', ['name'], { shadow: true })
register(SwitchesRoot, 'x-switches-root')
register(ShowProps, 'x-show-props', ['first-name'])
register(ShowProps, 'x-show-camel', ['firstName'])
register(ShowProps, 'x-show-typed', { count: Number, flag: Boolean, label: String, list: (value) => value.split(',') })
register(ShowProps, 'x-show-style', ['style'])
register(ReservedNames, 'x-reserved-names', ['context', 'children', 'key', 'ref'])
register(SlotContext, 'x-slot-context', [], { shadow: true })
register(RecordTypes, 'x-record-types', ['name'])
register(Exposed, 'x-exposed')
register(KebabSlot, 'x-kebab-slot')
register(NamedContext, 'x-named-observed', ['header'])
register(ShadowRootProp, 'x-shadow-root-prop', [], { shadow: { mode: 'closed' } })
register(ShowFlag, 'x-show-flag', ['flag'])
register(ShowFlag, 'x-show-hidden', ['hidden'])
register(RootElement, 'x-root-element')
register(Lifecycle, 'x-lifecycle', ['name'])
register(WithSlot, 'x-closed', ['name'], { shadow: { mode: 'closed' } })
register(WithContext, 'x-with-context', ['name'])
register(WithSlot, 'x-with-slot', ['name'], { shadow: true })
register(WithNamedSlot, 'x-with-named-slots', ['name'], { shadow: true })
register(FormAssociated, 'x-form-associated', [], { shadow: true, formAssociated: true })

// MutationObserver callbacks and deferred first renders run after the current task
const settle = () => new Promise((resolve) => setTimeout(resolve))

describe('ComponentWithContext', () => {
  test('should render basic', () => {
    window.document.body.innerHTML = '<x-with-context name="John"></x-with-context>'
    expect(window.document.body.innerHTML).toBe(
      '<x-with-context name="John"><div>Hello John! (light)</div></x-with-context>',
    )
  })

  test('should render with context', () => {
    window.document.body.innerHTML = '<x-context><x-with-context name="John"></x-with-context></x-context>'
    expect(window.document.body.innerHTML).toBe(
      '<x-context><x-with-context name="John"><div>Hello John! (dark)</div></x-with-context></x-context>',
    )
  })

  test('should render with slot', () => {
    window.document.body.innerHTML = '<x-with-slot name="John">Content</x-with-slot>'
    const element = document.querySelector('x-with-slot')!
    const shadow = element.shadowRoot
    expect(shadow?.innerHTML).toBe('<div>Pre - <slot></slot> - After (John)</div>')
  })

  test('should render with multiple slots', () => {
    window.document.body.innerHTML =
      '<x-with-named-slots name="John"><span slot="footer">Footer</span><span slot="header">Header</span></x-with-named-slots>'
    const element = document.querySelector('x-with-named-slots')!
    const shadow = element.shadowRoot
    expect(shadow?.innerHTML).toBe(
      '<div>Pre - <slot name="header"></slot> - Mid - <slot name="footer"></slot> - After (John)</div>',
    )
  })

  test('should get form associated', async () => {
    // need to use element-internals-polyfill as jsdom does not support ElementInternals https://github.com/jsdom/jsdom/issues/3715
    window.document.body.innerHTML = '<form><x-form-associated name="test"></x-form-associated></form>'
    expect(window.document.body.innerHTML).toBe(
      '<form internals-valid=""><x-form-associated name="test"></x-form-associated><input type="hidden" name="test" value="demo"></form>',
    )
    const formData = new FormData(document.querySelector('form')!)
    const data = Object.fromEntries(formData)
    expect(data).toEqual({ test: 'demo' })
  })

  test('should pass the custom element as _rootElement', () => {
    window.document.body.innerHTML = '<x-root-element></x-root-element>'
    expect(window.document.body.innerHTML).toBe('<x-root-element><div>X-ROOT-ELEMENT</div></x-root-element>')
  })

  test('should provide context to elements assigned to an exported Slot', () => {
    window.document.body.innerHTML = '<x-slot-context><x-with-context name="John"></x-with-context></x-slot-context>'
    expect(document.querySelector('x-with-context')!.textContent).toBe('Hello John! (dark)')
  })

  test('should render into a closed shadow root', () => {
    const attachShadow = vi.spyOn(Element.prototype, 'attachShadow')
    window.document.body.innerHTML = '<x-closed name="John">Content</x-closed>'
    const element = document.querySelector('x-closed')!
    const shadow = attachShadow.mock.results[0]!.value as ShadowRoot
    attachShadow.mockRestore()
    expect(element.shadowRoot).toBeNull()
    expect(shadow.innerHTML).toBe('<div>Pre - <slot></slot> - After (John)</div>')
  })
})

describe('Context', () => {
  test('should update slotted elements when the context value changes', async () => {
    window.document.body.innerHTML = '<x-dynamic-context name="a"><x-with-context></x-with-context></x-dynamic-context>'
    const element = document.querySelector('x-dynamic-context')!
    const child = document.querySelector('x-with-context')!
    expect(child.textContent).toBe('Hello ! (a)')

    element.setAttribute('name', 'b')
    await vi.waitFor(() => expect(child.textContent).toBe('Hello ! (b)'))
  })

  test('should provide context through the shadow roots of other elements', () => {
    window.document.body.innerHTML = '<x-context-light><div></div></x-context-light>'
    const shadow = document.querySelector('div')!.attachShadow({ mode: 'open' })
    shadow.innerHTML = '<x-with-context name="John"></x-with-context>'
    expect(shadow.querySelector('x-with-context')!.textContent).toBe('Hello John! (dark)')
  })

  test('should keep the context when an attribute is named context', () => {
    window.document.body.innerHTML =
      '<x-reserved-names context="a"><x-with-context name="John"></x-with-context></x-reserved-names>'
    const element = document.querySelector('x-reserved-names')!
    const child = document.querySelector('x-with-context')!
    expect(child.textContent).toBe('Hello John! (dark)')

    element.setAttribute('context', 'b')
    expect(child.textContent).toBe('Hello John! (dark)')
    expect(JSON.parse(element.querySelector('div')!.textContent!)).toEqual({ context: 'b' })
  })

  test('should provide context to elements slotted after a slot rerendered', () => {
    window.document.body.innerHTML = '<x-cloned-children></x-cloned-children>'
    const element = document.querySelector('x-cloned-children')!
    element.setAttribute('name', 'rerender')

    const child = document.createElement('x-with-context')
    element.appendChild(child)
    expect(child.textContent).toBe('Hello ! (dark)')
  })
})

describe('Light DOM children', () => {
  test('should only render children once', () => {
    window.document.body.innerHTML = '<x-with-children>Content <b>bold</b></x-with-children>'
    expect(window.document.body.innerHTML).toBe(
      '<x-with-children><div><slot>Content <b>bold</b></slot></div></x-with-children>',
    )
  })

  test('should keep children when attributes change', () => {
    window.document.body.innerHTML = '<x-with-children>Content</x-with-children>'
    const element = document.querySelector('x-with-children')!
    element.setAttribute('name', 'John')
    expect(element.innerHTML).toBe('<div><slot>Content</slot></div>')
  })

  test('should restore children when disconnected and render them once when reconnected', () => {
    window.document.body.innerHTML = '<x-with-children>Content</x-with-children>'
    const element = document.querySelector('x-with-children')!

    element.remove()
    expect(element.innerHTML).toBe('Content')

    window.document.body.appendChild(element)
    expect(element.innerHTML).toBe('<div><slot>Content</slot></div>')
  })

  test('should render children once when moved', () => {
    window.document.body.innerHTML = '<x-with-children>Content</x-with-children><section></section>'
    const element = document.querySelector('x-with-children')!
    document.querySelector('section')!.appendChild(element)
    expect(element.innerHTML).toBe('<div><slot>Content</slot></div>')
  })

  test('should render nested custom elements once', () => {
    window.document.body.innerHTML = '<x-with-children><x-with-context name="John"></x-with-context></x-with-children>'
    expect(document.querySelectorAll('x-with-context')).toHaveLength(1)
    expect(document.querySelector('x-with-context')!.textContent).toBe('Hello John! (light)')
  })

  test('should provide context to nested custom elements', () => {
    window.document.body.innerHTML = '<x-context-light><x-with-context name="John"></x-with-context></x-context-light>'
    expect(document.querySelector('x-with-context')!.textContent).toBe('Hello John! (dark)')
  })

  test('should provide context to nested custom elements when moved', () => {
    window.document.body.innerHTML = '<x-context-light><x-with-context name="John"></x-with-context></x-context-light>'
    window.document.body.append(document.createElement('section'))
    document.querySelector('section')!.appendChild(document.querySelector('x-context-light')!)

    expect(document.querySelectorAll('x-with-context')).toHaveLength(1)
    expect(document.querySelector('x-with-context')!.textContent).toBe('Hello John! (dark)')
  })

  test('should not render nested custom elements removed while moving', () => {
    window.document.body.innerHTML = '<x-context-light><x-connected></x-connected></x-context-light>'
    window.document.body.append(document.createElement('section'))
    document.querySelector('section')!.appendChild(document.querySelector('x-context-light')!)

    expect(connectedRenders).toContain(true)
    expect(connectedRenders).not.toContain(false)
  })

  test('should provide context to nested custom elements registered after the provider', () => {
    window.document.body.innerHTML = '<x-context-early><x-late-child name="John"></x-late-child></x-context-early>'
    register(Context, 'x-context-early', ['name'])
    register(WithContext, 'x-late-child', ['name'])
    expect(document.querySelector('x-late-child')!.textContent).toBe('Hello John! (dark)')
  })

  test('should provide context to named slots', () => {
    window.document.body.innerHTML =
      '<x-context-named><x-with-context slot="header" name="John"></x-with-context></x-context-named>'
    expect(document.querySelector('x-with-context')!.textContent).toBe('Hello John! (dark)')
  })

  test('should render the original node', () => {
    const element = document.createElement('x-with-children')
    const button = document.createElement('button')
    element.appendChild(button)
    window.document.body.replaceChildren(element)

    expect(element.querySelector('button')).toBe(button)
  })

  test('should keep event listeners', () => {
    const element = document.createElement('x-with-children')
    const button = document.createElement('button')
    const onClick = vi.fn()
    button.addEventListener('click', onClick)
    element.appendChild(button)
    window.document.body.replaceChildren(element)

    element.querySelector('button')!.click()
    expect(onClick).toHaveBeenCalledOnce()
  })

  test('should keep the state of form controls', () => {
    const element = document.createElement('x-with-children')
    const input = document.createElement('input')
    input.value = 'typed'
    element.appendChild(input)
    window.document.body.replaceChildren(element)

    expect(element.querySelector('input')!.value).toBe('typed')
  })

  test('should keep the disabled attribute', () => {
    window.document.body.innerHTML = '<x-with-children><button disabled></button></x-with-children>'
    expect(document.querySelector('button')!.disabled).toBe(true)
  })

  test('should keep the checked attribute', () => {
    window.document.body.innerHTML = '<x-with-children><input type="checkbox" checked></x-with-children>'
    expect(document.querySelector('input')!.checked).toBe(true)
  })

  test('should keep inline event attributes working', () => {
    window.document.body.innerHTML =
      "<x-with-children><button onclick=\"this.setAttribute('data-clicked', 'yes')\"></button></x-with-children>"
    const button = document.querySelector('button')!
    expect(button).not.toBeNull()
    expect(button.hasAttribute('onclick')).toBe(true)

    button.click()
    expect(button.getAttribute('data-clicked')).toBe('yes')
  })

  test('should keep the content of a nested element with a slot attribute', () => {
    window.document.body.innerHTML = '<x-with-children><div><b slot="x">text</b></div></x-with-children>'
    expect(document.querySelector('b')?.textContent).toBe('text')
    expect(document.querySelector('b')?.getAttribute('slot')).toBe('x')
  })

  test('should keep all children of a named slot', () => {
    window.document.body.innerHTML = '<x-context-named><b slot="header">1</b><b slot="header">2</b></x-context-named>'
    expect(document.querySelector('x-context-named')!.textContent).toBe('12')
  })

  test('should keep ref and key attributes', () => {
    window.document.body.innerHTML = '<x-with-children><b ref="a" key="b">text</b></x-with-children>'
    expect(document.querySelector('b')?.getAttribute('ref')).toBe('a')
    expect(document.querySelector('b')?.getAttribute('key')).toBe('b')
  })

  test('should keep the content of templates', () => {
    window.document.body.innerHTML = '<x-with-children><template><b>hi</b></template></x-with-children>'
    expect(document.querySelector('template')!.innerHTML).toBe('<b>hi</b>')
  })

  test('should keep the case of SVG tags', () => {
    window.document.body.innerHTML = '<x-with-children><svg><linearGradient></linearGradient></svg></x-with-children>'
    expect(document.querySelector('svg')!.firstElementChild!.localName).toBe('linearGradient')
  })

  test('should not add attributes to children', () => {
    window.document.body.innerHTML = '<x-with-children><a data-foo="1"></a></x-with-children>'
    expect(document.querySelector('a')!.getAttributeNames()).toEqual(['data-foo'])
  })

  test('should leave slots of nested custom elements to that element', () => {
    window.document.body.innerHTML =
      '<x-with-children><x-context-named><b slot="header">H</b></x-context-named></x-with-children>'
    expect(document.querySelector('x-context-named')!.textContent).toBe('H')
  })

  describe('changed after connecting', () => {
    const renderList = (items: string[], container: HTMLElement) => {
      const children = items.map((item) => h('span', { key: item }, item))
      render(h('x-with-children', null, children), container)
      return container.querySelector('x-with-children')!
    }

    test('should insert children of a parent in front of existing children', () => {
      const container = document.createElement('main')
      window.document.body.replaceChildren(container)
      renderList(['a', 'b'], container)
      const element = renderList(['c', 'a', 'b'], container)

      expect(element.querySelector('slot')?.textContent).toBe('cab')
    })

    test('should insert children of a parent between existing children', () => {
      const container = document.createElement('main')
      window.document.body.replaceChildren(container)
      renderList(['a', 'b'], container)
      const element = renderList(['a', 'c', 'b'], container)

      expect(element.querySelector('slot')?.textContent).toBe('acb')
    })

    test('should reorder children of a parent', async () => {
      const container = document.createElement('main')
      window.document.body.replaceChildren(container)
      renderList(['a', 'b'], container)
      const element = renderList(['b', 'a'], container)
      await settle()

      expect(element.querySelector('slot')?.textContent).toBe('ba')
      expect(element.children).toHaveLength(1)
    })

    test('should restore children added by a parent when disconnected', async () => {
      const container = document.createElement('main')
      window.document.body.replaceChildren(container)
      renderList(['a'], container)
      const element = renderList(['a', 'b'], container)
      await settle()

      element.remove()
      expect(element.innerHTML).toBe('<span>a</span><span>b</span>')
    })

    test('should not restore children removed by a parent when disconnected', async () => {
      const container = document.createElement('main')
      window.document.body.replaceChildren(container)
      renderList(['a', 'b'], container)
      const element = renderList(['b'], container)
      await settle()

      element.remove()
      expect(element.innerHTML).toBe('<span>b</span>')
    })

    test('should pass children added to a new named slot as prop', async () => {
      window.document.body.innerHTML = '<x-context-named></x-context-named>'
      const element = document.querySelector('x-context-named')!
      const child = document.createElement('b')
      child.slot = 'header'
      child.textContent = 'H'
      element.appendChild(child)
      await settle()

      expect(element.innerHTML).toBe('<slot name="header"><b slot="header">H</b></slot>')
    })

    test('should not treat its own output as added children', async () => {
      window.document.body.innerHTML = '<x-switches-root>a</x-switches-root>'
      const element = document.querySelector('x-switches-root')!
      await settle()
      expect(element.innerHTML).toBe('<div><slot>a</slot></div>')

      setRootLoading(true)
      await settle()
      expect(element.innerHTML).toBe('<p>Loading</p>')

      setRootLoading(false)
      await settle()
      expect(element.innerHTML).toBe('<div><slot>a</slot></div>')
    })

    test('should show children added by a parent', async () => {
      const container = document.createElement('main')
      window.document.body.replaceChildren(container)
      renderList(['a'], container)
      const element = renderList(['a', 'b'], container)
      await settle()

      expect(element.querySelector('slot')?.textContent).toBe('ab')
    })

    test('should drop children removed by a parent', async () => {
      const container = document.createElement('main')
      window.document.body.replaceChildren(container)
      renderList(['a'], container)
      const element = renderList(['b'], container)
      await settle()

      expect(element.querySelector('slot')?.textContent).toBe('b')
    })

    test('should keep rendering after the content was replaced', async () => {
      window.document.body.innerHTML = '<x-with-children>a</x-with-children>'
      const element = document.querySelector('x-with-children')!
      element.textContent = 'x'
      await settle()
      element.setAttribute('name', 'John')

      expect(element.innerHTML).toBe('<div><slot>x</slot></div>')
    })

    // Simulates the parser, which connects the element at its start tag and adds the children afterwards. jsdom doesn't
    // fire connectedCallback for parsed elements.
    test('should render children added right after connecting inside the slot', async () => {
      const element = document.createElement('x-with-children')
      window.document.body.replaceChildren(element)
      element.append('a', document.createElement('hr'))
      await settle()

      expect(element.innerHTML).toBe('<div><slot>a<hr></slot></div>')
    })
  })
})

describe('Hydration', () => {
  const createHydrated = () => {
    const element = document.createElement('x-with-children')
    element.setAttribute('hydrate', '')
    const server = document.createElement('div')
    server.innerHTML = '<slot>Content</slot>'
    element.appendChild(server)
    return { element, server }
  }

  test('should reuse existing DOM nodes', () => {
    const element = document.createElement('x-with-context')
    element.setAttribute('hydrate', '')
    element.setAttribute('name', 'John')
    const server = document.createElement('div')
    server.textContent = 'Hello John! (light)'
    element.appendChild(server)

    window.document.body.replaceChildren(element)
    expect(element.firstChild).toBe(server)
    expect(element.childNodes).toHaveLength(1)
    expect(element.textContent).toBe('Hello John! (light)')
  })

  test('should not nest the server output into itself', () => {
    const { element } = createHydrated()
    window.document.body.replaceChildren(element)

    expect(element.innerHTML).toBe('<div><slot>Content</slot></div>')
  })

  test('should reuse the server nodes of a component with children', () => {
    const { element, server } = createHydrated()
    window.document.body.replaceChildren(element)

    expect(element.firstChild).toBe(server)
    expect(element.querySelectorAll('div')).toHaveLength(1)
  })

  test('should keep the content when moved', () => {
    const { element } = createHydrated()
    window.document.body.replaceChildren(element)

    element.remove()
    window.document.body.appendChild(element)

    expect(element.querySelector('slot')?.textContent).toBe('Content')
  })
})

describe('Form callbacks', () => {
  const button = (element: Element) => element.shadowRoot!.querySelector('button')!

  test('should dispatch formreset when the form is reset', async () => {
    window.document.body.innerHTML = '<form><x-form-control name="control"></x-form-control></form>'
    const form = document.querySelector('form')!
    const element = document.querySelector('x-form-control')!
    button(element).click()
    await settle()
    expect(button(element).textContent).toBe('changed')
    expect(Object.fromEntries(new FormData(form))).toEqual({ control: 'changed' })

    form.reset()
    await settle()
    expect(button(element).textContent).toBe('initial')
    expect(Object.fromEntries(new FormData(form))).toEqual({ control: 'initial' })
  })

  test('should pass _formDisabled for a disabled fieldset', async () => {
    // The polyfill only observes fieldsets that are inserted themselves, not ones inside an inserted form
    window.document.body.innerHTML = '<form></form>'
    const fieldset = document.createElement('fieldset')
    fieldset.innerHTML = '<x-form-control></x-form-control>'
    document.querySelector('form')!.append(fieldset)
    await settle()
    const element = fieldset.querySelector('x-form-control')!
    expect(button(element).disabled).toBe(false)

    fieldset.disabled = true
    await settle()
    expect(button(element).disabled).toBe(true)

    fieldset.disabled = false
    await settle()
    expect(button(element).disabled).toBe(false)
  })

  test('should pass _formDisabled for its own disabled attribute', async () => {
    window.document.body.innerHTML = '<x-form-control></x-form-control>'
    const element = document.querySelector('x-form-control')!
    element.setAttribute('disabled', '')
    await settle()
    expect(button(element).disabled).toBe(true)

    element.removeAttribute('disabled')
    await settle()
    expect(button(element).disabled).toBe(false)
  })

  test('should use the disabled state from before connecting', () => {
    const element: any = document.createElement('x-form-control')
    element.formDisabledCallback(true)
    window.document.body.replaceChildren(element)
    expect(button(element).disabled).toBe(true)
  })

  test('should dispatch formstaterestore with the state and mode', async () => {
    window.document.body.innerHTML = '<x-form-control></x-form-control>'
    const element: any = document.querySelector('x-form-control')
    const listener = vi.fn()
    element.addEventListener('formstaterestore', listener)

    element.formStateRestoreCallback('restored', 'restore')
    await settle()
    expect(button(element).textContent).toBe('restored')
    expect(listener.mock.calls[0]![0].detail).toEqual({ state: 'restored', mode: 'restore' })
  })

  test('should only pass _formDisabled to form-associated elements', () => {
    let props: Record<string, unknown> = {}
    const Props: FunctionComponent = (p) => {
      props = p
      return null
    }
    register(Props, 'x-no-form-disabled')
    window.document.body.innerHTML = '<x-no-form-disabled></x-no-form-disabled>'
    expect(props._formDisabled).toBeUndefined()
  })
})

describe('Registration', () => {
  test('should not throw without custom elements', () => {
    vi.stubGlobal('customElements', undefined)
    vi.stubGlobal('HTMLElement', undefined)
    try {
      expect(register(WithContext, 'x-server')).toBeUndefined()
    } finally {
      vi.unstubAllGlobals()
    }
  })

  test('should keep internal fields private', () => {
    window.document.body.innerHTML = '<x-closed></x-closed><x-form-associated></x-form-associated>'
    for (const element of document.querySelectorAll<any>('x-closed, x-form-associated')) {
      expect(Object.keys(element)).toEqual([])
      expect(element._root).toBeUndefined()
      expect(element._props).toBeUndefined()
      expect(element._internals).toBeUndefined()
    }
  })

  test('should return the element class', () => {
    const PreactElement = register(WithContext, 'x-returned', ['name'])!
    expect(customElements.get('x-returned')).toBe(PreactElement)

    const element: any = new PreactElement()
    element.name = 'John'
    window.document.body.replaceChildren(element)
    expect(element.textContent).toBe('Hello John! (light)')
  })

  test('should return the existing class when registering a tag again', () => {
    const PreactElement = register(WithContext, 'x-registered-twice')
    expect(register(WithContext, 'x-registered-twice')).toBe(PreactElement)
  })

  test('should not pass the hydrate attribute as prop', () => {
    const element = document.createElement('x-show-props')
    element.setAttribute('hydrate', '')
    element.setAttribute('first-name', 'a')
    window.document.body.replaceChildren(element)
    expect(JSON.parse(element.textContent!)).toEqual({ firstName: 'a' })
  })

  test('should expose an API on the element through _rootElement', async () => {
    window.document.body.innerHTML = '<x-exposed></x-exposed>'
    const element: any = document.querySelector('x-exposed')
    expect(element.textContent).toBe('closed')

    element.open()
    await settle()
    expect(element.textContent).toBe('open')
  })

  test('should check prop names', () => {
    const Props: FunctionComponent<{ firstName?: string } & WebComponentProps> = () => null
    const check = () => {
      register(Props, 'x-types', ['firstName', 'first-name'])
      register(Props, 'x-types', { firstName: String })
      // @ts-expect-error not a prop of the component
      register(Props, 'x-types', ['lastName'])
      // @ts-expect-error not a prop of the component
      register(Props, 'x-types', { lastName: String })
      // @ts-expect-error internal props aren't attributes
      register(Props, 'x-types', ['_rootElement'])
      // @ts-expect-error the mode is set through shadow
      register(Props, 'x-types', [], { mode: 'closed' })
      // @ts-expect-error customized built-ins aren't supported
      register(Props, 'x-types', [], { extends: 'p' })
      // @ts-expect-error style sheets aren't converted from strings
      register(Props, 'x-types', [], { adoptedStyleSheets: ['p { color: red; }'] })
    }
    expect(check).toBeTypeOf('function')
  })

  test('should accept readonly prop names', () => {
    const Props: FunctionComponent<{ firstName?: string }> = () => null
    const names = ['firstName', 'first-name'] as const
    const check = () => register(Props, 'x-types', names)
    expect(check).toBeTypeOf('function')
  })

  test('should check the return types of the attribute types', () => {
    type Props = { count?: number; flag?: boolean; tags?: string[]; firstName?: string; mode?: 'a' | 'b' }
    const Typed: FunctionComponent<Props> = () => null
    const check = () => {
      register(Typed, 'x-types', {
        count: Number,
        flag: Boolean,
        tags: (value) => value.split(','),
        'first-name': String,
        mode: (value) => (value === 'b' ? 'b' : 'a'),
      })
      // @ts-expect-error a string isn't a number
      register(Typed, 'x-types', { count: String })
      // @ts-expect-error the kebab-case name is checked against the camelCase prop
      register(Typed, 'x-types', { 'first-name': Number })
      // @ts-expect-error any string isn't one of the modes
      register(Typed, 'x-types', { mode: String })
    }
    expect(check).toBeTypeOf('function')
  })

  test('should type the properties of the element', () => {
    const Props: FunctionComponent<{ count?: number; firstName?: string; title?: string; other?: string }> = () => null
    const check = () => {
      const List = register(Props, 'x-types', ['count', 'first-name', 'title'])!
      const list = new List()
      const count: number | undefined = list.count
      const firstName: string | undefined = list.firstName
      // Native properties keep their type
      const title: string = list.title
      // @ts-expect-error not observed, so there is no property
      const other = list.other
      // @ts-expect-error the kebab-case name isn't a property
      const kebab = list['first-name']

      const Typed = register(Props, 'x-types', { count: Number })!
      const typed = new Typed()
      const typedCount: number | undefined = typed.count
      // @ts-expect-error a string isn't a number
      typed.count = 'five'
      return [count, firstName, title, other, kebab, typedCount]
    }
    expect(check).toBeTypeOf('function')
  })

  test('should use static tagName and observedAttributes', () => {
    class Static extends Component<{ first?: string }> {
      static tagName = 'x-static'
      static observedAttributes = ['first']

      render() {
        return <div>{this.props.first}</div>
      }
    }
    register(Static)

    window.document.body.innerHTML = '<x-static first="a"></x-static>'
    const element = document.querySelector('x-static')!
    element.setAttribute('first', 'b')
    expect(element.innerHTML).toBe('<div>b</div>')
  })

  test('should observe no attributes without names', () => {
    const Unnamed: FunctionComponent<{ last?: string }> = (props) => <div>{props.last}</div>
    register(Unnamed, 'x-unnamed')

    window.document.body.innerHTML = '<x-unnamed last="a"></x-unnamed>'
    const element = document.querySelector('x-unnamed')!
    element.setAttribute('last', 'b')
    expect(element.innerHTML).toBe('<div>a</div>')
  })

  test('should upgrade elements connected before registering', () => {
    window.document.body.innerHTML = '<x-late-attribute name="John"></x-late-attribute>'
    register(WithContext, 'x-late-attribute', ['name'])
    expect(document.querySelector('x-late-attribute')!.textContent).toBe('Hello John! (light)')
  })

  test('should apply properties set before upgrading', () => {
    const element: any = document.createElement('x-late-property')
    element.name = 'John'
    window.document.body.replaceChildren(element)
    register(WithContext, 'x-late-property', ['name'])
    expect(element.textContent).toBe('Hello John! (light)')
    expect(element.getAttribute('name')).toBe('John')

    element.name = 'Jane'
    expect(element.textContent).toBe('Hello Jane! (light)')
  })

  test('should keep object values set before upgrading', () => {
    const value = ['John']
    const element: any = document.createElement('x-late-object')
    element.name = value
    window.document.body.replaceChildren(element)
    register(WithContext, 'x-late-object', ['name'])
    expect(element.name).toBe(value)
    expect(element.hasAttribute('name')).toBe(false)
    expect(element.textContent).toBe('Hello John! (light)')
  })
})

describe('Shadow root', () => {
  test('should reuse an existing closed shadow root', () => {
    const element = document.createElement('x-existing-closed')
    const shadow = element.attachShadow({ mode: 'closed' })
    window.document.body.replaceChildren(element)
    register(ShadowRootProp, 'x-existing-closed', [], { shadow: { mode: 'closed' } })

    expect(shadowRootProp).toBe(shadow)
    expect(shadow.innerHTML).toBe('<div>shadow</div>')
  })

  test('should pass the shadow options to attachShadow', () => {
    const attachShadow = vi.spyOn(Element.prototype, 'attachShadow')
    register(WithSlot, 'x-delegates-focus', [], { shadow: { delegatesFocus: true } })
    window.document.body.innerHTML = '<x-delegates-focus></x-delegates-focus>'
    const calls = attachShadow.mock.calls
    attachShadow.mockRestore()

    expect(calls).toEqual([[{ mode: 'open', delegatesFocus: true }]])
  })

  test('should share adopted style sheets between instances', () => {
    const sheet = new CSSStyleSheet()
    sheet.replaceSync('p { color: red; }')
    register(WithSlot, 'x-adopted-styles', [], { shadow: true, adoptedStyleSheets: [sheet] })
    window.document.body.innerHTML = '<x-adopted-styles></x-adopted-styles><x-adopted-styles></x-adopted-styles>'
    const [a, b] = [...document.querySelectorAll('x-adopted-styles')].map((element) => element.shadowRoot!)

    expect(a!.adoptedStyleSheets).toEqual([sheet])
    expect(b!.adoptedStyleSheets).toEqual([sheet])
  })

  test('should pass a closed shadow root as _shadowRoot', () => {
    const attachShadow = vi.spyOn(Element.prototype, 'attachShadow')
    window.document.body.innerHTML = '<x-shadow-root-prop></x-shadow-root-prop>'
    const shadow = attachShadow.mock.results[0]!.value
    attachShadow.mockRestore()

    expect(document.querySelector('x-shadow-root-prop')!.shadowRoot).toBeNull()
    expect(shadowRootProp).toBe(shadow)
  })
})

describe('Attributes', () => {
  test('should pass kebab-case attributes as camelCase props', () => {
    window.document.body.innerHTML = '<x-show-props first-name="a"></x-show-props>'
    const element = document.querySelector('x-show-props')!
    expect(JSON.parse(element.textContent!)).toEqual({ firstName: 'a' })

    element.setAttribute('first-name', 'b')
    expect(JSON.parse(element.textContent!)).toEqual({ firstName: 'b' })

    element.removeAttribute('first-name')
    expect(JSON.parse(element.textContent!)).toEqual({})
  })

  test('should observe camelCase names in their kebab form', () => {
    expect((customElements.get('x-show-camel') as any).observedAttributes).toEqual(['first-name'])

    window.document.body.innerHTML = '<x-show-camel first-name="a"></x-show-camel>'
    const element: any = document.querySelector('x-show-camel')!
    expect(JSON.parse(element.textContent!)).toEqual({ firstName: 'a' })

    element.setAttribute('first-name', 'b')
    expect(JSON.parse(element.textContent!)).toEqual({ firstName: 'b' })
    expect(element.firstName).toBe('b')
  })

  test('should convert attributes with a type map', () => {
    window.document.body.innerHTML = '<x-show-typed count="5" flag label="x" list="a,b"></x-show-typed>'
    const element: any = document.querySelector('x-show-typed')!
    expect(JSON.parse(element.textContent!)).toEqual({ count: 5, flag: true, label: 'x', list: ['a', 'b'] })
    expect(element.count).toBe(5)

    element.removeAttribute('flag')
    element.removeAttribute('count')
    expect(JSON.parse(element.textContent!)).toEqual({ flag: false, label: 'x', list: ['a', 'b'] })
  })

  test('should pass false for a missing boolean attribute', () => {
    window.document.body.innerHTML = '<x-show-typed></x-show-typed>'
    const element: any = document.querySelector('x-show-typed')!
    expect(JSON.parse(element.textContent!)).toEqual({ flag: false })
    expect(element.flag).toBe(false)
  })
})

describe('Slots', () => {
  test('should prefer slots over attributes with the same name', () => {
    window.document.body.innerHTML = '<x-named-observed header="attr"><b slot="header">H</b></x-named-observed>'
    const element = document.querySelector('x-named-observed')!
    expect(element.textContent).toBe('H')

    element.setAttribute('header', 'changed')
    expect(element.textContent).toBe('H')
  })

  test('should not replace the children with slot="children"', () => {
    window.document.body.innerHTML = '<x-with-children><b slot="children">x</b><i>y</i></x-with-children>'
    const element = document.querySelector('x-with-children')!
    expect(element.querySelector('slot')!.innerHTML).toBe('<i>y</i>')

    element.remove()
    expect(element.querySelector('b')?.textContent).toBe('x')
  })

  test('should pass kebab-case slot names as camelCase prop', () => {
    window.document.body.innerHTML = '<x-kebab-slot><b slot="my-header">H</b></x-kebab-slot>'
    expect(document.querySelector('x-kebab-slot')!.textContent).toBe('H')
  })
})

describe('Reserved attribute names', () => {
  test('should pass key and ref as props', () => {
    window.document.body.innerHTML = '<x-reserved-names key="a" ref="b"></x-reserved-names>'
    const element = document.querySelector('x-reserved-names')!
    expect(JSON.parse(element.querySelector('div')!.textContent!)).toEqual({ key: 'a', ref: 'b' })

    element.setAttribute('key', 'c')
    element.setAttribute('ref', 'd')
    expect(JSON.parse(element.querySelector('div')!.textContent!)).toEqual({ key: 'c', ref: 'd' })
  })

  test('should keep the children when an attribute is named children', () => {
    window.document.body.innerHTML = '<x-reserved-names children="a"><b>child</b></x-reserved-names>'
    const element = document.querySelector('x-reserved-names')!
    element.setAttribute('children', 'b')
    expect(element.querySelector('slot')!.innerHTML).toBe('<b>child</b>')
  })
})

describe('Lifecycle', () => {
  beforeEach(() => {
    window.document.body.replaceChildren()
    lifecycle.length = 0
    instances = 0
  })

  test('should keep DOM nodes when attributes change', () => {
    window.document.body.innerHTML = '<x-lifecycle name="a"></x-lifecycle>'
    const element = document.querySelector('x-lifecycle')!
    const node = element.firstChild
    element.setAttribute('name', 'b')
    expect(element.firstChild).toBe(node)
    expect(lifecycle).toEqual(['mount'])
  })

  test('should unmount when disconnected', () => {
    window.document.body.innerHTML = '<x-lifecycle name="a"></x-lifecycle>'
    const element = document.querySelector('x-lifecycle')!
    element.remove()
    expect(lifecycle).toEqual(['mount', 'unmount'])
    expect(element.innerHTML).toBe('')
  })

  test('should apply attribute changes made while disconnected', () => {
    window.document.body.innerHTML = '<x-lifecycle name="a"></x-lifecycle>'
    const element = document.querySelector('x-lifecycle')!
    element.remove()
    element.setAttribute('name', 'b')
    expect(element.innerHTML).toBe('')

    window.document.body.appendChild(element)
    expect(element.innerHTML).toBe('<div>2: b</div>')
  })

  test('should remount and reset state when moved', () => {
    window.document.body.innerHTML = '<x-lifecycle name="a"></x-lifecycle><section></section>'
    const element = document.querySelector('x-lifecycle')!
    expect(element.innerHTML).toBe('<div>1: a</div>')

    document.querySelector('section')!.appendChild(element)
    expect(lifecycle).toEqual(['mount', 'unmount', 'mount'])
    expect(element.innerHTML).toBe('<div>2: a</div>')
  })

  test('should mount nested custom elements once in a shadow root', () => {
    window.document.body.innerHTML = '<x-with-children-shadow><x-lifecycle></x-lifecycle></x-with-children-shadow>'
    expect(lifecycle).toEqual(['mount'])
  })
})

describe('DOM properties', () => {
  test('should read attributes as properties', () => {
    window.document.body.innerHTML = '<x-with-context name="John"></x-with-context>'
    const element: any = document.querySelector('x-with-context')
    expect(element.name).toBe('John')

    element.setAttribute('name', 'Jane')
    expect(element.name).toBe('Jane')

    element.removeAttribute('name')
    expect(element.name).toBeUndefined()
  })

  test('should update rendered output and reflect to attribute', () => {
    window.document.body.innerHTML = '<x-with-context name="John"></x-with-context>'
    const element: any = document.querySelector('x-with-context')
    element.name = 'Jane'
    expect(window.document.body.innerHTML).toBe(
      '<x-with-context name="Jane"><div>Hello Jane! (light)</div></x-with-context>',
    )
  })

  test('should not render until connected', () => {
    const element: any = document.createElement('x-with-context')
    element.name = 'John'
    expect(element.innerHTML).toBe('')

    window.document.body.replaceChildren(element)
    expect(element.innerHTML).toBe('<div>Hello John! (light)</div>')
  })

  test('should keep the type of primitive values', () => {
    const element: any = document.createElement('x-with-context')
    window.document.body.replaceChildren(element)
    element.name = 5
    expect(element.name).toBe(5)
    expect(element.getAttribute('name')).toBe('5')
  })

  test('should remove the attribute when set to null', () => {
    window.document.body.innerHTML = '<x-with-context name="John"></x-with-context>'
    const element: any = document.querySelector('x-with-context')
    element.name = null
    expect(element.hasAttribute('name')).toBe(false)
    expect(element.name).toBeUndefined()
  })

  test('should keep object values when reconnecting', () => {
    const value = ['Jane']
    const element: any = document.createElement('x-with-context')
    window.document.body.replaceChildren(element)
    element.name = value
    expect(element.hasAttribute('name')).toBe(false)

    element.remove()
    window.document.body.replaceChildren(element)
    expect(element.name).toBe(value)
    expect(element.innerHTML).toBe('<div>Hello Jane! (light)</div>')
  })

  test('should remove the attribute when set to false', () => {
    window.document.body.innerHTML = '<x-show-flag flag></x-show-flag>'
    const element: any = document.querySelector('x-show-flag')
    element.flag = false

    expect(element.matches('[flag]')).toBe(false)
    expect(element.flag).toBe(false)
    expect(element.textContent).toBe('false')
  })

  test('should set an empty attribute when set to true', () => {
    window.document.body.innerHTML = '<x-show-flag></x-show-flag>'
    const element: any = document.querySelector('x-show-flag')
    element.flag = true

    expect(element.getAttribute('flag')).toBe('')
    expect(element.flag).toBe(true)
    expect(element.textContent).toBe('true')
  })

  test('should define the camelCase property of kebab-case attributes', () => {
    window.document.body.innerHTML = '<x-show-props first-name="a"></x-show-props>'
    const element: any = document.querySelector('x-show-props')
    expect(element.firstName).toBe('a')

    element.firstName = 'b'
    expect(element.getAttribute('first-name')).toBe('b')
    expect(element.hasAttribute('firstname')).toBe(false)
    expect('first-name' in element).toBe(false)
    expect(JSON.parse(element.textContent!)).toEqual({ firstName: 'b' })
  })

  test('should take objects from a Preact parent through the camelCase property', () => {
    const container = document.createElement('main')
    window.document.body.replaceChildren(container)
    const value = { a: 1 }
    render(h('x-show-props', { firstName: value }), container)
    const element: any = container.querySelector('x-show-props')

    expect(element.getAttributeNames()).toEqual([])
    expect(element.firstName).toBe(value)
    expect(JSON.parse(element.textContent!)).toEqual({ firstName: value })
  })

  test('should apply camelCase properties set before upgrading', () => {
    const element: any = document.createElement('x-late-camel')
    element.firstName = 'a'
    window.document.body.replaceChildren(element)
    register(ShowProps, 'x-late-camel', ['first-name'])

    expect(element.getAttribute('first-name')).toBe('a')
    expect(JSON.parse(element.textContent!)).toEqual({ firstName: 'a' })
  })

  test('should keep native properties of observed names', () => {
    window.document.body.innerHTML = '<x-show-style></x-show-style>'
    const element: any = document.querySelector('x-show-style')
    expect(element.style).toBeInstanceOf(CSSStyleDeclaration)

    element.style.color = 'red'
    expect(JSON.parse(element.textContent!)).toEqual({ style: 'color: red;' })
  })

  test('should not render for unchanged attribute values', () => {
    window.document.body.innerHTML = '<x-record-types name="a"></x-record-types>'
    const element = document.querySelector('x-record-types')!
    renderedTypes.length = 0
    element.setAttribute('name', 'a')
    element.setAttribute('name', 'b')
    element.setAttribute('name', 'b')

    expect(renderedTypes).toEqual(['string'])
  })

  test('should render a property once with its original type', () => {
    window.document.body.innerHTML = '<x-record-types></x-record-types>'
    const element: any = document.querySelector('x-record-types')
    renderedTypes.length = 0
    element.name = 5

    expect(renderedTypes).toEqual(['number'])
    expect(element.getAttribute('name')).toBe('5')
  })

  test('should remove the attribute when set to an object', () => {
    window.document.body.innerHTML = '<x-with-context name="old"></x-with-context>'
    const element: any = document.querySelector('x-with-context')
    element.name = ['Jane']

    expect(element.hasAttribute('name')).toBe(false)
    expect(element.textContent).toBe('Hello Jane! (light)')
  })

  test('should unhide an element when hidden is set to false', () => {
    window.document.body.innerHTML = '<x-show-hidden hidden></x-show-hidden>'
    const element: any = document.querySelector('x-show-hidden')
    element.hidden = false

    expect(element.hasAttribute('hidden')).toBe(false)
  })
})
