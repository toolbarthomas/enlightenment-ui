import {
  createRef,
  customElement,
  Enlightenment,
  html,
  nothing,
  property,
  ref
} from '@toolbarthomas/enlightenment'

import styles from './FileSelector.scss'

@customElement('ui-file-selector')
class EnlightenmentFileSelector extends Enlightenment {
  static styles = [styles]

  @property({
    converter: Enlightenment.isBoolean,
    type: Boolean
  })
  disabled?: boolean

  @property({ type: String })
  label?: string

  @property({ type: String })
  name?: string

  @property({ type: String })
  id? = Enlightenment.useElementID()

  @property({ type: String })
  placeholder?: string = 'Select drop files'

  @property({ type: Array })
  selected: HTMLInputElement[] = []

  @property({ converter: Enlightenment.isInteger, type: Number })
  max?: number

  isDropzone?: boolean

  body: any

  files: File[] = []

  /**
   * Validates if any new Files can be included while using the optional
   * [max] property
   */
  canInclude() {
    if (!this.max) {
      return true
    }

    if (typeof this.max !== 'number') {
      return true
    }

    if (!this.files.length) {
      return true
    }

    return this.files.length < this.max
  }

  static sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  static unit = 1024

  useFileSize(value: number) {
    if (!value) {
      return []
    }

    const i = parseInt(Math.floor(Math.log(value) / Math.log(EnlightenmentFileSelector.unit)), 10)

    if (!i) {
      return [value, EnlightenmentFileSelector.sizes[0]]
    }

    return [
      parseFloat((value / EnlightenmentFileSelector.unit ** i).toFixed(1)),
      EnlightenmentFileSelector.sizes[i]
    ]
  }

  /**
   * Asyncronous Callback handler during a File Input change Event that will
   * include the selected File Objects within the defined Component [files]
   * property.
   *
   * @param event Retreives the FileList Interface from the given Event.
   */
  handleChange(event: Event) {
    const input = event.target as HTMLInputElement

    if (!input || !input.files) {
      return
    }

    Promise.all(
      Array.from(input.files).map(
        (file) =>
          new Promise<File | null>((next) => {
            if (file instanceof File === false) {
              return next(null)
            }

            if (file && !this.files.length) {
              this.commit('files', [...this.files, file])
              next(file)
            } else if (file && !this.files.includes(file) && this.canInclude()) {
              this.readFile(file).then((hash) => {
                let included = false

                const duplicates = this.files.filter(
                  (f) =>
                    f.lastModified === file.lastModified &&
                    f.name === file.name &&
                    f.size === file.size
                )

                if (duplicates.length) {
                  Promise.all(duplicates.map(this.readFile)).then((result) => {
                    if (!result.includes(hash) && this.canInclude()) {
                      this.commit('files', [...this.files, file])
                    }
                  })
                  next(file)
                } else if (this.canInclude()) {
                  this.commit('files', [...this.files, file])
                  next(file)
                } else {
                  next(null)
                }
              })
            } else {
              next(null)
            }
          })
      )
    ).then((list) => {
      if (!Object.isFrozen(this.files)) {
        Object.freeze(this.files)
      }
    })
  }

  handleDragEnter(event: DragEvent) {
    this.handleDragOver(event)

    this.throttle(this.commit, Enlightenment.FPS, 'isDropzone', true)
  }

  handleDragOver(event: DragEvent) {
    if (!event) {
      return
    }

    event.preventDefault()
  }

  handleDragReset(event: DragEvent) {
    this.throttle(this.commit, Enlightenment.FPS, 'isDropzone', false)
  }

  handleDrop(event: DragEvent) {
    if (!event || !event.dataTransfer) {
      return
    }

    event.preventDefault()

    const queue = Array.from(event.dataTransfer.items || event.dataTransfer.files)

    const files = queue.map((entry) => {
      if (entry instanceof File) {
        return entry
      }

      return entry.getAsFile()
    })

    this.handleDragReset()
    this.handleChange({ ...event, target: { ...event.target, files } } as Event)

    console.log('Dropped files', files)
  }

