export default {
  name: 'Button Component',
  element: 'ui-button',
  properties: {
    color: ['dawn', 'blue', 'dusk', 'dawn', 'grey', 'red'],
    direction: ['lrt', 'rtl'],
    disabled: Boolean,
    href: String,
    icon: String,
    layout: ['default', 'full-width'],
    onClick: Function,
    shape: ['default', 'pill', 'square'],
    size: ['small', 'medium', 'large'],
    skin: ['default', 'clear', 'shaded', 'faded'],
    type: ['button', 'submit']
  }
}
