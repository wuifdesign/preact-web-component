export type WebComponentProps<T = HTMLElement> = {
  /** The custom element. */
  _rootElement?: T
  /** The result of `attachInternals()`, set for `formAssociated` elements and closed shadow roots. */
  _internals?: ElementInternals
  /** The shadow root the component renders into, also set for closed shadow roots. */
  _shadowRoot?: ShadowRoot
  /** Whether a `formAssociated` element is disabled, by its own `disabled` attribute or a disabled `<fieldset>`. */
  _formDisabled?: boolean
}
