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
  kw;

  @property({ type: String })
  color = "dawn";

  @property({ type: String })
  label?: string;

  @property({ type: String })
  shape = "soft";

  @property({ type: String })
  size = "small";

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

    console.log(event.target);

    if (context && this.isComponentContext(event.target)) {
      const ripple = document.createElement("span");
      ripple.classList.add("button__ripple");
      ripple.style.position = "absolute";

      const diameter = Math.max(context.clientWidth, context.clientHeight);
      const radius = diameter / 2;
      ripple.style.width = `${diameter}px`;
      ripple.style.height = `${diameter}px`;
      ripple.style.left = `${event.clientX - (context.offsetLeft + radius)}px`;
      ripple.style.top = `${event.clientY - (context.offsetTop + radius)}px`;

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
    event && event.preventDefault();

    this.appenRipple(event);

    this.onClick && this.onClick(event);
  }

  render() {
    const classes = [
      "button",
      `button--is-${this.shape}`,
      `button--is-${this.size}`,
      `button--in-${this.color}`,
    ];

    return html`<button
      @click="${this.handleClick}"
      ref="${ref(this.context)}"
      class="${classes.join(" ")}"
    >
      <slot>${this.label}</slot>
    </button>`;
  }
}
