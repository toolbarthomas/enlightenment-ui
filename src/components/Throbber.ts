import {
  createRef,
  customElement,
  Enlightenment,
  html,
  nothing,
  property,
  ref
} from '@toolbarthomas/enlightenment'

import styles from './Throbber.scss'

@customElement('ui-throbber')
class EnlightenmentThrobber extends Enlightenment {
  static styles = [styles]

  @property({ converter: Enlightenment.isBoolean, type: Boolean })
  hidden?: boolean = false

  updated() {
    super.updated()

    if (this.hidden !== this.getAttribute('aria-hidden')) {
      this.setAttribute('aria-hidden', String(this.hidden))
    }
  }

  render() {
    return html`<span class="throbber"></div>`
  }
}
