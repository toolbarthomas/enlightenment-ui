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
  previousWidth?: number

  pushContext = createRef()

  @property({
    converter: Enlightenment.isBoolean,
    type: Boolean
  })
  autohide?: boolean

  connectedCallback() {
    super.connectedCallback()

    this.assignGlobalEvent('scroll', this.handleScroll, { context: window })
    this.assignGlobalEvent('resize', this.handleResize, { context: window })
  }

  public disconnectedCallback(): void {
    this.omitGlobalEvent('scroll', this.handleScroll)
    this.omitGlobalEvent('resize', this.handleResize)

    super.disconnectedCallback()
  }

  protected handleUpdate(name?: string | undefined): void {
    super.handleUpdate(name)

    this.handleResizeCallback(true)
  }

  handleResize(event?: UIEvent) {
    this.throttle(this.handleResizeCallback, 200)
  }

  handleResizeCallback(force?: boolean) {
    const push = this.useRef(this.pushContext)
    const toolbar = this.useRef(this.context) as HTMLElement

    if (!push || !toolbar) {
      return
    }

    const width = window.innerWidth

    if (!force && width === this.previousWidth) {
      return
    }

    push.style.height = `${toolbar.scrollHeight}px`
    toolbar.style.minHeight = `${toolbar.scrollHeight}px`

    this.previousWidth = width
  }

  handleScroll(event: Event) {
    if (!this.autohide) {
      return
    }

    this.throttle(this.handleScrollCallback)
  }

  handleScrollCallback() {
    const { scrollY, innerHeight } = this.root

    if (scrollY >= innerHeight) {
      this.ariaHidden = 'true'
    } else {
      this.ariaHidden = 'false'
    }

    if (this.previousScrollY && this.previousScrollY > scrollY) {
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
      <div class="toolbar__push" ref="${ref(this.pushContext)}"></div>
    `
  }
}
