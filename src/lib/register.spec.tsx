import { cloneElement, Component, createContext, type FunctionComponent, type VNode } from 'preact'
import { useContext, useLayoutEffect, useState } from 'preact/hooks'
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

const AsIs: FunctionComponent<{ name: string }> = (props) => {
  return <>As-Is Content ({props.name})</>
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

const ShowProps: FunctionComponent<Record<string, string>> = ({ children, _rootElement, _internals, ...rest }) => {
  return <div>{JSON.stringify(rest)}</div>
}

const RootElement: FunctionComponent<WebComponentProps> = (props) => {
  return <div>{props._rootElement?.tagName}</div>
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

register(Connected, 'x-connected')
register(Context, 'x-context', ['name'], { shadow: true })
register(Context, 'x-context-light', ['name'])
register(NamedContext, 'x-context-named')
register(DynamicContext, 'x-dynamic-context', ['name'], { shadow: true })
register(ClonedChildren, 'x-cloned-children', ['name'], { shadow: true })
register(WithChildren, 'x-with-children', ['name'])
register(ShowProps, 'x-show-props', ['first-name'])
register(RootElement, 'x-root-element')
register(Lifecycle, 'x-lifecycle', ['name'])
register(WithSlot, 'x-closed', ['name'], { shadow: true, mode: 'closed' })
register(WithContext, 'x-with-context', ['name'])
register(WithSlot, 'x-with-slot', ['name'], { shadow: true })
register(WithNamedSlot, 'x-with-named-slots', ['name'], { shadow: true })
register(AsIs, 'x-as-is', ['name'], { extends: 'p', ExtendsComponent: HTMLParagraphElement })
register(FormAssociated, 'x-form-associated', [], { shadow: true, formAssociated: true })

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

  test('should component using is property', () => {
    window.document.body.innerHTML = '<p is="x-as-is" name="John"></p>'
    expect(window.document.body.innerHTML).toBe('<p is="x-as-is" name="John">As-Is Content (John)</p>')
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
})

describe('Hydration', () => {
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
})

describe('Registration', () => {
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

  test('should use displayName as tag name', () => {
    const Display: FunctionComponent = () => <div>Display</div>
    Display.displayName = 'x-display-name'
    register(Display)

    expect(customElements.get('x-display-name')).toBeDefined()
  })

  test('should use the function name as tag name', () => {
    const { 'x-function-name': Named } = { 'x-function-name': () => <div>Named</div> }
    register(Named)

    expect(customElements.get('x-function-name')).toBeDefined()
  })

  test('should infer observed attributes from propTypes', () => {
    const Inferred: FunctionComponent<{ last?: string }> & { propTypes?: Record<string, any> } = (props) => (
      <div>{props.last}</div>
    )
    Inferred.propTypes = { last: Object }
    register(Inferred, 'x-inferred')

    window.document.body.innerHTML = '<x-inferred last="a"></x-inferred>'
    const element = document.querySelector('x-inferred')!
    element.setAttribute('last', 'b')
    expect(element.innerHTML).toBe('<div>b</div>')
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

describe('Attributes', () => {
  test('should pass kebab-case attributes as both prop names', () => {
    window.document.body.innerHTML = '<x-show-props first-name="a"></x-show-props>'
    const element = document.querySelector('x-show-props')!
    expect(JSON.parse(element.textContent!)).toEqual({ 'first-name': 'a', firstName: 'a' })

    element.setAttribute('first-name', 'b')
    expect(JSON.parse(element.textContent!)).toEqual({ 'first-name': 'b', firstName: 'b' })

    element.removeAttribute('first-name')
    expect(JSON.parse(element.textContent!)).toEqual({})
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
})
