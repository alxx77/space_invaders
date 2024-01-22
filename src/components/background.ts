import { Container, Sprite, utils, Texture } from "pixi.js"
import {
  backgroundScrollTimePerSprite,
  minHeight,
  minWidth,
  stageHeight,
  stageWidth,
} from "../settings"
import * as TWEEN from "@tweenjs/tween.js"

export class Background extends Container {
  container: Container
  private backgroundSprite1: Sprite
  private backgroundSprite2: Sprite
  constructor() {
    super()
    //container
    this.container = new Container()
    this.name = "background"
    this.addChild(this.container)

    //mask
    const mask = new Sprite(Texture.WHITE)
    mask.width = stageWidth
    mask.height = stageHeight
    this.addChild(mask)
    this.mask = mask

    //sprite 1
    this.backgroundSprite1 = new Sprite(utils.TextureCache["space"])
    this.backgroundSprite1.width = stageWidth
    this.backgroundSprite1.height = stageHeight
    this.backgroundSprite1.position.set(0, 0)
    this.container.addChild(this.backgroundSprite1)
    const bg1 = this.backgroundSprite1

    //sprite 2
    this.backgroundSprite2 = new Sprite(utils.TextureCache["space"])
    this.backgroundSprite2.width = stageWidth
    this.backgroundSprite2.height = stageHeight
    this.backgroundSprite2.y = this.backgroundSprite2.height * -1
    this.backgroundSprite2.position.set(0, bg1.height * -1)
    this.container.addChild(this.backgroundSprite2)
    const bg2 = this.backgroundSprite2

    // Tween for the first background sprite
    this.createScrollTween(bg1, bg1.height, backgroundScrollTimePerSprite)
      .repeat(Infinity)
      .start()

    // Tween for the second background sprite
    this.createScrollTween(bg2, 0, backgroundScrollTimePerSprite)
      .repeat(Infinity)
      .start()
  }

  createScrollTween(sprite: Sprite, newY: number, duration: number) {
    return new TWEEN.Tween(sprite.position).to({ y: newY }, duration)
  }

  updateLayout(rendererWidth: number, rendererHeight: number) {
    // Calculate scale factors to preserve aspect ratio
    const scaleFactorX = Math.max(rendererWidth, minWidth) / stageWidth
    const scaleFactorY = Math.max(rendererHeight, minHeight) / stageHeight
    const scaleFactor = Math.min(scaleFactorX, scaleFactorY)
    this.scale.set(scaleFactor)
  }
}
