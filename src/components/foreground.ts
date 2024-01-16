import { Container, Sprite, utils, Texture } from "pixi.js"
import { components } from "../state"

export class Foreground extends Container {
  private container: Container
  private foregroundSprite: Sprite
  constructor() {
    super()
    //container
    this.container = new Container()
    this.name = "foreground"
    this.addChild(this.container)

    //sprite
    this.foregroundSprite = new Sprite(Texture.EMPTY)
    this.foregroundSprite.width = 1280
    this.foregroundSprite.height = 960
    this.container.addChild(this.foregroundSprite)
  }

  updateLayout(width: number, height: number) {
        this.scale.x = components.background.scale.x
        this.scale.y = components.background.scale.y
  }
}
