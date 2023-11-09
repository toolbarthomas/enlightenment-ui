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
class EnlightenmentSingleSelect extends Enlightenment {
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
  placeholder?: string

  @property({ type: Array })
  selected: HTMLInputElement[] = []

  @property({ type: Number })
  max?: number

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

  /**
   * Read the defined File as ArrayBuffer and use the first X of Bytes that is
   * used to compare 2 Files with matching sizes.
   *
   * @param file The actual File to read.
   * @param size Use the defined amount of bytes or 1024 instead.
   */
  readFile(file: File, size?: number) {
    return new Promise<string | null>((resolve) => {
      const reader = new FileReader()

      reader.addEventListener(
        'load',
        (event) => {
          if (!event || !event.target || !event.target.result) {
            return resolve(null)
          }

          const header = new TextDecoder().decode(event.target.result.slice(0, size || 1024))

          resolve(header || null)
        },
        { once: true }
      )
      reader.readAsArrayBuffer(file)
    })
  }

  render() {
    return html`<div class="file-selector">${this.renderInput()} ${this.renderSelected()}</div>`
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
      <div class="file-selector__input-wrapper">
        <label class="file-selector__input-label" for="${this.id}">
          <span>${this.files.length || 'Select File'}</span>
          <input
            ?disabled=${this.disabled}
            @change="${this.handleChange}"
            class="file-selector__input"
            id="${this.id}"
            name="${this.name}"
            ?multiple=${!this.max || this.max > 1}
            type="file"
          />
        </label>
      </div>
    `
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
      return html`<li class="file-selector__selected-item">${file.name}</li>`
    })

    return html`<div class="file-selector__selected">
      <ul clas="file-selector__selected-items">
        ${body}
      </ul>
    </div>`
  }
}
