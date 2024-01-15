import { Container } from "pixi.js"
import { components} from "../state"
import { SmartContainer } from "./smartContainer"

//root container
export class Enemies extends SmartContainer {
  container:Container
  public name: string
  constructor() {
    super()
    this.name = "Enemies container"

    //container
    this.container = new Container()
    this.name = "enemies"
    this.addChild(this.container)

  }

  updateLayout(width: number, height: number) {


  }
}