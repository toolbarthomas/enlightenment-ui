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

  previousScrollY?: number

  connectedCallback() {
    super.connectedCallback()

    this.assignGlobalEvent('scroll', this.handleScroll, window)
  }

  handleScroll(event: Event) {
    const { scrollY, innerHeight } = this.root

    if (scrollY >= innerHeight) {
      this.ariaHidden = 'true'
    } else {
      this.ariaHidden = 'false'
    }

    if (this.previousScrollY > scrollY) {
      this.ariaHidden = 'false'
    }

    this.previousScrollY = scrollY
  }

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
