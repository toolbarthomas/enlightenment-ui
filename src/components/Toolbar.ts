import {
  createRef,
  customElement,
  Enlightenment,
  html,
  property,
  ref
} from '@toolbarthomas/enlightenment'

import styles from './Toolbar.scss'

@customElement('ui-toolbar')
class EnlightenmentToolbar extends Enlightenment {
  static styles = [styles]

  render() {
    const classes = ['toolbar']

    return html`
      <div ref="${ref(this.context)}" class="toolbar">
        <div class="toolbar__wrapper">
          <slot></slot>
        </div>
      </div>
    `
  }
}
