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

  handleChange(event: Event) {
    const input = event.target as HTMLInputElement

    if (!input) {
      return
    }

    const [file] = input.files

    if (file && !this.files.length) {
      this.commit('files', [...this.files, file])
    } else if (file && !this.files.includes(file)) {
      const reader = new FileReader()

      reader.addEventListener(
        'load',
        (event) => {
          if (!event.target || !event.target.result) {
            return
          }

          const compare = new TextDecoder().decode(event.target.result.slice(0, 1024))

          const commit = []

          this.files.forEach((f) => {
            const nextReader = new FileReader()

            nextReader.addEventListener(
              'load',
              (next) => {
                if (!next.target || !next.target.result) {
                  return
                }

                const nextCompare = new TextDecoder().decode(next.target.result.slice(0, 1024))

                // Prevents duplicate files to be added to the queue. This does
                // not apply for identical files stored at different locations.
                if (
                  compare !== nextCompare ||
                  f.name !== file.name ||
                  f.lastModified !== file.lastModified ||
                  f.size !== file.size
                ) {
                  this.commit('files', [...this.files, file])
                }
              },
              { once: true }
            )
            nextReader.readAsArrayBuffer(f)
          })
        },
        { once: true }
      )
      reader.readAsArrayBuffer(file)
    }

    input.value = null
  }

  render() {
    return html`<div class="file-selector">${this.renderInput()} ${this.renderSelected()}</div>`
  }

  renderInput() {
    if (this.files.length && this.files.length >= this.max) {
      return nothing
    }

    return html`
      <input
        ?disabled=${this.disabled}
        @change="${this.handleChange}"
        name="${this.name}"
        type="file"
      />
    `
  }

  renderSelected() {
    if (!this.files) {
      return nothing
    }

    return this.files.map((file) => {
      return html`<span>${file.name}</span>`
    })
  }
}
