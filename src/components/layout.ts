import { Container } from "pixi.js"
import { components, state } from "../state"

//root container
export class Layout extends Container {
  public name: string
  constructor() {
    super()
    this.name = "Layout"
    //set initial layout container size
    this.width = document.documentElement.clientWidth
    this.height = document.documentElement.clientHeight
  }

  updateLayout(rendererWidth: number, rendererHeight: number) {
    components.background.updateLayout(rendererWidth, rendererHeight)
    components.foreground.updateLayout(rendererWidth, rendererHeight)
    components.splashScreen.updateLayout(rendererWidth, rendererHeight)

    if (!state.splashScreenVisible) {
      if (rendererWidth - components.background.width >= 0) {
        this.x = (rendererWidth - components.background.width) / 2
      } else {
        this.x = 0
      }

      if (rendererHeight - this.height > 0) {
        this.y = (rendererHeight - this.height) * 0.2
      } else {
        this.y = 0
      }
    }
  }
}
