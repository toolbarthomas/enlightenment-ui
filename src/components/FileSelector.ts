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

export type FileSystemResponse = File[] | undefined

@customElement('ui-file-selector')
class EnlightenmentFileSelector extends Enlightenment {
  static styles = [styles]

  static a11y = {
    clear: 'Clear'
  }

  static sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  static unit = 1024

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

  @property({ type: String })
  clearFileLabel?: label = 'Clear file'

  @property({ type: Array })
  selected: HTMLInputElement[] = []

  @property({ converter: Enlightenment.isInteger, type: Number })
  max?: number

  isDropzone?: boolean

  body: any

  files: File[] = []

  // Stores additional meta inforation for the defined file that has been
  // included with the HTML5 File API.
  private paths: { [key: string]: File } = {}

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

  clearFile(file: File, event?: Event) {
    if (event && event.preventDefault) {
      event.preventDefault()
    }

    const files = this.files.filter((f) => f !== file)
    const keys = Object.keys(this.paths).filter((p) => this.paths[p] === file)

    this.commit('files', () => {
      this.files = files
      Object.freeze(this.files)

      keys.forEach((key) => delete this.paths[key])
    })
  }

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
    const files = []

    Promise.all(queue.map((entry) => this.traverseEntry(entry, files))).then((r) => {
      console.log(files.length)

      this.handleDragReset()
      this.handleChange({ ...event, target: { ...event.target, files } } as Event)
    })
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
          console.log('FILE', event.target)

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
            ?multiple=${!this.max || this.max > 1}
            @change="${this.handleChange}"
            class="file-selector__input"
            id="${this.id}"
            name="${this.name}"
            ref="${ref(this.context)}"
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
    if (!this.files || !this.files.length) {
      return nothing
    }

    const body = this.files.map((file) => {
      const [size, unit] = this.useFileSize(file.size)

      return html`<li class="file-selector__selected-item">
        <header class="file-selector__selected-item-header">
          <div class="file-selector__selected-item-header-body">
            <span class="file-selector__selected-item-name">${file.name}</span>
            ${this.renderSelectedPath(file)}
          </div>
          <span class="file-selector__selected-item-size">${size} ${unit}</span>
        </header>
        <slot name="clear" @click="${(event) => this.clearFile(file, event)}">
          <button class="file-selector__selected-item-clear" type="button">
            <span
              class="file-selector__selected-item-clear-icon"
              aria-focusable="false"
              aria-hidden="true"
            ></span>
            <span class="file-selector__selected-item-clear-label">
              ${EnlightenmentFileSelector.a11y.clear} ${file.name}
            </span>
          </button>
        </slot>
      </li>`
    })

    this.cloneSlot('clear')

    return html`<div class="file-selector__selected">
      ${this.renderLegend()}
      <ul class="file-selector__selected-items">
        ${body}
      </ul>
    </div>`
  }

  renderSelectedPath(file: File) {
    let path = ''

    if (Object.values(this.paths).includes(file)) {
      path += atob(Object.keys(this.paths).filter((f) => this.paths[f] === file)[0])

      if (path.startsWith('/') || path.startsWith('\\')) {
        path = path.substring(1)
      }
    }

    return path.length
      ? html`<span class="file-selector__selected-item-path">${path}</span>`
      : nothing
  }

  renderSlot() {
    if (!this.canInclude()) {
      return nothing
    }

    const context = this.useContext() as HTMLElement

    // Assign the fallback Event listener if the placeholder Slot element is
    // assigned.
    const slot = this.useSlot(Enlightenment.defaults.slot, true)

    return html`
      <slot @click="${() => slot && context && context.click()}">
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
            ? html`<span class="file-selector__placeholder-info"
                >(Maximum files: ${this.max})</span
              >`
            : nothing}
        </div>
      </slot>
    `
  }

  readEntries(entry: FileSystemDirectoryEntry, queue?: FileSystemEntry[]) {
    return new Promise<FileSystemResponse>((resolve) => {
      if (!entry) {
        return resolve(queue)
      }

      const reader = entry.createReader()

      try {
        reader.readEntries((entries) => {
          if (!entries.length) {
            return resolve()
          }

          Promise.all(
            entries.map((e) => {
              return this.traverseEntry(e, queue)
            })
          ).then(() => resolve(queue))
        }, resolve)
      } catch (error) {
        if (error) {
          this.log(error, 'error')
          resolve(queue)
        }
      }
    })
  }

  traverseEntry(entry: DataTransferItem, queue?: FileSystemEntry[]) {
    return new Promise<FileSystemResponse>((resolve) => {
      const asEntry = entry.webkitGetAsEntry ? entry.webkitGetAsEntry() : entry
      const q = queue || []

      if (!asEntry) {
        return resolve([entry])
      }

      try {
        if (asEntry.isFile) {
          const e = asEntry as FileSystemFileEntry

          return e.file((file) => {
            if (e.fullPath) {
              this.paths[btoa(e.fullPath.replace(file.name, ''))] = file
            }

            q.push(file)
            resolve(q)
          }, resolve)
        } else if (asEntry.isDirectory) {
          return this.readEntries(asEntry, q).then(() => {
            resolve(q)
          })
        } else {
          return resolve(q)
        }
      } catch (exception) {
        if (exception) {
          this.log(exception, 'error')
        }
      }
    })

    //   // const files = queue.map((entry) => {
    //   //   if (entry instanceof File) {
    //   //     return entry
    //   //   }

    //   //   const asEntry = entry.webkitGetAsEntry()

    //   //   if (asEntry && asEntry.isDirectory) {
    //   //     return this.traverseEntry(asEntry as FileSystemDirectoryEntry)
    //   //   }

    //   //   return this.packEntry()
    //   // })

    //   const reader = entry.createReader()

    //   const cwd = entry.name
    //   const queue = []

    //   if (!reader) {
    //     return
    //   }

    //   return this.readEntries(reader, queue)
    // }
  }
}
