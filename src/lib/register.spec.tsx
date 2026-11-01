import { createContext, type FunctionComponent } from 'preact'
import { useContext, useLayoutEffect } from 'preact/hooks'
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

register(Context, 'x-context', ['name'], { shadow: true })
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
