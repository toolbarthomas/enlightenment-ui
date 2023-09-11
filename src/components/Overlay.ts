import {
  createRef,
  customElement,
  Enlightenment,
  html,
  property,
  ref
} from '@toolbarthomas/enlightenment'

import styles from './Overlay.scss'

@customElement('ui-overlay')
class EnlightenmentOverlay extends Enlightenment {
  static styles = [styles]

  @property({
    attribute: 'aria-owns',
    reflect: true,
    type: String
  })
  ariaOwns?: string

  firstUpdated() {
    console.log('First updated', this.ariaOwns)
  }

  render() {
    const classes = ['overlay']

    return html`
      <div ref="${ref(this.context)}" class="overlay">
        <div class="overlay__wrapper">
          <slot></slot>
        </div>
      </div>
    `
  }
}
