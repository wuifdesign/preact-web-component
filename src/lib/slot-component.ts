import { Component, h } from 'preact'

export class SlotComponent extends Component<any, never> {
  private readonly _onPreact = (event: CustomEvent) => {
    event.stopPropagation()
    event.detail.context = this.context
  }

  constructor(props: any, context?: any) {
    super(props, context)
  }

  render() {
    // Has to be a prop as refs are applied after the children connected, which is when they ask for the context
    return h('slot', { ...this.props, on_preact: this._onPreact })
  }
}
