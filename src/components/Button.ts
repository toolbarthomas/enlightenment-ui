import {
  customElement,
  Enlightenment,
  html,
  property,
  ref,
} from "@toolbarthomas/enlightenment";

import sprite from "assets/svg/sprite.svg";

import styles from "./Button.scss";

@customElement("ui-button")
class EnlightenmentButton extends Enlightenment {
  static styles = [styles];

  @property({ type: String })
  color = "dawn";

  @property({ type: String })
  direction = "ltr";

  @property({
    converter: Enlightenment.isBoolean,
    type: String,
  })
  disabled: boolean;

  @property({ type: String })
  label?: string;

  @property({ type: String })
  loadingMessage = "Loading";

  @property({ type: String })
  shape = "soft";

  @property({ type: String })
  size = "medium";

  @property({ type: String })
  skin = "default";

  @property({ type: String })
  type = "button";

  // Renders the component as anchor element with the defined href attribute
  // that is always resolved as internal URL.
  @property({
    converter: (value: any) => {
      console.log("convert", typeof value);
      if (typeof value !== "string") {
        return;
      }

      return Enlightenment.resolveURL(value);
    },
    type: String,
  })
  href: string;

  @property({ type: String })
  icon: string;

  @property({
    converter: Enlightenment.isBoolean,
    type: Boolean,
  })
  hideText: boolean;

  @property({
    type: String,
  })
  layout = "inline";

  @property({
    converter: Enlightenment.isBoolean,
    type: Boolean,
  })
  loading: boolean;

  @property({
    converter: Enlightenment.isTarget,
    type: Boolean,
  })
  target = "_self";

  @property({ type: Function })
  onClick?: Function;

  constructor() {
    super();

    this.svgSpriteSource = sprite;
  }

  /**
   * Implements the ripple effect for the button click action.
   */
  appenRipple(event: MouseEvent) {
    if (!event) {
      return;
    }

    const context = this.useRef(this.context);

    if (context && this.isComponentContext(event.target)) {
      const ripple = document.createElement("span");
      ripple.classList.add("button__ripple");
      ripple.style.position = "absolute";

      const diameter = Math.max(context.clientWidth, context.clientHeight);
      const radius = diameter / 2;
      ripple.style.width = `${diameter}px`;
      ripple.style.height = `${diameter}px`;
      ripple.style.left = `${
        event.clientX - (context.offsetLeft + radius) + window.scrollX
      }px`;
      ripple.style.top = `${
        event.clientY - (context.offsetTop + radius) + window.scrollY
      }px`;
      console.log();

      // Center the ripple if the click was triggered from the keyboard.
      if (
        diameter / 2 <=
        Math.abs(event.clientX - (context.offsetLeft + radius))
      ) {
        ripple.style.left = `${context.clientWidth / 2 - diameter / 2}px`;
        ripple.style.top = `${context.clientHeight / 2 - diameter / 2}px`;
      }

      context.appendChild(ripple);
      context.addEventListener("animationend", () => ripple.remove(), {
        once: true,
      });
      this.throttle(() => ripple && ripple.remove(), 1000);
    }
  }

  /**
   * Defines the click logic for the rendered component.
   */
  handleClick(event: MouseEvent) {
    if (this.href) {
      return;
    }

    event && event.preventDefault();

    if (this.disabled) {
      return;
    }

    this.appenRipple(event);

    if (this.preventEvent) {
      return;
    }

    this.onClick && this.onClick(event);
  }

  renderAfter() {
    if (this.icon || this.loading) {
      return html`
        <span class="button__icon-wrapper">
          ${this.renderIndicator()} ${this.renderIcon()}
        </span>
      `;
    }
  }

  renderBefore() {
    if (this.loading) {
      return html`<span class="button__label">${this.loadingMessage}</span>`;
    }

    if (this.hideText) {
      return html`
        <span class="button__label"><slot>${this.label}</slot></span>
      `;
    }

    return html`<span class="button__label"><slot>${this.label}</slot></span>`;
  }

  renderIndicator() {
    return this.loading && html`<span class="button__indicator"></span>`;
  }

  renderIcon() {
    return (
      this.icon && this.renderImage(this.icon, { classname: "button__icon" })
    );
  }

  render() {
    const classes = [
      "button",
      `button--in-${this.color}`,
      `button--is-${this.direction}`,
      `button--is-${this.layout}`,
      `button--is-${this.shape}`,
      `button--is-${this.size}`,
      `button--is-${this.skin}`,
    ];

    if (this.disabled) {
      classes.push("button--is-disabled");
    }

    if (this.hideText) {
      classes.push("button--is-visually-hidden");
    }

    if (this.loading) {
      classes.push("button--is-loading");
    }

    if (this.icon) {
      classes.push("button--has-icon");
    }

    if (this.href) {
      return html`<a
        ?disabled=${this.disabled}
        @click="${this.handleClick}"
        class="${classes.join(" ")}"
        href="${this.href}"
        ref="${ref(this.context)}"
        target="${this.target}"
      >
        ${this.renderBefore()} ${this.renderAfter()}
      </a>`;
    }

    return html`
      <button
        ?disabled=${this.disabled}
        @click="${this.handleClick}"
        class="${classes.join(" ")}"
        ref="${ref(this.context)}"
        type="${this.type}"
      >
        ${this.renderBefore()} ${this.renderAfter()}
      </button>
    `;
  }
}
