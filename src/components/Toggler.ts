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

@customElement('ui-toggler')
class EnlightenmentToggler extends Enlightenment {
  static styles = [styles]

  @property({ attribute: 'active', converter: Enlightenment.isBoolean, type: Boolean })
  isActive?: boolean = false

  @property({ attribute: 'rotate', converter: Enlightenment.isBoolean, type: Boolean })
  isRotated?: boolean = false

  protected handleClick(event: Event) {
    this.commit('isActive', !this.isActive)
  }

  render() {
    const classes = []

    if (this.isActive) {
      classes.push('toggler--is-active')
    }

    if (this.isRotated) {
      classes.push('toggler--is-rotated')
    }

    return html`
      <button @click=${this.handleClick} class="toggler ${classes.join(' ')}">
        ${this.renderLabel()} ${this.renderIcon()}
      </button>
    `
  }

  renderLabel() {
    if (!this.label) {
      return nothing
    }

    return html`<span class="toggler__label" aria-focusable="false">${this.label}</span>`
  }

  renderIcon() {
    if (this.svgSpriteSource) {
      return
    }

    return html`
      <span class="toggler__icon-wrapper"
        ><span class="toggler__icon" aria-focusable="true" aria-hidden="true"></span>
      </span>
    `
  }
}
