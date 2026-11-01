import type { VNode } from 'preact'
import { SlotComponent } from './slot-component'
import { toVirtualDom } from './to-virtual-dom'

const toElement = (html: string) => {
  const template = document.createElement('template')
  template.innerHTML = html
  return template.content.firstChild as HTMLElement
}

describe('toVirtualDom', () => {
  test('should return text of text nodes', () => {
    expect(toVirtualDom(document.createTextNode('text'), null)).toBe('text')
  })

  test('should return null for other nodes', () => {
    expect(toVirtualDom(document.createComment('comment'), null)).toBeNull()
  })

  test('should map attributes to both prop names', () => {
    const vnode: VNode<any> = toVirtualDom(toElement('<div first-name="a"></div>'), null)
    expect(vnode.type).toBe('div')
    expect(vnode.props).toMatchObject({ 'first-name': 'a', firstName: 'a' })
  })

  test('should not pass the slot attribute as prop', () => {
    const vnode: VNode<any> = toVirtualDom(toElement('<div slot="header"></div>'), null)
    expect(vnode.props).not.toHaveProperty('slot')
  })

  test('should only wrap the topmost node with a slot', () => {
    const Root = () => null
    const vnode: VNode<any> = toVirtualDom(toElement('<div><span>text</span></div>'), Root)
    expect(vnode.type).toBe(Root)

    const slot = vnode.props.children
    expect(slot.type).toBe(SlotComponent)

    const [span] = slot.props.children
    expect(span.type).toBe('span')
    expect(span.props.children).toEqual(['text'])
  })

  test('should move named slots to props', () => {
    const vnode: VNode<any> = toVirtualDom(toElement('<div><b slot="header">text</b></div>'), () => null)
    expect(vnode.props.header.type).toBe(SlotComponent)
    expect(vnode.props.header.props.name).toBe('header')
    expect(vnode.props.header.props.children.type).toBe('b')
  })
})
