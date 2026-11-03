import type { ComponentType, JSX } from 'preact'
import {
  type AttributeName,
  type PropType,
  type PropTypes,
  register,
  type RegisterOptions,
  type WebComponentConstructor,
  type WebComponentElement,
} from './lib/register'
import { SlotComponent } from './lib/slot-component'
import type { WebComponentProps } from './types/web-component-props'

/** A `<slot>` that passes the Preact context on to the elements assigned to it. */
const Slot = SlotComponent as ComponentType<JSX.IntrinsicElements['slot']>

export { register, Slot }
export type {
  AttributeName,
  PropType,
  PropTypes,
  RegisterOptions,
  WebComponentConstructor,
  WebComponentElement,
  WebComponentProps,
}
