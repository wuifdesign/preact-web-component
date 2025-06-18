import { Component, h } from 'preact'

export class SlotComponent extends Component<any, never> {
  private _ref: HTMLElement | undefined
  private _listener: ((event: CustomEvent) => void) | undefined

  constructor(props: any, context?: any) {
    super(props, context)
  }

  render() {
    return h('slot', { ...this.props, ref: this._setRef.bind(this) })
  }

  private _setRef(r: HTMLElement) {
    if (!r) {
      if (this._listener) {
        this._ref?.removeEventListener('_preact' as any, this._listener)
      }
    } else {
      this._ref = r
      if (!this._listener) {
        this._listener = (event: CustomEvent) => {
          event.stopPropagation()
          event.detail.context = this.context
        }
        r.addEventListener('_preact' as any, this._listener)
      }
    }
  }
}
