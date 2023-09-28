import {
  createRef,
  customElement,
  Enlightenment,
  html,
  property,
  ref
} from '@toolbarthomas/enlightenment'

import styles from './Form.scss'

@customElement('ui-form')
class EnlightenmenForm extends Enlightenment {
  static styles = [styles]

  static inputElements = ['button', 'input', 'select', 'textarea']

  initialFormData: [HTMLElement, any][] = []

  enableDocumentEvents: boolean = false

  protected assignInputEvents(context: HTMLInputElement) {
    const host = Enlightenment.useHost(context) as HTMLInputElement

    if (context.type === 'submit' || (host && host.getAttribute('type') === 'submit')) {
      console.log('Assign', context)
      this.clearGlobalEvent('click', context)
      this.assignGlobalEvent('click', this.handleSubmit, context)

      return
    }

    if (context.type === 'reset') {
      this.clearGlobalEvent('click', context)
      this.assignGlobalEvent('click', this.handleReset, context)

      return
    }

    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(context.tagName)) {
      this.clearGlobalEvent('change', context)
      this.assignGlobalEvent('change', this.handleChange, context)

      // Trigger an initial Change event to ensure the initial Raw Form data is
      // defined
      this.hook('change', { context })

      if (context.type === 'radio' || context.type === 'checkbox') {
        return
      }

      this.clearGlobalEvent('keydown', context)
      this.assignGlobalEvent('keydown', this.handleKeydown, context)
    }
  }

  protected handleChange(event: InputEvent) {
    this.throttle(this.processChange, Enlightenment.FPS)
  }

  protected handleKeydown(event: KeyboardEvent) {
    const { keyCode } = event

    if (!keyCode) {
      return
    }

    if (keyCode === 13) {
      this.handleSubmit(event)
      return
    }

    if (Enlightenment.keyCodes.meta.includes(keyCode)) {
      return
    }

    const input: any = event.target

    if (input.disabled) {
      return
    }

    this.throttle(() => {
      if (input.previousValue !== input.value) {
        input.previousValue = input.value

        this.throttle(this.handleChange, Enlightenment.FPS, event)
      }
    })
  }

  /**
   * Dispatch the Reset event to the actual form element
   * @param event
   */
  protected handleReset(event: Event) {
    this.hook('reset')
  }

  protected handleSubmit(event: Event) {
    event.preventDefault()

    const input = event.target as HTMLInputElement

    if (input.tagName === 'INPUT' && input.type !== 'submit') {
      if (!input.value) {
        return
      }
    }

    console.log('Submit')
  }

  protected processChange() {
    const slot = this.useSlot()

    slot &&
      Enlightenment.getElementsFromSlot(slot, EnlightenmenForm.inputElements).forEach((element) => {
        if (element.tagName.toLowerCase() === 'button') {
          return
        }

        console.log('After change', element)
      })
  }

  protected handleSlotChange(event: Event): void {
    super.handleSlotChange(event)

    const slot = this.useSlot()

    if (!slot) {
      return
    }

    Enlightenment.getElementsFromSlot(slot, EnlightenmenForm.inputElements).forEach((element) => {
      const input = element as HTMLInputElement

      this.assignInputEvents(input)

      if (!this.initialFormData.filter(([e]) => e === input).length) {
        let initialValue: any

        if (['checkbox', 'radio'].includes(input.type)) {
          initialValue = input.checked
        } else if (!['reset', 'submit', 'button'].includes(input.type)) {
          initialValue = input.value
        }

        if (initialValue !== undefined) {
          this.initialFormData.push([input, initialValue])
        }
      }
    })
  }

  render() {
    const classes = ['form']

    return html` <form ref=${ref(this.context)} @submit=${this.handleSubmit}><slot></slot></form> `
  }
}
