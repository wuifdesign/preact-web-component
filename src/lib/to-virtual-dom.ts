import { h } from 'preact'
import { SlotComponent } from './slot-component'
import { toCamelCase } from './to-camel-case'

// `children` is always the slotted content, `hydrate` is meant for the element
const IGNORED_ATTRIBUTES = ['slot', 'children', 'hydrate']

export type Slots = Record<string, ChildNode[]>

export const addToSlot = (slots: Slots, node: ChildNode) => {
  ;(slots[(node as Element).slot || ''] ||= []).push(node)
}

export const toSlots = (nodes: ChildNode[]) => {
  const slots: Slots = { '': [] }
  nodes.forEach((node) => addToSlot(slots, node))
  return slots
}

// Without a shadow root the slots move their nodes into themselves, a shadow root assigns them natively.
export const toVirtualDom = (element: Element, Component: any, slots: Slots, moveNodes: boolean) => {
  const props: Record<string, any> = {}
  const a = element.attributes
  for (let i = a.length; i--;) {
    const { name, value } = a[i]!
    if (!IGNORED_ATTRIBUTES.includes(name)) {
      props[toCamelCase(name)] = value
    }
  }

  for (const name in slots) {
    const slot = h(SlotComponent, { name: name || undefined, nodes: moveNodes ? slots[name] : undefined })
    if (!name) {
      props.children = slot
    } else if (name !== 'children') {
      // `slot="children"` would replace the default slot, its nodes are only assigned natively
      props[toCamelCase(name)] = slot
    }
  }

  // Assigned after creating, as `h()` would take `key` and `ref` for the vnode instead of passing them as props
  const vnode = h(Component, null)
  Object.assign(vnode.props, props)
  return vnode
}
