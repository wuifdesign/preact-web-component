# preact-web-component

[![npm](https://img.shields.io/npm/v/preact-web-component)](https://www.npmjs.com/package/preact-web-component)
[![CI](https://github.com/wuifdesign/preact-web-component/actions/workflows/ci.yml/badge.svg)](https://github.com/wuifdesign/preact-web-component/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/preact-web-component)](./LICENSE)

Turn Preact components into custom elements (Web Components) that work in any page or framework.

The package builds on [preactjs/preact-custom-element](https://github.com/preactjs/preact-custom-element) and adds
TypeScript types that check attribute names against your component's props.

- Attributes and properties are passed to the component as props, with optional type conversion
- Light DOM or shadow DOM, with shared `adoptedStyleSheets`
- Slots and named slots, in both modes
- Preact context flows through nested elements
- Form-associated elements via `ElementInternals`
- Server rendering and hydration, including declarative shadow roots
- Works with Preact 10 and 11

## Contents

- [Installation](#installation)
- [Quick start](#quick-start)
- [`register()`](#register)
- [Attributes and props](#attributes-and-props)
- [Children and slots](#children-and-slots)
- [Shadow DOM](#shadow-dom)
- [Accessing the element](#accessing-the-element)
- [Form-associated elements](#form-associated-elements)
- [Server rendering and hydration](#server-rendering-and-hydration)
- [TypeScript](#typescript)
- [Using it without a bundler](#using-it-without-a-bundler)

## Installation

```sh
npm install preact-web-component preact
```

## Quick start

```tsx
import type { FunctionComponent } from 'preact';
import { register } from 'preact-web-component';

const Greeting: FunctionComponent<{ name?: string }> = ({ name = 'World' }) => <p>Hello, {name}!</p>;

register(Greeting, 'x-greeting', ['name']);
```

```html
<x-greeting name="Billy Jo"></x-greeting>
```

Renders:

```html
<x-greeting name="Billy Jo"><p>Hello, Billy Jo!</p></x-greeting>
```

Changing the attribute (`element.setAttribute('name', 'Sam')`) or the property (`element.name = 'Sam'`) re-renders
the component.

## `register()`

```ts
register(Component, tagName?, propNames?, options?)
```

| Argument    | Description                                                                                                                                                                                    |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Component` | The Preact component.                                                                                                                                                                          |
| `tagName`   | The element name. It must contain a hyphen ([spec](https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name)). Falls back to a static `tagName` on the component. |
| `propNames` | The attributes to observe, as a list of names or an [object of types](#attribute-types). Falls back to a static `observedAttributes` on the component.                                         |
| `options`   | See below.                                                                                                                                                                                     |

| Option               | Description                                                                                                                      |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `shadow`             | `true`, or options for `attachShadow()` such as `{ mode: 'closed' }`. Renders into a shadow root. The mode defaults to `'open'`. |
| `adoptedStyleSheets` | `CSSStyleSheet`s for the shadow root, shared by all instances.                                                                   |
| `formAssociated`     | Makes the element [form-associated](#form-associated-elements).                                                                  |

`register()` returns the element class, so you can subclass it or create elements with `new`. On the server it returns
`undefined`. If the tag name is already registered, for example during hot module replacement, `register()` returns the
existing class and the new component is only used after a page reload.

## Attributes and props

### Observed attributes

Custom elements only get notified about attributes they list up front, so pass the names you want to keep in sync.
Attributes that aren't observed still reach the component, but only once, when the element connects.

Instead of passing the tag name and attributes to `register()`, a class component can declare them as static
properties:

```tsx
import { Component } from 'preact';
import { register } from 'preact-web-component';

class Greeting extends Component<{ name?: string }> {
  static tagName = 'x-greeting';
  static observedAttributes = ['name'];

  render({ name = 'World' }) {
    return <p>Hello, {name}!</p>;
  }
}

register(Greeting);
```

A tag name is required, either as an argument or as the static property. Without either list, no attributes are
observed.

### Attribute types

Attribute values are always strings. Pass an object instead of a list to convert them:

```tsx
register(Counter, 'x-counter', {
  count: Number,
  disabled: Boolean,
  tags: (value) => value.split(','),
});
```

```html
<x-counter count="5" disabled tags="a,b"></x-counter>
```

The component gets `{ count: 5, disabled: true, tags: ['a', 'b'] }`.

- `Boolean` is `true` while the attribute is present and `false` otherwise.
- Any other type is called with the attribute value. A removed attribute becomes `undefined`.
- Values set through properties are passed on as they are, without conversion.

### camelCase and kebab-case

HTML lowercases attribute names, so camelCase names are observed in kebab-case. `['firstName']` observes the
`first-name` attribute, and the component gets it as the `firstName` prop. Passing `'first-name'` does the same. The
element also gets a `firstName` property. Unobserved attributes are passed in camelCase too.

```html
<x-user first-name="Billy"></x-user>
```

### Properties

Every observed attribute gets a matching property on the element. Setting a property passes its value to the component
as is, which is how objects and functions get in, for example from a Preact parent:

```tsx
// register(User, 'x-user', ['user'])
<x-user user={{ firstName: 'Billy', lastName: 'Jo' }} />
```

Strings and numbers are reflected to the attribute, `true` sets an empty attribute, and `false`, `null` and objects
remove it.

A few names are handled differently:

- Names that already exist on `HTMLElement`, such as `style`, `title` or `hidden`, keep their native property. The
  attribute is still observed, so the prop stays in sync.
- `context`, `key` and `ref` work as attribute names.
- `children` is always the slotted content, so an attribute named `children` is ignored.

## Children and slots

The element's children are passed as `props.children`. Children with a `slot` attribute become props named after the
slot, in camelCase:

```tsx
import type { ComponentChildren, FunctionComponent } from 'preact';
import { register } from 'preact-web-component';

const Card: FunctionComponent<{ cardTitle?: ComponentChildren }> = ({ cardTitle, children }) => (
  <article>
    <h2>{cardTitle}</h2>
    {children}
  </article>
);

register(Card, 'x-card');
```

```html
<x-card>
  <span slot="card-title">Hello</span>
  <p>Some content</p>
</x-card>
```

Without a shadow root, the children are moved into the slots that the component renders. Children added or removed
later, for example by a framework that renders into the element, are moved as well. With a shadow root, the browser
assigns them natively.

A named slot takes precedence over an attribute with the same name. `slot="children"` doesn't replace
`props.children`.

Moving the element in the DOM remounts the component and resets its state. This also applies to
[`moveBefore()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/moveBefore).

## Shadow DOM

Set `shadow` to render into a shadow root. An object is passed to `attachShadow()`, with `mode: 'open'` unless it sets
a mode. Styles in `adoptedStyleSheets` are shared by all instances, so you don't need a `<style>` element in each one.

```tsx
import { register } from 'preact-web-component';

const styles = new CSSStyleSheet();
styles.replaceSync(':host { display: block; }');

register(Dialog, 'x-dialog', [], {
  shadow: { delegatesFocus: true },
  adoptedStyleSheets: [styles],
});
```

The component gets the shadow root as the `_shadowRoot` prop, which also works in `closed` mode.

### Context in a shadow root

Elements in the light DOM get the Preact context of the component they are slotted into. A plain `<slot>` element in
a shadow root can't pass the context on, so use the exported `Slot` component. `props.children` and named slot props
are already `Slot` elements.

```tsx
import { createContext } from 'preact';
import { register, Slot } from 'preact-web-component';

const Theme = createContext('light');

const ThemeProvider = () => (
  <Theme.Provider value="dark">
    <Slot />
  </Theme.Provider>
);

register(ThemeProvider, 'x-theme-provider', [], { shadow: true });
```

## Accessing the element

The component gets the element as the `_rootElement` prop. Use `WebComponentProps` to type it, along with the other
props the package passes in.

To give the element methods, assign them to `_rootElement`:

```tsx
import type { FunctionComponent } from 'preact';
import { useLayoutEffect, useState } from 'preact/hooks';
import { register, type WebComponentProps } from 'preact-web-component';

const Dialog: FunctionComponent<WebComponentProps> = ({ _rootElement, children }) => {
  const [open, setOpen] = useState(false);

  useLayoutEffect(() => {
    Object.assign(_rootElement!, {
      open: () => setOpen(true),
      close: () => setOpen(false),
    });
  }, []);

  return <dialog open={open}>{children}</dialog>;
};

register(Dialog, 'x-dialog');
```

```js
document.querySelector('x-dialog').open();
```

## Form-associated elements

With `formAssociated: true`, the element behaves like a native form control. Its value is submitted with the form,
and it can be validated and labelled like an `<input>`.

The component gets the result of
[`attachInternals()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/attachInternals) as the
`_internals` prop. Use it to set the value (`setFormValue()`), report validity (`setValidity()`), or read `form` and
`labels`. The element itself doesn't get properties like `form` or `validity`.

The browser's form callbacks are passed on to the component:

| Callback                   | Passed on as                                                                                   |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| `formDisabledCallback`     | The `_formDisabled` prop. `true` while the element or a surrounding `<fieldset>` is disabled.  |
| `formResetCallback`        | A `formreset` event on the element when its form is reset.                                     |
| `formStateRestoreCallback` | A `formstaterestore` event with `detail` `{ state, mode }`, for example after navigating back. |

```tsx
import type { FunctionComponent } from 'preact';
import { useLayoutEffect, useState } from 'preact/hooks';
import { register, type WebComponentProps } from 'preact-web-component';

const Rating: FunctionComponent<WebComponentProps> = ({ _internals, _rootElement, _formDisabled }) => {
  const [value, setValue] = useState(0);

  useLayoutEffect(() => {
    _internals!.setFormValue(String(value));
  }, [value]);

  useLayoutEffect(() => {
    const reset = () => setValue(0);
    _rootElement!.addEventListener('formreset', reset);
    return () => _rootElement!.removeEventListener('formreset', reset);
  }, []);

  return (
    <button type="button" disabled={_formDisabled} onClick={() => setValue(value + 1)}>
      {value} ★
    </button>
  );
};

register(Rating, 'x-rating', [], { formAssociated: true });
```

```html
<form>
  <x-rating name="rating"></x-rating>
  <button>Submit</button>
</form>
```

## Server rendering and hydration

`register()` does nothing where `customElements` doesn't exist, so the same module can be imported on the server.

Add the `hydrate` attribute to make the element hydrate the existing markup instead of rendering it again:

- Without a shadow root, the server output has to keep the children inside `<slot>` elements. They are taken from
  there.
- With a shadow root, a
  [declarative shadow root](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/template#shadowrootmode)
  is reused and the children stay in the light DOM.

```html
<x-greeting hydrate name="Billy Jo">
  <template shadowrootmode="open"><p>Hello, Billy Jo!</p></template>
</x-greeting>
```

## TypeScript

`register()` checks the names in `propNames` against the component's props, in camelCase or kebab-case:

```tsx
const Greeting: FunctionComponent<{ firstName?: string }> = ({ firstName }) => <p>Hello, {firstName}!</p>;

register(Greeting, 'x-greeting', ['firstName']); // ok
register(Greeting, 'x-greeting', ['first-name']); // ok
register(Greeting, 'x-greeting', ['lastName']); // type error
```

Attribute types have to return the type of their prop:

```tsx
const Counter: FunctionComponent<{ count?: number }> = ({ count = 0 }) => <p>{count}</p>;

register(Counter, 'x-counter', { count: Number }); // ok
register(Counter, 'x-counter', { count: String }); // type error, a string isn't a number
```

The returned class has a typed property for each observed attribute. `register()` only returns `undefined` on the
server, so in browser code you can assert the class with `!`:

```tsx
const CounterElement = register(Counter, 'x-counter', { count: Number })!;

const counter = new CounterElement();
counter.count = 5; // number | undefined
```

To type `document.querySelector()` and `document.createElement()`, add the element to `HTMLElementTagNameMap`:

```ts
declare global {
  interface HTMLElementTagNameMap {
    'x-counter': InstanceType<typeof CounterElement>;
  }
}
```

The package also exports these types for writing wrappers:

| Type                            | Description                                                                                          |
| ------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `WebComponentProps`             | The props passed in by the element: `_rootElement`, `_internals`, `_shadowRoot` and `_formDisabled`. |
| `WebComponentElement<P, N>`     | An element with a property for each attribute name `N` of the props `P`.                             |
| `WebComponentConstructor<P, N>` | The class returned by `register()`.                                                                  |
| `AttributeName<P>`              | A prop name of `P` in camelCase or kebab-case.                                                       |
| `PropType<T>`                   | An attribute converter that returns a `T`, such as `Number` or `(value) => value.split(',')`.        |
| `PropTypes<P, N>`               | An object of attribute converters, as passed to `register()`.                                        |
| `RegisterOptions`               | The `options` argument of `register()`.                                                              |

## Using it without a bundler

Preact 11 is only published as ES modules, so load both packages with an import map:

```html
<script type="importmap">
  {
    "imports": {
      "preact": "https://cdn.jsdelivr.net/npm/preact@11/dist/preact.mjs",
      "preact/hooks": "https://cdn.jsdelivr.net/npm/preact@11/hooks/dist/hooks.mjs",
      "preact-web-component": "https://cdn.jsdelivr.net/npm/preact-web-component/dist/index.js"
    }
  }
</script>
<script type="module">
  import { h } from 'preact';
  import { register } from 'preact-web-component';

  register(({ name = 'World' }) => h('p', null, `Hello, ${name}!`), 'x-greeting', ['name']);
</script>
```

The UMD build expects a global `preact`, which only Preact 10 provides:

```html
<script src="https://cdn.jsdelivr.net/npm/preact@10/dist/preact.min.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/preact-web-component/dist/index.umd.js"></script>
<script>
  const { h } = preact;

  PreactWebComponent.register(({ name = 'World' }) => h('p', null, `Hello, ${name}!`), 'x-greeting', ['name']);
</script>
```

## Related

- [preactjs/preact-custom-element](https://github.com/preactjs/preact-custom-element)

## License

[MIT](./LICENSE)
