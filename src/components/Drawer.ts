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

  enableDocumentEvents = true

  @property({
    attribute: 'active',
    converter: Enlightenment.isBoolean,
    type: Boolean
  })
  isActive?: string | null

  @property({
    attribute: 'floating',
    converter: Enlightenment.isBoolean,
    type: Boolean
  })
  isFloating?: boolean

  // Prevent the hide command during an exit keycommand or when clicking outside
  // the defined Drawer context.
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
    converter: (value: any) => Enlightenment.convertToSelectors(value)[0],
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

    const context = this.useContext() as HTMLElement

    if (!context) {
      return
    }

    if (
      this.offsetElement.getAttribute('aria-hidden') === 'false' ||
      !this.offsetElement.hasAttribute('aria-hidden')
    ) {
      context.style.paddingTop = `${this.offsetElement.offsetHeight}px`
    } else {
      context.style.paddingTop = '0px'
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

  protected handleGlobalClick(event: MouseEvent) {
    super.handleGlobalClick(event)

    const target = event.target as HTMLElement

    let ignore = false

    if (!this.strict && !this.isComponentContext(target) && !ignore) {
      this.close()
    }

    if (
      !ignore &&
      this.toggles &&
      (this.toggles.includes(target) ||
        this.toggles.filter((e) => target && e.contains(target)).length)
    ) {
      if (this.isActive) {
        this.close()
      } else {
        this.open()
      }
    }
  }

  protected handleGlobalKeydown(event: KeyboardEvent) {
    super.handleGlobalKeydown(event)

    const { keyCode } = event

    if (!this.strict && Enlightenment.keyCodes.exit.includes(keyCode)) {
      this.close()
    }
  }

  protected handleResize() {
    this.throttle(() => this._defineOffset())
  }

  protected handleScroll() {
    this.handleResize()
  }

  protected updated(properties: any) {
    super.updated(properties)

    this._defineOffset()

    // Will mark the defined Drawer as active and ensure the currentElement
    // property is updated.
    if (this.isActive) {
      this.commit('currentElement', this.isActive)
    }

    // Public property that can be used within the process method for other
    // components like the Toggler.
    this.ariaHidden = String(!this.isActive)

    this.throttle(() => {
      if (
        Enlightenment.globals.currentElements.filter((c) => c instanceof EnlightenmentDrawer).length
      ) {
        document.body.classList.add('body--drawer-is-active')
      } else {
        document.body.classList.remove('body--drawer-is-active')
      }
    })
  }

  close() {
    this.commit('isActive', false)
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

  open() {
    this.commit('isActive', true)
  }

  render() {
    const classes = ['drawer']

    if (this.position) {
      classes.push(`drawer--align-from-${this.position}`)
    }

    if (this.isActive) {
      classes.push('drawer--is-active')
    }

    if (this.isFloating) {
      classes.push('drawer--is-floating')
    }

    if (this.strict) {
      classes.push('drawer--is-strict')
    }

    return html`
      <focus-trap ?active=${this.isActive} containers="${this.getAttribute('toggles')}">
        <div ref="${ref(this.context)}" class="${classes.join(' ')}">
          <div class="drawer__panel">
            ${this._renderLabel()}
            <div class="drawer__body">
              <slot></slot>
            </div>
          </div>
        </div>
        <span class="drawer-backdrop"></span>
      </focus-trap>
    `
  }
}
