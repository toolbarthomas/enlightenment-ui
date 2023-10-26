import {
  createRef,
  customElement,
  Enlightenment,
  html,
  nothing,
  property,
  ref
} from '@toolbarthomas/enlightenment'

import styles from './Textfield.scss'

@customElement('ui-textfield')
class EnlightenmentTextfield extends Enlightenment {
  static styles = [styles]

  static a11y = {
    clear: 'Clear',
    copy: 'Copy',
    search: 'Search'
  }

  @property({
    converter: (value: string) => value.split(',').map((v) => v.toLowerCase()),
    type: Array
  })
  actions = []

  @property({ type: String })
  id? = Enlightenment.useElementID()

  @property({ type: String })
  label?: string

  @property({
    type: String,
    converter: (value: string) => Enlightenment.filterProperty(value, ['text', 'password'])
  })
  type = 'text'

  @property({ type: String })
  placeholder?: string

  value?: string

  handleChange(event: Event) {
    if (!event || !event.target) {
      return
    }

    this.throttle(this.updateValue)
  }

  handleClear(event: Event) {
    if (event && event.preventDefault) {
      event.preventDefault()
    }

    const context = this.useContext() as HTMLInputElement

    if (!context || !context.value || !context.value.length) {
      return
    }

    context.value = ''
  }

  handleCopy(event: Event) {
    if (event && event.preventDefault) {
      event.preventDefault()
    }

    if (this.type === 'password') {
      return
    }

    const context = this.useContext() as HTMLInputElement

    if (!context || !context.value || !context.value.length) {
      return
    }

    context.select()
    context.setSelectionRange(0, context.value.length)

    navigator.clipboard.writeText(context.value)

    context.setSelectionRange(context.value.length, context.value.length)
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

    this.hook('change', { context: this.useContext() })
  }

  handleSearch() {
    const form = this.findParentElement('form')

    if (!form) {
      this.log('Unable to search from undefined form', 'warning')

      return
    }

    this.hook('submit', { context: form })

    console.log('Should submit', form)
  }

  render() {
    const classes = ['textfield']

    if (this.value) {
      classes.push('textfield--has-value')
    }

    return html`<div class="${classes.join(' ')}">
      <div class="textfield__label-wrapper">${this.renderLabel()}</div>
      <div class="textfield__input-wrapper">
        <input
          ?disabled=${this.disabled}
          ?value=${this.value}
          @change=${this.handleChange}
          @keydown=${this.handleKeydown}
          class="textfield__input"
          id=${this.id}
          name=${this.name}
          placeholder=${this.placeholder}
          ref="{${ref(this.context)}}"
          type="${this.type}"
        />
        <span class="textfield__focus-indicator"></span>
        ${this.renderActions()}
      </div>
    </div>`
  }

  renderActions() {
    const { actions } = this.slots

    return html`<div class="textfield__actions">
      ${this.renderCopy()} ${this.renderClear()} ${this.renderSearch()}
      <slot name="actions"></slot>
    </div>`
  }

  renderClear() {
    if (!this.actions.includes('clear')) {
      return nothing
    }

    return html`<button class="textfield__action textfield__clear" @click=${this.handleClear}>
      <span class="textfield__action-label">${EnlightenmentTextfield.a11y.clear}</span>
    </button>`
  }

  renderCopy() {
    if (!this.actions.includes('copy')) {
      return nothing
    }

    return html`<button class="textfield__action textfield__copy" @click=${this.handleCopy}>
      <span class="textfield__action-label">${EnlightenmentTextfield.a11y.copy}</span>
    </button>`
  }

  renderSearch() {
    if (!this.actions.includes('search')) {
      return nothing
    }
    console.log('Render search')

    return html`<button
      class="textfield__action textfield__search"
      type="submit"
      @click=${this.handleSearch}
    >
      <span class="textfield__action-label">${EnlightenmentTextfield.a11y.search}</span>
    </button>`
  }

  renderLabel() {
    const slot = this.useSlot()

    return this.label
      ? html`<label class="textfield__label" for="${this.id}">${this.label}</label>`
      : html`<slot></slot>`
  }

  updateValue() {
    const context = this.useContext() as HTMLInputElement

    if (context && context.value !== this.value) {
      this.commit('value', context.value)
    } else if (!context.value) {
      this.commit('value', '')
    }

    this.hook('change')
  }
}