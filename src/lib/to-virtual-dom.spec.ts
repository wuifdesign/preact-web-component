import type { VNode } from 'preact'
import { SlotComponent } from './slot-component'
import { toSlots, toVirtualDom } from './to-virtual-dom'

const toElement = (html: string) => {
  const template = document.createElement('template')
  template.innerHTML = html
  return template.content.firstChild as HTMLElement
}

const convert = (html: string, moveNodes = true): VNode<any> => {
  const element = toElement(html)
  return toVirtualDom(element, Root, toSlots([...element.childNodes]), moveNodes)
}

const Root = () => null

describe('toVirtualDom', () => {
  test('should render the component', () => {
    expect(convert('<div></div>').type).toBe(Root)
  })

  test('should map attributes to camelCase prop names', () => {
    const { props } = convert('<div first-name="a"></div>')
    expect(props).toMatchObject({ firstName: 'a' })
    expect(props).not.toHaveProperty('first-name')
  })

  test('should pass key and ref as props', () => {
    const vnode = convert('<div key="a" ref="b"></div>')
    expect(vnode.props).toMatchObject({ key: 'a', ref: 'b' })
    expect(vnode.key).toBeUndefined()
  })

  test('should not pass the hydrate attribute as prop', () => {
    expect(convert('<div hydrate></div>').props).not.toHaveProperty('hydrate')
  })

  test('should not pass the slot attribute as prop', () => {
    expect(convert('<div slot="header"></div>').props).not.toHaveProperty('slot')
  })

  test('should pass the nodes to the default slot', () => {
    const element = toElement('<div>text<span></span></div>')
    const nodes = [...element.childNodes]
    const vnode: VNode<any> = toVirtualDom(element, Root, toSlots(nodes), true)

    expect(vnode.props.children.type).toBe(SlotComponent)
    expect(vnode.props.children.props.nodes).toEqual(nodes)
  })

  test('should move named slots to props', () => {
    const vnode = convert('<div><b slot="header">text</b><i slot="header"></i><u></u></div>')
    expect(vnode.props.header.type).toBe(SlotComponent)
    expect(vnode.props.header.props.name).toBe('header')
    expect(vnode.props.header.props.nodes.map((node: Element) => node.localName)).toEqual(['b', 'i'])
    expect(vnode.props.children.props.nodes.map((node: Element) => node.localName)).toEqual(['u'])
  })

  test('should not pass nodes when they are assigned natively', () => {
    const vnode = convert('<div><b slot="header"></b><u></u></div>', false)
    expect(vnode.props.header.props.nodes).toBeUndefined()
    expect(vnode.props.children.props.nodes).toBeUndefined()
  })
})
