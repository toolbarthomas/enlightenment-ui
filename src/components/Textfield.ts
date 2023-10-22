import {
  createRef,
  customElement,
  Enlightenment,
  html,
  nothing,
  property,
  ref
} from '@toolbarthomas/enlightenment'

import styles from './Toggler.scss'

@customElement('ui-textfield')
class EnlightenmentToggler extends Enlightenment {
  static styles = [styles]

  handleChange(event: Event) {
    if (!event || !event.target) {
      return
    }

    console.log('Change')

    this.hook('change')
  }

  handleKeydown(event: KeyboardEvent) {
    const { keyCode } = event

    if (Enlightenment.keyCodes.meta.includes(keyCode)) {
      return
    }

    if (Enlightenment.keyCodes.exit.includes(keyCode)) {
      event.target && event.target.blur()

      return
    }

    // this.hook('change', { context: this.useContext() })
  }

  render() {
    const classes = ['textfield']

    return html`<div class="${classes.join(' ')}">
      <input
        ?disabled=${this.disabled}
        ?name=${this.name}
        ?value=${this.value}
        @change=${this.handleChange}
        @keydown=${this.handleKeydown}
        class="textfield__input"
        ref="{${ref(this.context)}}"
        type="text"
      />
    </div>`
  }
}
