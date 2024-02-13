import { Container } from "pixi.js"
import { CRTFilter } from "pixi-filters"
import { components, state } from "../state"

//root container
export class Layout extends Container {
  public name: string
  public crtfilter: CRTFilter
  constructor() {
    super()
    this.name = "Layout"
    //set initial layout container size
    this.width = document.documentElement.clientWidth
    this.height = document.documentElement.clientHeight
    this.crtfilter = new CRTFilter({
      curvature: 1,
      lineWidth: 3,
      lineContrast: 0.3,
      noise: 0.2,
      noiseSize: 1,
      vignetting: 0.2,
      vignettingAlpha: 1,
      vignettingBlur: 0.2,
      time: 0.5,
      seed: 0
    })
    this.filters = [this.crtfilter]
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