  /**
   * Read the defined File as ArrayBuffer and use the first X of Bytes that is
   * used to compare 2 Files with matching sizes.
   *
   * @param file The actual File to read.
   * @param size Use the defined amount of bytes or 1024 instead.
   */
  readFile(file: File, size?: number) {
    return new Promise<string | null>((resolve) => {
      if (file instanceof File === false) {
        return resolve(null)
      }

      const reader = new FileReader()

      reader.addEventListener(
        'load',
        (event) => {
          if (!event || !event.target || !event.target.result) {
            return resolve(null)
          }

          try {
            const header = new TextDecoder().decode(event.target.result.slice(0, size || 1024))

            resolve(header || null)
          } catch (error) {
            if (error) {
              this.log(error, 'error')

              return resolve(null)
            }
          }
        },
        { once: true }
      )
      reader.readAsArrayBuffer(file)
    })
  }

  render() {
    const classes = ['file-selector']

    if (this.isDropzone) {
      classes.push('file-selector--is-dropzone')
    }

    return html`<div class="${classes.join(' ')}">
      ${this.renderLabel()} ${this.renderInput()} ${this.renderSelected()}
    </div>`
  }

  /**
   * Renders the functional File input Element that is used to selected actual
   * sources from the client's FileSystem.
   */
  renderInput() {
    if (this.files.length && this.files.length >= this.max) {
      return nothing
    }

    return html`
      <div
        class="file-selector__input-wrapper"
        @mouseenter="${this.handleDragReset}"
        @mouseleave="${this.handleDragReset}"
        @dragend="${this.handleDragReset}"
        @dragenter="${this.handleDragEnter}"
        @dragover="${this.handleDragOver}"
        @drop="${this.handleDrop}"
      >
        <label class="file-selector__input-label" for="${this.id}">
          <input
            ?disabled=${this.disabled}
            @change="${this.handleChange}"
            class="file-selector__input"
            id="${this.id}"
            name="${this.name}"
            ?multiple=${!this.max || this.max > 1}
            type="file"
          />
          ${this.renderSlot()}
        </label>
      </div>
    `
  }

  renderLabel() {
    if (!this.label) {
      return nothing
    }

    return html`<label class="file-selector__label" for="${this.id}">${this.label}</label>`
  }

  renderLegend() {
    if (!this.files.length) {
      return nothing
    }

    let label = `${this.files.length}`
    if (this.max) {
      label += `/ ${this.max}`
    }

    return html`<span class="file-selector__legend">${label} files</span>`
  }

  /**
   * Renders the already selected File entries and UI for removing already
   * selected files.
   */
  renderSelected() {
    if (!this.files) {
      return nothing
    }

    const body = this.files.map((file) => {
      const [size, unit] = this.useFileSize(file.size)

      return html`<li class="file-selector__selected-item">
        <span class="file-selector__selected-item-name">${file.name}</span>
        <span class="file-selector__selected-item-size">${size} ${unit}</span>
      </li>`
    })

    return html`<div class="file-selector__selected">
      ${this.renderLegend()}
      <ul class="file-selector__selected-items">
        ${body}
      </ul>
    </div>`
  }

  renderSlot() {
    if (!this.canInclude()) {
      return nothing
    }

    return html`<slot>
      <div class="file-selector__placeholder">
        <div class="file-selector__placeholder-icon-group">
          ${new Array(2).fill().map(
            () =>
              html`<span class="file-selector__placeholder-icon">
                <span class="file-selector__placeholder-icon-fold"></span>
              </span>`
          )}
        </div>
        ${this.placeholder}
        ${this.max
          ? html`<span class="file-selector__placeholder-info">(Maximum files: ${this.max})</span>`
          : nothing}
      </div>
    </slot>`
  }
}
