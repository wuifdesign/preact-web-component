import { h } from 'preact'
import { SlotComponent } from './slot-component'
import { toCamelCase } from './to-camel-case'

export const toVirtualDom = (element: ChildNode, nodeName: any) => {
  if (element.nodeType === 3) return (element as any).data
  if (element.nodeType !== 1) return null
  const children: any[] = []
  const props: Record<string, any> = {}
  const a = (element as any).attributes
  const cn = element.childNodes
  let i = 0
  for (i = a.length; i--; ) {
    if (a[i].name !== 'slot') {
      props[a[i].name] = a[i].value
      props[toCamelCase(a[i].name)] = a[i].value
    }
  }

  for (i = cn.length; i--; ) {
    const virtualNode = toVirtualDom(cn[i], null)
    // Move slots correctly
    const name = (cn[i] as any).slot
    if (name) {
      props[name] = h(SlotComponent, { name }, virtualNode)
    } else {
      children[i] = virtualNode
    }
  }

  // Only wrap the topmost node with a slot
  const wrappedChildren = nodeName ? h(SlotComponent, null, children) : children
  return h(nodeName || element.nodeName.toLowerCase(), props, wrappedChildren)
}
