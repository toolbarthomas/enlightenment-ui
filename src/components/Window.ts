import {
  createRef,
  customElement,
  Enlightenment,
  html,
  nothing,
  property,
  ref
} from '@toolbarthomas/enlightenment'

import styles from './Window.scss'

export type WindowZoomOptions = {
  left?: number
  top?: number
  width?: number
  height?: number
}

@customElement('ui-window')
class EnlightenmentWindow extends Enlightenment {
  static styles = [styles]

  static minWidth = 300
  static minHeight = 200

  // Enable the usage of currentElement.
  enableDocumentEvents: boolean = true

  // Actual x position for the context Element.
  currentX?: number

  // Actual y position for the context Element.
  currentY?: number

  theme?: 'round' | 'square' | 'clear' = 'square'

  @property({
    converter: (value) => Enlightenment.filterProperty(value, ['left', 'right']),
    type: String
  })
  controls?: string = 'left'

  @property({ type: String })
  name?: string

  @property({
    reflect: true,
    converter: (value) => Enlightenment.filterProperty(value, ['primary', 'secondary', 'compact']),
    type: String
  })
  type?: string = 'primary'

  @property({ converter: Enlightenment.isInteger, type: Number })
  views: number = 1

  @property({ converter: Enlightenment.isBoolean, type: Boolean })
  static?: boolean = false

  @property({ converter: Enlightenment.isBoolean, type: Boolean })
  monochrome?: boolean = false

  @property({ converter: Enlightenment.isBoolean, type: Boolean })
  zoom?: boolean = false

  @property({ converter: Enlightenment.isBoolean, type: Boolean })
  suspend?: boolean = false

  @property({ converter: Enlightenment.isInteger, type: Number })
  width?: number

  @property({ converter: Enlightenment.isInteger, type: Number })
  height?: number

  @property({ converter: Enlightenment.isInteger, type: Number })
  x?: number

  @property({ converter: Enlightenment.isInteger, type: Number })
  y?: number

  firstUpdated(properties: any) {
    super.firstUpdated(properties)

    const context = this.useContext()
    if (context) {
      context.style.width = `${EnlightenmentWindow.minWidth}px`
      context.style.height = `${EnlightenmentWindow.minHeight}px`
    }
  }

  handleMinimize(event?: Event) {
    if (event && event.preventDefault) {
      event.preventDefault()
    }

    this.commit('isCollapsed', !this.isCollapsed)
  }

  handleExit(event?: Event) {
    if (event && event.preventDefault) {
      event.preventDefault()
    }

    this.remove && this.remove()
  }

  handleSuspend(event?: Event) {
    if (event && event.preventDefault) {
      event.preventDefault()
    }

    this.commit('suspend', true)
  }

  handleZoom(event?: Event) {
    if (event && event.preventDefault) {
      event.preventDefault()
    }

    if (this.static) {
      return
    }

    const context = this.useContext() as HTMLElement

    if (!context) {
      return
    }

    this.commit('isFullscreen', () => {
      this.zoom = !this.isFullscreen

      return this.zoom
    })
  }

  protected handleUpdate(name?: string | undefined): void {
    // console.log('this', this.zoom)
    this.updateAttribute('views', this.views)
    this.updateAttribute('monochrome', this.monochrome)
    this.updateAttributeAlias('suspend', 'aria-hidden')
    this.updateAttributeAlias('isFullscreen', 'zoom', true)

    if (this.suspend) {
      this.handleCurrentElement()
    }

    super.handleUpdate(name)
  }

  renderAside() {
    if (this.type === 'compact') {
      return nothing
    }

    return html`
      <aside class="window__aside">
        ${this.type === 'secondary' ? this.renderControls() : nothing}
        <slot name="aside"><div class="block" /></div></slot>
      </aside>
    `
  }

  renderControls() {
    return html`
      <div class="window__controls">
        <button
          class="window__control window__control--suspend"
          @click=${this.handleSuspend}
        ></button>
        <button
          class="window__control window__control--hide"
          @click=${this.handleMinimize}
        ></button>
        ${!this.static
          ? html`
              <button
                class="window__control window__control--zoom"
                @click=${this.handleZoom}
              ></button>
            `
          : nothing}
      </div>
    `
  }

  renderHeader(excludeControls?: boolean) {
    return html`
      <header class="window__header">
        ${this.renderMeta()} ${!excludeControls ? this.renderControls() : nothing}
      </header>
    `
  }

  renderMain() {
    if (this.suspend) {
      return nothing
    }

    return html`
      ${this.type !== 'secondary' ? this.renderHeader() : nothing}
      <div class="window__body">
        ${this.renderAside()}
        <main class="window__content">
          ${this.type === 'secondary' ? this.renderHeader(true) : nothing} ${this.renderViews()}
        </main>
      </div>
      <footer class="window__footer"><slot name="footer"></slot></footer>
    `
  }

  renderMeta() {
    return html` <span class="window__meta">${this.name}</span> `
  }

  renderResizeHandlers() {
    if (this.static) {
      return nothing
    }

    const handlers = Array.from({ length: 9 }).map((_, index) => {
      if (index === 4) {
        return
      }

      return html`<span class="window__handle" data-pivot="${index + 1}"></span> `
    })

    return html`${handlers}`
  }

  renderResizeIndicator() {
    if (this.static) {
      return nothing
    }

    return html`<div class="window__resize-indicator"></div>`
  }

  renderViews() {
    if (!this.views) {
      return
    }

    const views = Array.from({ length: this.views }).map((_, index) => {
      return html`
        <section class="window__view">
          <slot name="${index ? `view--${index}` : ''}"></slot>
        </section>
      `
    })

    if (!views.length) {
      return nothing
    }

    return html` <div class="window__views">${views}</div> `
  }

  render() {
    const classes = ['window']

    if (this.controls) {
      classes.push(`window--has-controls-${this.controls}`)
    }

    if (this.isFullscreen && !this.static) {
      classes.push(`window--is-zoomed`)
    }

    if (this.static) {
      classes.push(`window--is-static`)
    }

    if (this.type) {
      classes.push(`window--type-is-${this.type}`)
    }

    return html`
      <div ref="${ref(this.context)}" class="${classes.join(' ')}" draggable>
        <div class="window__canvas">${this.renderMain()} ${this.renderResizeHandlers()}</div>
      </div>
      ${this.renderResizeIndicator()}
    `
  }
}
