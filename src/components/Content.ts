import {
  createRef,
  customElement,
  Enlightenment,
  html,
  nothing,
  property,
  ref
} from '@toolbarthomas/enlightenment'

import sprite from 'assets/svg/sprite.svg'

import styles from './Content.scss'

@customElement('ui-content')
class EnlightenmentContent extends Enlightenment {
  static styles = [styles]

  @property({ type: String })
  color = 'blank'

  @property({ type: String })
  layout = 'compact'

  @property({ type: String })
  label?: string

  anchor = createRef()
  header = createRef()
  main = createRef()

  /**
   *
   */
  public connectedCallback(): void {
    super.connectedCallback()
  }

  // /**
  //  * Styles the rendered anchor element within the slot element. This is only
  //  * applied once since the Content component should be reattached if the slot
  //  * content should be updated again. Actual view flow logic should be applied
  //  * outside this component, this is just a basic wrapper to display (static)
  //  * content.
  //  */
  // firstUpdated() {
  //   super.firstUpdated();

  //   // Create the handler once so it can be omitted from the listeners collection.
  //   const callback = () =>
  //     this.throttle(() => {
  //       this.styleAnchor();
  //       this.omitGlobalEvent("slotchange", callback);
  //     });

  //   this.assignGlobalEvent("slotchange", callback, this);
  // }

  render() {
    const classes = ['content', `content--is-${this.color}`, `content--is-${this.layout}`]

    if (this.isNested()) {
      classes.push('content--is-nested')
    }

    return html`
      <section ref="${ref(this.context)}" class="${classes.join(' ')}">
        <div class="content__wrapper">${this.renderSummary()} ${this.renderMain()}</div>
      </section>
    `
  }

  renderSummary() {
    const { summary } = this.slots || {}
    // if (summary || this.label) {
    return html`
      <header class="content__header" ref="${ref(this.header)}">
        ${this.renderLabel()}
        <div class="content__summary">
          <slot name="summary"></slot>
        </div>
        <a ref="${ref(this.anchor)}" class="content__link" aria-hidden="true">&nbsp;</a>
      </header>
    `
    // }
  }

  /**
   * Renders the main content of the current element and wrap an optional
   * article element if the defined element is nested within the same element
   * type.
   */
  renderMain() {
    return html`
      <main class="content__main" ref="${ref(this.main)}">
        ${this.isNested()
          ? html`<slot></slot>`
          : html`
              <article>
                <slot></slot>
              </article
            `}
      </main>
    `
  }

  renderLabel(tag?: string) {
    if (!tag) {
      return nothing
    }

    switch (tag) {
      case 'h6':
        return html`<h6 class="content__label">${this.label}</h6>`

      case 'h5':
        return html`<h5 class="content__label">${this.label}</h5>`

      case 'h4':
        return html`<h4 class="content__label">${this.label}</h4>`

      case 'h3':
        return html`<h3 class="content__label">${this.label}</h3>`

      case 'h2':
        return html`<h2 class="content__label">${this.label}</h2>`

      default:
        return html`<h1 class="content__label">${this.label}</h1>`
    }
  }

  // styleAnchor() {
  //   const slot = this.useSlot();

  //   if (!slot) {
  //     return;
  //   }

  //   const nodes = slot.assignedElements();
  //   if (!nodes.length) {
  //     return;
  //   }

  //   const anchors = [];
  //   for (let i = 0; i < nodes.length; i += 1) {
  //     anchors.push(...nodes[i].querySelectorAll("a"));
  //   }

  //   if (!anchors.length) {
  //     return;
  //   }

  //   const anchor = this.useRef(this.anchor);
  //   if (!anchor) {
  //     return;
  //   }

  //   const { display, ...style } = getComputedStyle(anchor);
  //   const properties = Object.entries(style).filter(
  //     ([property, value]) => value.length && isNaN(parseInt(property))
  //   );

  //   const cssText = properties
  //     .map(
  //       ([property, value]) =>
  //         `${Enlightenment.camelCaseToSnakeCase(property)}: ${value};`
  //     )
  //     .join("\n");

  //   for (let i = 0; i < anchors.length; i += 1) {
  //     if (!anchors[i].style.cssText) {
  //       anchors[i].style.cssText = cssText;
  //     }
  //   }

  //   console.log(anchors);
  // }
}
