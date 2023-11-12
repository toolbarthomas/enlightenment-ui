import {
  createRef,
  customElement,
  Enlightenment,
  html,
  nothing,
  property,
  ref
} from '@toolbarthomas/enlightenment'

import styles from './NumberField.scss'

@customElement('ui-numberfield')
class EnlightenmentNumber extends Enlightenment {
  static styles = [styles]

  static ay11 = {
    increment: 'Increment value',
    decrement: 'Decrement value'
  }

  @property({ converter: Enlightenment.isBoolean, type: Boolean })
  disabled?: boolean

  @property({ type: String })
  label?: string

  @property({ type: String })
  value?: string

  @property({ type: String })
  name?: string

  @property({ type: Number })
  size?: number = 4

  @property({ type: Number })
  step: number = 1

  @property({ type: Number })
  max?: number

  @property({ type: Number })
  min?: number = 0

  @property({ type: String })
  id?: string = Enlightenment.useElementID()

  @property({ type: Number })
  timeout?: number = 200

  @property({ type: String })
  placeholder?: string

  timeoutCache?: number

  currentValue?: string

  firstUpdated() {
    super.firstUpdated()

    this.currentValue = this.value
  }

  handleChange(event: Event) {
    if (!event || !event.target) {
      return
    }

    const input = event.target as HTMLInputElement

    this.commit('currentValue', input.value)
  }

  handleKeyUp(event: Event) {
    if (!event || !event.target) {
      return
    }

    const input = event.target as HTMLInputElement

    if (this.currentValue === input.value) {
      return
    }

    this.throttle(this.handleChange, Enlightenment.FPS, { ...event, target: input } as Event)
  }

  handleStep(method: string, event?: Event, ignoreInterval?: boolean) {
    if (this.disabled) {
      return
    }

    if (event && event.preventDefault) {
      const { keyCode } = event as KeyboardEvent

      if (keyCode && !Enlightenment.keyCodes.confirm.includes(keyCode)) {
        return
      }

      event.preventDefault()
    }

    const context = this.useContext() as HTMLInputElement

    if (!context) {
      return
    }

    const v =
      method === 'minus'
        ? parseFloat(context.value || 0) - this.step
        : parseFloat(context.value) + this.step

    clearInterval(this.timeoutCache)

    if (v < this.min || (this.max && v > max)) {
      return
    }

    if (!ignoreInterval) {
      this.timeoutCache = setTimeout(() => this.handleStep(method, event), this.timeout)
    }

    if (method === 'minus') {
      context && context.stepDown()
    } else {
      context && context.stepUp()
    }
  }

  handleStepRelease(event?: Event) {
    this.throttle(this.resetTimeout)
  }

  render() {
    const classes = ['numberfield']

    if (this.disabled) {
      classes.push('numberfield--is-disabled')
    }

    return html`<div class="${classes.join(' ')}">
      <div class="numberfield__input-wrapper" @touchend="${this.handleStepRelease}">
        <input
          ?disabled="${this.disabled}"
          @change="${this.handleChange}"
          @keyup="${this.handleKeyUp}"
          class="numberfield__input"
          id="${this.id}"
          max="${this.max}"
          min="${this.min}"
          name="${this.name}"
          ref="${ref(this.context)}"
          size="${this.size}"
          step="${this.step}"
          style="max-width: ${this.size * 1.125}rem"
          type="number"
          value="${this.value}"
        />
        <slot name="decrement">
          <button
            class="numberfield__decrement"
            type="button"
            @keydown="${(event) => this.handleStep('minus', event)}"
            @keyup="${this.handleStepRelease}"
            @mousedown="${(event) => this.handleStep('minus', event)}"
            @mouseup="${this.handleStepRelease}"
            @touchend="${this.handleStepRelease}"
            @touchstart="${(event) => this.handleStep('minus', event)}"
          >
            <span
              aria-focusable="false"
              aria-hidden="true"
              class="numberfield__decrement-icon"
            ></span>
            <span class="numberfield__decrement-label">${EnlightenmentNumber.ay11.increment}</span>
          </button>
        </slot>
        <slot name="increment">
          <button
            class="numberfield__increment"
            type="button"
            @keydown="${(event) => this.handleStep('plus', event)}"
            @keyup="${this.handleStepRelease}"
            @mousedown="${(event) => this.handleStep('plus', event)}"
            @mouseup="${this.handleStepRelease}"
            @touchend="${this.handleStepRelease}]"
            @touchstart="${(event) => this.handleStep('plus', event)}"
          >
            <span
              aria-focusable="false"
              aria-hidden="true"
              class="numberfield__increment-icon"
            ></span>
            <span class="numberfield__increment-label">${EnlightenmentNumber.ay11.increment}</span>
          </button>
        </slot>
      </div>
    </div>`
  }

  resetTimeout() {
    console.log('reset')

    this.timeoutCache && clearTimeout(this.timeoutCache)
  }
}
