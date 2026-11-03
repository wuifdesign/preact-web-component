export const toKebabCase = (str: string) => {
  return str.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)
}
