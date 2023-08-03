import {
  customElement,
  Enlightenment,
  html,
  property,
} from "@toolbarthomas/enlightenment";

import sprite from "assets/svg/sprite.svg";

@customElement("ui-button")
class EnlightenmentButton extends Enlightenment {
  constructor() {
    super();

    this.svgSpriteSource = sprite;
  }

  render() {
    // console.log("render");
    return html`<button>Button</button>`;
  }
}
