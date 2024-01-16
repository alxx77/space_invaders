import { Container } from "pixi.js"
import { components, state} from "../state"

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

  updateLayout(width: number, height: number) {
    components.background.updateLayout(width,height)
    if(components.player){
      components.player.updateLayout(width,height)
    }
    if(components.invaders){
      components.invaders.updateLayout(width,height)
    }
    components.foreground.updateLayout(width,height)
    state.projectiles.forEach(el => el.updateLayout(width,height))
  }
}
