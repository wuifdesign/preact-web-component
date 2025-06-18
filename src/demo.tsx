import { createContext, type FunctionComponent } from 'preact'
import { useContext, useEffect } from 'preact/hooks'
import { register } from './lib/register'
import type { WebComponentProps } from './types/web-component-props'

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
  useEffect(() => {
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
