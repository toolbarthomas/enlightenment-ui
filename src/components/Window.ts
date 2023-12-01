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

  // Enable the usage of currentElement.
  enableDocumentEvents: boolean = true

  currentPivot: number = 0

  // Actual x position for the context Element.
  currentX?: number

  // Actual y position for the context Element.
  currentY?: number

  currentWidth?: number

  currentHeight?: number

  // Will be TRUE when the drag action is currently used.
  dragActive?: boolean

  // Defined Animation request that should render the current context position.
  dragRequest?: number

  dragX: number = 0
  dragY: number = 0

  // Keep track of the last edge that was interacted with.
  edgeX?: string
  edgeY?: string

  previousEdge?: string

  // Previous width value of the defined context Element.
  previousWidth?: number

  // Previous height value of the defined context Element.
  previousHeight?: number

  // Previous left position of the defined context Element.
  previousX?: number

  // Previous top position of the defined context Element.
  previousY?: number

  previousPointerX?: number

  previousPointerY?: number

  // Current defined X position of the used Pointer.
  pointerX?: number

  // Current defined Y position of the used Pointer.
  pointerY?: number

  // Delays the actual drag action.
  treshhold: number = 0

  @property({
    converter: (value) => Enlightenment.filterProperty(value, ['left', 'right']),
    type: String
  })
  controls?: string = 'left'

  @property({ type: String })
  title?: string

  @property({
    reflect: true,
    converter: (value) => Enlightenment.filterProperty(value, ['primary', 'secondary']),
    type: String
  })
  type?: string = 'primary'

  @property({ converter: Enlightenment.isInteger, type: Number })
  views: number = 1

  @property({ converter: Enlightenment.isInteger, type: Number })
  edgeTop: number = 0

  @property({ converter: Enlightenment.isInteger, type: Number })
  edgeRight: number = 0

  @property({ converter: Enlightenment.isInteger, type: Number })
  edgeBottom: number = 0

  @property({ converter: Enlightenment.isInteger, type: Number })
  edgeLeft: number = 0

  @property({ converter: Enlightenment.isBoolean, type: Boolean })
  zoom?: boolean = false

  @property({ type: String })
  width?: '200px'

  @property({ type: String })
  height?: string

  public connectedCallback(): void {
    super.connectedCallback()

    this.assignGlobalEvent('resize', this.handleResize, { context: window })
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback()

    this.omitGlobalEvent('resize', this.handleResize)
  }

  handleDragEnd(event?: MouseEvent | TouchEvent) {
    this.dragRequest && cancelAnimationFrame(this.dragRequest)

    if (this.dragActive) {
      const context = this.useContext() as HTMLElement

      if (this.zoom) {
        // this.commit('zoomed', false)
        if (!this.currentPivot || this.currentPivot === 5) {
          this.handleZoom()
          return this.handleDragEnd()
        }
      }

      if (context) {
        this.dragRequest && cancelAnimationFrame(this.dragRequest)

        const [x, y] = Enlightenment.parseMatrix(context.style.transform)

        context.style.transform = ''
        context.style.left = `${Math.round(this.currentX + x)}px`
        context.style.top = `${Math.round(this.currentY + y)}px`

        this.currentY += y
        this.currentX += x

        // if (this.edgeX) {
        //   this.handleZoom(event, { top: 0, left: 0, width: 50 })
        // }

        let top = 0
        let left = 0
        let width = window.innerWidth
        let height = window.innerHeight

        const [edgeTop, edgeRight, edgeBottom, edgeLeft] = this.useEdge()

        if (this.edgeX === 'right' || this.currentX >= edgeRight) {
          left = window.innerWidth / 2
          width = window.innerWidth / 2 - this.edgeRight
        } else if (this.edgeX === 'left' || this.currentX + context.offsetWidth < edgeLeft) {
          if (this.edgeLeft) {
            left = this.edgeLeft
          }

          width = window.innerWidth / 2 - this.edgeLeft
        }

        if (this.edgeY === 'top' || this.currentY + context.offsetHeight < edgeTop) {
          height = window.innerHeight / 2 - this.edgeTop

          if (this.edgeTop) {
            top = this.edgeTop
          }

          // if (edgeTop) {
          //   height = window.innerHeight / 2 - 0
          // }
          console.log('REST TOP')
        } else if (this.edgeY === 'bottom' || this.currentY > edgeBottom) {
          top = window.innerHeight / 2
          height = window.innerHeight / 2 - this.edgeBottom

          console.log('REST BOTTOM')
        }

        if (this.edgeX || this.edgeY) {
          // console.log('EDGE ZOOM', this.currentAction)
          this.currentPivot === 5 && this.handleZoom(event)
        }

        console.log('STOP', this.zoom, top, left, width, height)

        this.treshhold = 0
      }
    }

    this.currentPivot = undefined
    this.currentWidth = undefined
    this.currentHeight = undefined
    this.dragActive = false

    this.omitGlobalEvent('mousemove', this.handleDragUpdate)
    this.omitGlobalEvent('mouseup', this.handleDragEnd)
    this.omitGlobalEvent('touchend', this.handleDragEnd)
    this.omitGlobalEvent('touchmove', this.handleDragUpdate)
  }

  handleDragMove(event: MouseEvent | TouchEvent) {
    const context = this.useContext() as HTMLElement

    if (!event || !this.dragActive || !context) {
      return
    }

    if (this.dragRequest) {
      cancelAnimationFrame(this.dragRequest)
    }

    this.treshhold += 1

    // Delay the drag action while fullscreen is active.
    if (this.zoom && this.treshhold < Enlightenment.FPS) {
      return
    }

    const [clientX, clientY] = this.usePointerPosition(event)

    if (clientX === undefined || clientY === undefined) {
      return
    }

    // if (clientY < 0) {
    //   console.log('Top')
    // } else if (clientY > window.innerHeight) {
    //   console.log('Bottom')
    // }

    // if (clientX < 0) {
    //   console.log('Left')
    // } else if (clientX > window.innerWidth) {
    //   console.log('Right')
    // }

    this.dragRequest = requestAnimationFrame(() => {
      const x = this.pointerX - clientX
      const y = this.pointerY - clientY

      context.style.transform = `translate(${-x}px, ${-y}px)`
      // context.style.top = `${context.offsetLeft - x}px`
    })
  }

  handleDragResize(event?: MouseEvent | TouchEvent) {
    const context = this.useContext() as HTMLElement

    if (!context || this.zoom) {
      return
    }

    if (event) {
      if (!this.currentWidth) {
        this.currentWidth = context.offsetWidth
      }

      if (!this.currentHeight) {
        this.currentHeight = context.offsetHeight
      }

      const [clientX, clientY] = this.usePointerPosition(event)

      const x = clientX - this.pointerX
      const y = clientY - this.pointerY
      // this.pointerX = clientX
      // this.pointerY = clientY

      let resizeX = false
      let resizeY = false
      let translateX = 0
      let translateY = 0
      let height = 0
      let width = 0

      if (Enlightenment.pivots.x.includes(this.currentPivot)) {
        resizeX = true
      }

      if (Enlightenment.pivots.y.includes(this.currentPivot)) {
        resizeY = true
      }

      if (resizeX) {
        if (context.offsetLeft + context.offsetWidth >= window.innerWidth && this.edgeX) {
          width = window.innerWidth - context.offsetLeft
          // this.currentWidth = context.offsetWidth
          console.log('TOO WIDE', this.edgeX)
        } else {
          console.log('to normal?', this.currentWidth, x)

          // const right = clientX <= context.offsetLeft && [1, 4, 7].includes(this.currentPivot)
          // const left = clientX <= context.offsetLeft && [1, 4, 7].includes(this.currentPivot)

          if ([1, 4, 7].includes(this.currentPivot)) {
            width = this.currentWidth - x

            // if () {
            translateX = x
            // }
          } else {
            width = this.currentWidth + x
          }

          // let left = clientX <= context.offsetLeft

          // console.log('POINTER', this.previousPointerX, clientX)

          // if (clientX >= context.offsetLeft && [1, 4, 7].includes(this.currentPivot)) {
          //   left = false
          //   console.log('Should move left')
          // }
          console.log('Move to left', x)

          // // left
          // if (left) {
          // } else {
          //   // right
          //   width = this.currentWidth + x
          // }
        }
      }

      if (resizeY) {
        if (context.offsetTop + context.offsetHeight >= window.innerHeight && this.edgeY) {
          height = window.innerHeight - context.offsetTop
        } else {
          if ([1, 2, 3].includes(this.currentPivot)) {
            height = this.currentHeight - y

            // if () {
            translateY = y
          } else {
            height = this.currentHeight + y
          }

          // if (clientY <= context.offsetTop || [1, 2, 3].includes(this.currentPivot)) {
          //   height = this.currentHeight - y
          //   translateY = y
          // } else {
          //   context.style.height = `${this.currentHeight + y}px`
          // }
        }
      }

      if (width) {
        if (width < 300) {
          width = 300
          translateX = 0
        }

        context.style.width = `${width}px`
      }

      if (height) {
        context.style.height = `${height}px`
      }

      if (translateX || translateY) {
        context.style.transform = `translate(${translateX}px, ${translateY}px)`
      }

      // console.log(context.offsetLeft + context.offsetWidth, window.innerWidth)

      console.log('RESZiZE', translateX)
    }
  }

  handleDragUpdate(event?: MouseEvent | TouchEvent) {
    const [clientX, clientY] = this.usePointerPosition(event)

    if (this.previousPointerX === clientX && this.previousPointerY === clientY) {
      return
    }

    // Defines the current drag directions based on the previous direction.
    this.dragX = clientX > this.previousPointerX ? 1 : -1
    this.dragY = clientY > this.previousPointerY ? 1 : -1

    // Reset any drag direction that has not been changed
    if (this.previousX === clientX) {
      this.dragX = 0
    }

    if (this.previousY === clientY) {
      this.dragY = 0
    }

    // Handle the actual drag action from the defined pivot value.
    if (this.currentPivot !== 5 && this.currentPivot < 10) {
      this.handleDragResize(event)
    } else {
      this.handleDragMove(event)
    }

    // Use the current clientX & clientY values for the next dragUpdate.
    if (clientX) {
      this.previousPointerX = clientX
    }

    if (clientY) {
      this.previousPointerY = clientY
    }
  }

  handleResize(event: UIEvent) {
    this.throttle(this.handleResizeCallback, Enlightenment.FPS, event)
  }

  handleResizeCallback(event: UIEvent) {
    if (this.zoom) {
      if (this.previousEdge) {
        if (this.previousEdge === 'left' || this.previousEdge === 'right') {
          this.edgeX = this.previousEdge
        } else {
          this.edgeY = this.previousEdge
        }
        console.log('RESTORE EDGE', this.edgeX, this.edgeY)
      }

      this.zoom = false
      this.handleZoom(event)
    }

    console.log('resize')
  }

  useEdge() {
    const top = 0 + this.edgeTop
    const left = 0 + this.edgeLeft
    const right = window.innerWidth - this.edgeRight
    const bottom = window.innerHeight - this.edgeBottom

    return [top, right, bottom, left]
  }

  usePointerPosition(event?: MouseEvent | TouchEvent) {
    if (!event || !this.dragActive) {
      return []
    }

    const [edgeTop, edgeRight, edgeBottom, edgeLeft] = this.useEdge()

    const treshhold = devicePixelRatio * 2
    let clientX = 0
    let clientY = 0

    if (event instanceof MouseEvent) {
      clientX = event.clientX
      clientY = event.clientY
    } else if (event instanceof TouchEvent) {
      clientX = event.touches[0].clientX
      clientY = event.touches[0].clientY
    }

    let initialX = clientX
    let initialY = clientY

    // if (this.currentAction === 'move') {
    if (clientY <= edgeTop + treshhold) {
      this.edgeY = 'top'
      clientY = 0
    } else if (clientY >= edgeBottom - treshhold) {
      this.edgeY = 'bottom'
      clientY = window.innerHeight
    } else {
      this.edgeY = undefined
    }

    if (clientX <= edgeLeft + treshhold) {
      this.edgeX = 'left'
      clientX = 0
    } else if (clientX >= edgeRight - treshhold) {
      this.edgeX = 'right'
      console.log('EDGE')
      clientX = window.innerWidth
    } else {
      if (initialX > window.innerWidth) {
        clientX = window.innerWidth
      }

      this.edgeX = undefined
    }

    if (!this.currentPivot || this.currentPivot === 5) {
      if (clientY < edgeTop || clientY > edgeBottom || clientX < edgeLeft || clientX > edgeRight) {
        this.handleDragEnd(event)

        return []
      }
    }
    // }

    return [clientX, clientY]
  }

  handleDragStart(event?: MouseEvent | TouchEvent) {
    if (!event || this.dragActive) {
      return
    }

    event.preventDefault()

    if (event instanceof MouseEvent) {
      if (event.button !== 0) {
        return
      }
    }

    const target = event.target as HTMLSpanElement

    if (target || target.hasAttribute('data-action')) {
      this.currentPivot = parseInt(target.getAttribute('data-pivot'))
    }

    const context = this.useContext() as HTMLElement

    if (!context) {
      return
    }

    this.dragActive = true

    this.currentX = context.offsetLeft
    this.currentY = context.offsetTop

    const [clientX, clientY] = this.usePointerPosition(event)

    this.pointerX = Math.round(clientX)
    this.pointerY = Math.round(clientY)

    this.handleCurrentElement(this)

    this.assignGlobalEvent('mousemove', this.handleDragUpdate, {
      context: document.documentElement
    })

    this.assignGlobalEvent('touchmove', this.handleDragUpdate, {
      context: document.documentElement
    })

    this.assignGlobalEvent('touchend', this.handleDragEnd, {
      once: true
    })

    this.assignGlobalEvent('mouseup', this.handleDragEnd, {
      once: true
    })
  }

  protected handleCurrentElement(target: EventTarget | null): void {
    super.handleCurrentElement(target)

    !this.currentElement && this.handleDragEnd()
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
  }

  handleZoom(event?: Event) {
    if (event && event.preventDefault) {
      event.preventDefault()
    }

    const context = this.useContext() as HTMLElement

    if (!context) {
      return
    }

    if (!this.zoom) {
      this.previousX = context.offsetLeft
      this.previousY = context.offsetTop

      this.previousWidth = context.offsetWidth
      this.previousHeight = context.offsetHeight

      // if (!options) {
      context.removeAttribute('style')
      // }

      if (this.edgeX === 'left') {
        this.previousX = 0
      } else if (this.edgeX === 'right') {
        this.previousX = window.innerWidth - context.offsetWidth
      }

      if (this.edgeY === 'top') {
        this.previousY = 0
      } else if (this.edgeY === 'bottom') {
        this.previousY = window.innerHeight - context.offsetHeight
      }

      if (!this.edgeX && !this.edgeY) {
        context.style.top = `${this.edgeTop || 0}px`
        context.style.left = `${this.edgeLeft || 0}px`
        context.style.width = `${window.innerWidth - this.edgeLeft - this.edgeRight}px`
        context.style.height = `${window.innerHeight - this.edgeTop - this.edgeBottom}px`
      } else if (this.currentPivot) {
        if (this.edgeY === 'top') {
          context.style.top = `${this.edgeTop || 0}px`
          context.style.height = `${window.innerHeight - this.edgeTop - this.edgeBottom}px`
          context.style.left = `${this.edgeLeft || 0}px`
          context.style.width = `${window.innerWidth - this.edgeLeft - this.edgeRight}px`
        } else if (this.edgeY === 'bottom') {
          context.style.top = `${window.innerHeight / 2}px`
          context.style.height = `${window.innerHeight / 2 - (this.edgeBottom || 0)}px`
          context.style.width = `${window.innerWidth - this.edgeLeft - this.edgeRight}px`
          context.style.left = `${this.edgeLeft || 0}px`
        }

        if (this.edgeX === 'left') {
          context.style.top = `${this.edgeTop || 0}px`
          context.style.left = `${this.edgeLeft || 0}px`
          context.style.width = `${window.innerWidth / 2 - this.edgeLeft}px`
          context.style.height = `${window.innerHeight - this.edgeTop - this.edgeBottom}px`
        } else if (this.edgeX === 'right') {
          context.style.top = `${this.edgeTop || 0}px`
          context.style.left = `${window.innerWidth / 2}px`
          context.style.width = `${window.innerWidth / 2 - this.edgeRight}px`
          context.style.height = `${window.innerHeight - this.edgeTop - this.edgeBottom}px`
        }
      }
    } else {
      context.style.top = `${this.previousY}px`
      context.style.left = `${this.previousX}px`
      console.log('Restore', this.currentPivot)

      // Restore the initial Window width & height
      if (this.previousWidth) {
        if (this.previousWidth + context.offsetLeft >= window.innerWidth) {
          context.style.width = `${window.innerWidth - context.offsetLeft}px`
        } else {
          context.style.width = `${this.previousWidth}px`
        }
      }

      if (this.previousHeight) {
        if (this.previousHeight + context.offsetTop >= window.innerHeight) {
          context.style.height = `${window.innerHeight - context.offsetTop}px`
        } else {
          context.style.height = `${this.previousHeight}px`
        }
      }

      // Restore the Window and remove any focus from it.
      this.throttle(this.handleCurrentElement)

      this.previousEdge = undefined

      context.style.width = this.width || undefined
      context.style.height = this.height || undefined
    }

    this.previousEdge = this.edgeX || this.edgeY || undefined
    this.edgeX = undefined
    this.edgeY = undefined

    this.commit('zoom', !this.zoom)
  }

  protected updated(properties: any) {
    super.updated(properties)

    this.updateAttribute('views')
  }

  renderControls() {
    return html`
      <div class="window__controls">
        <button class="window__control window__control--exit" @click=${this.handleExit}></button>
        <button
          class="window__control window__control--suspend @click=${this.handleSuspend}"
        ></button>
        <button class="window__control window__control--zoom" @click=${this.handleZoom}></button>
      </div>
    `
  }

  renderHeader(excludeControls?: boolean) {
    return html`
      <header class="window__header">
        <span
          class="window__handle"
          data-pivot="5"
          @mousedown="${this.handleDragStart}"
          @touchstart="${this.handleDragStart}"
        ></span>
        ${this.renderMeta()} ${!excludeControls ? this.renderControls() : nothing}
      </header>
    `
  }

  renderMeta() {
    return html` <span class="window__meta">${this.title}</span> `
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

    if (this.type) {
      classes.push(`window--type-is-${this.type}`)
    }

    if (this.controls) {
      classes.push(`window--has-controls-${this.controls}`)
    }

    if (this.zoom) {
      classes.push(`window--is-zoomed`)
    }

    return html`
      <div ref="${ref(this.context)}" class="${classes.join(' ')}" draggable>
        ${this.type === 'primary' ? this.renderHeader() : nothing}
        <div class="window__body">
          <aside class="window__aside">
            ${this.type === 'secondary' ? this.renderControls() : nothing}
          </aside>
          <main class="window__content">
            ${this.type === 'secondary' ? this.renderHeader(true) : nothing} ${this.renderViews()}
          </main>
        </div>
        <footer class="window__footer"></footer>
        ${Array.from({ length: 9 }).map((_, index) => {
          if (index === 4) {
            return
          }

          return html`
            <span
              class="window__handle"
              data-pivot="${index + 1}"
              @mousedown="${this.handleDragStart}"
              @touchstart="${this.handleDragStart}"
            ></span>
          `
        })}
      </div>
    `
  }
}
