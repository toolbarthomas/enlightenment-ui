import {
  customElement,
  Enlightenment,
  html,
  property,
} from "@toolbarthomas/enlightenment";

import sprite from "assets/svg/sprite.svg";

import styles from "./Button.scss";

@customElement("ui-button")
class EnlightenmentButton extends Enlightenment {
  static styles = [styles];

  constructor() {
    super();

    this.svgSpriteSource = sprite;
  }

  render() {
    console.log("render");
    return html`<button>Button</button>`;
  }
}
