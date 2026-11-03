import { Component, createRef, h } from 'preact'

export class SlotComponent extends Component<any, never> {
  readonly #slot = createRef<HTMLSlotElement>()

  readonly #onPreact = (event: CustomEvent) => {
    event.stopPropagation()
    event.detail.context = this.context
  }

  // `nodes` only holds nodes waiting for a slot, while mounted the DOM is the source of truth
  componentDidMount() {
    // Runs after the slot connected, as nested custom elements ask for the context when they connect
    this.componentDidUpdate()
  }

  componentDidUpdate() {
    if (this.props.nodes?.length) {
      this.#slot.current!.append(...this.props.nodes.splice(0))
    }
  }

  componentWillUnmount() {
    this.props.nodes?.push(...this.#slot.current!.childNodes)
  }

  render() {
    const { nodes, ...props } = this.props
    return h('slot', { ...props, ref: this.#slot, on_preact: this.#onPreact })
  }
}
