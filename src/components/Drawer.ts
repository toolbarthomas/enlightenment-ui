import {
  createRef,
  customElement,
  Enlightenment,
  html,
  property,
  ref
} from '@toolbarthomas/enlightenment'

import styles from './Drawer.scss'

@customElement('ui-drawer')
class Enlightenmentdrawer extends Enlightenment {
  static styles = [styles]

  @property({
    converter: Enlightenment.isBoolean,
    type: Boolean
  })
  visible?: boolean

  @property({
    attribute: 'aria-hidden',
    reflect: true,
    type: String
  })
  ariaHidden: string | null

  @property({
    attribute: 'offset-element',
    converter: (value: any) => document.getElementById(value) || document.querySelector(value),
    type: HTMLElement
  })
  offsetElement?: HTMLElement

  @property({
    reflect: true,
    type: String
  })
  position = 'left'

  private _defineOffset() {
    if (!this.offsetElement) {
      return
    }

    const context = this.useContext()

    if (!context) {
      return
    }

    context.style.paddingTop = `${this.offsetElement.offsetHeight}px`
  }

  updated() {
    super.updated()

    this._defineOffset()
  }

  connectedCallback() {
    super.connectedCallback()

    this.assignGlobalEvent('resize', this.handleResize, window)

    this.throttle(() => {
      if (this.visible) {
        this.show()
      }
    })
  }

  disconnectedCallback() {
    super.disconnectedCallback()

    this.clearGlobalEvent('resize', [this, window])
  }

  handleResize() {
    this.throttle(() => this._defineOffset())
  }

  protected handleGlobalClick(event: MouseEvent) {
    super.handleGlobalClick(event)

    const state = this.useState()

    if (!this.isComponentContext(event.target)) {
      this.hide()
    }
  }

  protected handleGlobalKeydown(event: KeyboardEvent) {
    super.handleGlobalKeydown(event)

    const { keyCode } = event

    if (Enlightenment.keyCodes.exit.includes(keyCode)) {
      this.hide()
    }
  }

  hide() {
    this.commit('ariaHidden', () => {
      this.removeAttribute('visible')
      this.visible = false
      this.ariaHidden = 'true'
    })
  }

  show() {
    this.commit('ariaHidden', () => {
      this.visible = undefined
      this.removeAttribute('visible')
      this.ariaHidden = 'false'
    })
  }

  render() {
    const classes = ['drawer']

    if (this.position) {
      classes.push(`drawer--align-from-${this.position}`)
    }

    return html`
      <div ref="${ref(this.context)}" class="${classes.join(' ')}">
        <div class="drawer__wrapper">
          <slot></slot>
        </div>
      </div>
    `
  }
}
