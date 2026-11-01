import { createContext, type FunctionComponent, render } from 'preact'
import { useContext, useEffect, useState } from 'preact/hooks'
import { register } from '../src/lib/register'
import type { WebComponentProps } from '../src/types/web-component-props'

// Page styles can't reach into a shadow root, so these are rendered inside each one
const shadowStyles = `
  :host { display: block; }
  p { margin: 0; }
  .projected { padding: 0.125rem 0.375rem; background: #d5efe9; color: #0b4f46; }
  .panel { border: 1px solid #c6cde0; }
  .panel header, .panel footer { display: block; padding: 0.5rem 1rem; background: #d5efe9; color: #0b4f46; }
  .panel p { padding: 1rem; }
  label { display: grid; gap: 0.25rem; }
  input { padding: 0.5rem; border: 1px solid #4a5272; border-radius: 0.25rem; font: inherit; }
  input:focus-visible { outline: 3px solid #be185d; outline-offset: 2px; }
`

const Theme = createContext('light')

const Context: FunctionComponent<{ theme: string }> = (props) => {
  return <Theme.Provider value={props.theme}>{props.children}</Theme.Provider>
}

const WithContext: FunctionComponent<{ name: string }> = (props) => {
  const theme = useContext(Theme)
  return (
    <p class="greeting" data-theme={theme}>
      Hello {props.name}, the theme is {theme}.
    </p>
  )
}

const WithSlot: FunctionComponent<{ name: string }> = (props) => {
  return (
    <>
      <style>{shadowStyles}</style>
      <p>
        For {props.name}:{' '}
        <span class="projected">
          <slot></slot>
        </span>
      </p>
    </>
  )
}

const WithNamedSlot: FunctionComponent<{ name: string }> = (props) => {
  return (
    <>
      <style>{shadowStyles}</style>
      <div class="panel">
        <header>
          <slot name="header"></slot>
        </header>
        <p>Rendered by the component for {props.name}</p>
        <footer>
          <slot name="footer"></slot>
        </footer>
      </div>
    </>
  )
}

const KebabCase: FunctionComponent<{ firstName: string }> = (props) => {
  return (
    <p class="greeting" data-theme="light">
      Hello {props.firstName}, from the first-name attribute.
    </p>
  )
}

const AsIs: FunctionComponent<{ name: string }> = (props) => {
  return <>Content rendered into the paragraph for {props.name}</>
}

const FormAssociated: FunctionComponent<WebComponentProps & { value?: string }> = (props) => {
  const [value, setValue] = useState(props.value ?? '')
  useEffect(() => {
    props._internals?.setFormValue(value)
  }, [value])
  return (
    <>
      <style>{shadowStyles}</style>
      <label>
        Value
        <input
          value={value}
          onInput={(event) => setValue(event.currentTarget.value)}
          // A shadow input has no form owner, so Enter doesn't submit the form on its own
          onKeyDown={(event) => event.key === 'Enter' && props._internals?.form?.requestSubmit()}
        />
      </label>
    </>
  )
}

register(Context, 'x-context', ['theme'], { shadow: true })
register(Context, 'x-context-light', ['theme'])
register(WithContext, 'x-with-context', ['name'])
register(WithSlot, 'x-with-slot', ['name'], { shadow: true })
register(WithNamedSlot, 'x-with-named-slots', ['name'], { shadow: true })
register(KebabCase, 'x-kebab-case', ['first-name'])
register(AsIs, 'x-as-is', ['name'], { extends: 'p', ExtendsComponent: HTMLParagraphElement })
register(FormAssociated, 'x-form-associated', [], { shadow: true, formAssociated: true })

const OpeningTag: FunctionComponent<{ element: Element }> = ({ element }) => {
  return (
    <>
      &lt;<span class="tag-name">{element.localName}</span>
      {[...element.attributes].map((attribute) => (
        <>
          {' '}
          <span class="attr-name">{attribute.name}</span>=<span class="attr-value">"{attribute.value}"</span>
        </>
      ))}
      &gt;
    </>
  )
}

const ClosingTag: FunctionComponent<{ element: Element }> = ({ element }) => {
  return (
    <>
      &lt;/<span class="tag-name">{element.localName}</span>&gt;
    </>
  )
}

// Read the tags from the live element and keep watching it, so the labels always match the markup
for (const stage of document.querySelectorAll('.demo-stage')) {
  const element = stage.firstElementChild!
  const openingTag = document.createElement('code')
  const closingTag = document.createElement('code')
  openingTag.className = closingTag.className = 'tag'
  stage.before(openingTag)
  stage.after(closingTag)
  const renderOpeningTag = () => render(<OpeningTag element={element} />, openingTag)
  renderOpeningTag()
  new MutationObserver(renderOpeningTag).observe(element, { attributes: true })
  render(<ClosingTag element={element} />, closingTag)
  stage.classList.toggle('has-shadow-root', element.shadowRoot !== null)
}

for (const button of document.querySelectorAll('[data-switch-theme]')) {
  const provider = button.closest('.demo-tree')!.querySelector('.demo-stage')!.firstElementChild!
  button.addEventListener('click', () => {
    provider.setAttribute('theme', provider.getAttribute('theme') === 'dark' ? 'light' : 'dark')
  })
}

const form = document.querySelector('form')!
form.addEventListener('submit', (event) => {
  event.preventDefault()
  form.querySelector('output')!.value = JSON.stringify(Object.fromEntries(new FormData(form)))
})
