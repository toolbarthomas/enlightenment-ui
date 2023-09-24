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

  @property({ attribute: 'icon-style', type: String })
  iconStyle?: string = 'dots'

  protected handleClick(event: Event) {
    this.commit('isActive', !this.isActive)

    console.log('click', event)

    this.processObserved((observed) => {
      if (!observed) {
        return
      }

      if (this.isActive && !observed.isActive) {
        observed.setAttribute('active', '')
      } else if (observed.isActive) {
        observed.setAttribute('active', '')
      }
    })
  }

  protected process(target: HTMLElement) {
    this.throttle(
      this.commit,
      Enlightenment.FPS,
      'isActive',
      target.ariaHidden === 'true' ? false : true
    )
  }

  render() {
    const classes = []

    if (this.isActive) {
      classes.push('toggler--is-active')
    }

    if (this.isRotated) {
      classes.push('toggler--is-rotated')
    }

    if (this.iconStyle) {
      classes.push(`togglers--has-${this.iconStyle}`)
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
