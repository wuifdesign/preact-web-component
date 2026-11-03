# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-11-03

A rework of the library. See the [README](README.md) for the full API.

### Added

- `register()` returns the element class, typed with a property for each observed attribute. Exported types:
  `WebComponentConstructor`, `WebComponentElement`, `RegisterOptions`, `AttributeName`, `PropType` and `PropTypes`.
- Attribute types: pass an object such as `{ count: Number, open: Boolean }` instead of a list of names to convert
  attribute values. A missing `Boolean` attribute is `false`. The types are checked against the component's props.
- camelCase prop names are observed in their kebab-case form, so the `first-name` attribute becomes the `firstName` prop.
- Properties are reflected to attributes. Properties set before the element was upgraded are picked up.
- Light DOM children are moved into slots and kept in sync when children are added later. Named slots are passed to
  the component as props.
- A `Slot` component that passes the Preact context on to the elements assigned to it, including through shadow roots.
- Shadow root options: `shadow` accepts an object for `attachShadow()`, for example `{ mode: 'closed' }` or
  `{ delegatesFocus: true }`. Closed shadow roots are reachable through the `_shadowRoot` prop.
- `adoptedStyleSheets` option for styles shared by all instances.
- Form-associated elements get `_formDisabled` and dispatch `formreset` and `formstaterestore` events.
- Server rendering: `register()` does nothing when `customElements` is not available. Declarative shadow roots and
  light DOM server output can be hydrated with the `hydrate` attribute.
- Registering the same tag name again returns the existing class instead of throwing, for hot module replacement.
- Support for Preact 11.

### Changed

- **Breaking:** props are only passed in camelCase. The kebab-case attribute name is no longer passed as well.
- **Breaking:** the `mode` option was replaced by `shadow: { mode }`.
- `require()` loads a CommonJS build (`dist/index.cjs`) instead of the UMD build, which stays available for `unpkg` and
  `jsdelivr`.
- `WebComponentProps` documents `_rootElement`, `_internals`, `_shadowRoot` and `_formDisabled`.

### Removed

- **Breaking:** customized built-in elements, with the `extends` and `ExtendsComponent` options.
- **Breaking:** observing the keys of `propTypes`. Use `observedAttributes` or pass the names to `register()`.
- **Breaking:** inferring the tag name from `displayName` or the component name. Pass a tag name or set a static
  `tagName`.

## [0.0.2] - 2025-06-23

### Fixed

- `_rootElement` is optional in `WebComponentProps`, so components can be rendered without it.

## [0.0.1] - 2025-06-18

### Added

- `register()` to define a custom element from a Preact component, with observed attributes passed as props.
- Shadow DOM, form-associated elements, customized built-in elements and hydration.
- Preact context passed to nested custom elements.
- `WebComponentProps` type with `_rootElement` and `_internals`.

[Unreleased]: https://github.com/wuifdesign/preact-web-component/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/wuifdesign/preact-web-component/compare/v0.0.2...v0.1.0
[0.0.2]: https://github.com/wuifdesign/preact-web-component/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/wuifdesign/preact-web-component/releases/tag/v0.0.1
