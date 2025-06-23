# preact-web-component

This package allows you to generate and register custom elements (Web Components) from Preact components. It enables 
seamless integration of Preact-based UI components into any HTML environment—framework-agnostic and standards-compliant.

Use it to encapsulate your Preact components as reusable Web Components that can be dropped into any web app, regardless 
of the underlying JavaScript framework.

This package is built on top of [preactjs/preact-custom-element](https://github.com/preactjs/preact-custom-element) but
adds first-class TypeScript support.

## Usage

Import `register` and call it with your component, a tag name, and a list of attribute names you want to observe:

```tsx
import { register, WebComponentProps } from 'preact-web-component';
import type { FunctionComponent } from 'preact';

const Greeting: FunctionComponent<WebComponentProps & { name: string }> = ({ name = 'World' }) => (
  <p>Hello, {name}!</p>
);

register(Greeting, 'x-greeting', ['name']);
```

> _**\* Note:** as per the [Custom Elements specification](https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name), the tag name must contain a hyphen._

Use the new tag name in HTML, attribute keys and values will be passed in as props:

```html
<x-greeting name="Billy Jo"></x-greeting>
```

Output:

```html
<p>Hello, Billy Jo!</p>
```

### Getting custom element base element inside component

The `_rootElement` variable is passed as a prop to each component and can be used to access the base element. When using 
TypeScript, you can use the `WebComponentProps` type to ensure correct typing.

### Customized built-in elements

```tsx
import { Component } from 'preact';
import { register } from 'preact-web-component';

// <x-greeting name="Bo"></x-greeting>
class Greeting extends Component {
  // Register as <x-greeting>:
  static tagName = 'x-greeting';

  // Track these attributes:
  static observedAttributes = ['name'];

  render({ name }) {
    return <p>Hello, {name}!</p>;
  }
}
register(Greeting, 'x-greeting', [name], { extends: "p", ExtendsComponent: HTMLParagraphElement });
```

```html
<p is="x-greeting" name="Billy Jo"></p>
```

Output:

```html
<p>Hello, Billy Jo!</p>
```

For more info see [Customized built-in elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#customized_built-in_elements)

### Creating a formAssociated Element

```tsx
import { useEffect } from 'preact';
import { register, WebComponentProps } from 'preact-web-component';
import type { FunctionComponent } from 'preact';

const Greeting: FunctionComponent<WebComponentProps & { name: string }> = ({ name = 'World' }) => {
  useEffect(() => {
    props._internals?.setFormValue('demo')
  })
  return <p>Hello, {name}!</p>;
}

register(Greeting, 'x-greeting', ['name'], [], { shadow: true, formAssociated: true });
```

With the ElementInternals API (`attachInternals()`), you can create custom elements that behave like native form 
controls. This enables your element to:

- Have a value that participates in form submission
- Be validated as part of a form
- Integrate with form-related properties (e.g., form, name, type)

If enabled, the `_internals` property will be available on the element, containing the result of `attachInternals()` 
and allowing access to form-associated features.

see: [attachInternals](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/attachInternals)

### Prop Names and Automatic Prop Names

The Custom Elements V1 specification requires explicitly stating the names of any attributes you want to observe. 
From your Preact component perspective, `props` could be an object with any keys at runtime, so it's not always clear 
which props should be accepted as attributes.

If you omit the third parameter to `register()`, the list of attributes to observe can be specified using a 
static `observedAttributes` property on your Component. This also works for the Custom Element's name, which can be 
specified using a `tagName` static property:

```tsx
import { Component } from 'preact';
import { register } from 'preact-web-component';

// <x-greeting name="Bo"></x-greeting>
class Greeting extends Component {
  // Register as <x-greeting>:
  static tagName = 'x-greeting';

  // Track these attributes:
  static observedAttributes = ['name'];

  render({ name }) {
    return <p>Hello, {name}!</p>;
  }
}
register(Greeting);
```

If no `observedAttributes` are specified, they will be inferred from the keys of `propTypes` if present on the Component:

```tsx
// Other option: use PropTypes:
function FullName(props: { first: string; last: string }) {
  return <span>{props.first} {props.last}</span>
}
FullName.propTypes = {
  first: Object, // you can use PropTypes, or this
  last: Object   // trick to define untyped props.
};
register(FullName, 'full-name');
```

## Related

- [preactjs/preact-custom-element](https://github.com/preactjs/preact-custom-element)
