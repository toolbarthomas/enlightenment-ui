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

  handleChange(event: Event) {
    const input = event.target as HTMLInputElement

    if (!input || !input.files) {
      return
    }

    for (let i = 0; i < input.files.length; i++) {
      const file = input.files[i]

      if (file && !this.files.length) {
        this.commit('files', [...this.files, file])
      } else if (file && !this.files.includes(file) && this.canInclude()) {
        // Compare the initial File with the included Files by meta information.
        // The initial file will only be included if there is no other File with
        // identical File contents.
        this.readFile(file).then((hash) => {
          let included = false

          const duplicates = this.files.filter(
            (f) =>
              f.lastModified === file.lastModified && f.name === file.name && f.size === file.size
          )

          if (duplicates.length) {
            Promise.all(duplicates.map((duplicate) => this.readFile(duplicate))).then((result) => {
              if (!result.includes(hash) && this.canInclude()) {
                this.commit('files', [...this.files, file])
              }
            })
          } else if (this.canInclude()) {
            this.commit('files', [...this.files, file])
          }
        })
      }
    }
  }

  render() {
    return html`<div class="file-selector">${this.renderInput()} ${this.renderSelected()}</div>`
  }

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
