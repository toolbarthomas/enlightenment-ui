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
class EnlightenmentDrawer extends Enlightenment {
  static styles = [styles]

  ready?: boolean = false

  @property({
    attribute: 'active',
    converter: Enlightenment.isBoolean,
    type: Boolean
  })
  active: string | null

  @property({
    converter: Enlightenment.isBoolean,
    type: Boolean
  })
  floating?: boolean

  @property({
    converter: Enlightenment.isBoolean,
    type: Boolean
  })
  strict?: boolean

  @property({
    converter: Enlightenment.convertToSelectors,
    type: Array
  })
  toggles?: HTMLElement[]

  @property({
    type: String
  })
  label?: boolean

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

    if (
      this.offsetElement.getAttribute('aria-hidden') === 'false' ||
      !this.offsetElement.hasAttribute('aria-hidden')
    ) {
      context.style.paddingTop = `${this.offsetElement.offsetHeight}px`
    } else {
      context.style.paddingTop = 0
    }
  }

  private _renderLabel() {
    if (!this.label) {
      return
    }

    return html`
      <header class="drawer__panel-header">
        <span class="drawer__label">${this.label}</span>
      </header>
    `
  }

  updated() {
    super.updated()

    this._defineOffset()

    // Will mark the defined Drawer as active and ensure the currentElement
    // property is updated.
    if (this.active) {
      this.commit('currentElement', this.active)
    }

    const state = this.useState()

    this.throttle(() => {
      if (state && state.currentElements.filter((c) => c instanceof EnlightenmentDrawer).length) {
        document.body.classList.add('body--drawer-is-active')
      } else {
        document.body.classList.remove('body--drawer-is-active')
      }
    })
  }

  connectedCallback() {
    super.connectedCallback()

    this.assignGlobalEvent('resize', this.handleResize, window)
    this.assignGlobalEvent('scroll', this.handleScroll, window)
  }

  disconnectedCallback() {
    super.disconnectedCallback()

    this.clearGlobalEvent('resize', [this, window])
  }

  handleResize() {
    this.throttle(() => this._defineOffset())
  }

  handleScroll() {
    this.handleResize()
  }

  protected handleGlobalClick(event: MouseEvent) {
    super.handleGlobalClick(event)

    const state = this.useState()

    if (!this.strict && !this.isComponentContext(event.target)) {
      this.hide()
    }

    if (
      this.toggles &&
      (this.toggles.includes(event.target) ||
        this.toggles.filter((e) => e.contains(event.target)).length)
    ) {
      if (this.active) {
        this.hide()
      } else {
        this.show()
      }
    }
  }

  protected handleGlobalKeydown(event: KeyboardEvent) {
    super.handleGlobalKeydown(event)

    const { keyCode } = event

    if (!this.strict && Enlightenment.keyCodes.exit.includes(keyCode)) {
      this.hide()
    }
  }

  hide() {
    this.commit('active', false)
    this.releaseFocusTrap()
  }

  show() {
    this.commit('active', true)

    if (this.strict) {
      this.lockFocusTrap()
    }
  }

  render() {
    const classes = ['drawer']

    if (this.position) {
      classes.push(`drawer--align-from-${this.position}`)
    }

    if (this.active) {
      classes.push('drawer--is-active')
    }

    if (this.floating) {
      classes.push('drawer--is-floating')
    }

    if (this.strict) {
      classes.push('drawer--is-strict')
    }

    return html`
      <div ref="${ref(this.context)}" class="${classes.join(' ')}">
        <div class="drawer__panel">
          ${this._renderLabel()}
          <div class="drawer__body">
            <slot></slot>
          </div>
        </div>
      </div>
      <span class="drawer-backdrop"></span>
    `
  }
}
