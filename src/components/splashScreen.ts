import { Container, Sprite, Text, utils } from "pixi.js"
import { state } from "../state"
import { fontStyles } from "../settings"

//root container
export class SplashScreen extends Container {
  public name: string
  private container: Container
  private sprite: Sprite
  private startText: Text
  splashWidth: number
  splashHeight: number
  scaleFactor: number
  constructor() {
    super()
    this.name = "Splash"

    this.scaleFactor = state.mobileDevice? 3 : 2
    this.splashWidth = 1920 * this.scaleFactor
    this.splashHeight = 1080 * this.scaleFactor

    //container
    this.container = new Container()
    this.name = "splash"
    this.addChild(this.container)

    //sprite
    this.sprite = new Sprite(utils.TextureCache["splash"])
    this.sprite.anchor.set(0.5)
    this.container.addChild(this.sprite)

    //press space to play
    const startText = state.mobileDevice
      ? `Tap To Enter`
      : `Press Space to Enter`
    this.startText = new Text(startText, fontStyles.splashText)
    this.startText.anchor.set(0.5)
    this.container.addChild(this.startText)
    this.container.eventMode = "static"
    this.container.on("pointertap", () => {
      state.set_SPACEBAR_keyPressed(true)
      state.set_SPACEBAR_keyPressed(false)
    })
  }

  updateLayout(rendererWidth: number, rendererHeight: number) {
    this.scaleFactor = state.mobileDevice? 3 : 2
    const scaleFactorX = rendererWidth / 1920
    const scaleFactorY = rendererHeight / 1080
    const scaleFactor = Math.min(scaleFactorX, scaleFactorY)
    this.scale.set(scaleFactor)

    this.sprite.scale.set(this.scaleFactor)
    this.sprite.x = this.splashWidth / 2
    this.sprite.y = this.splashHeight / 2
    this.startText.scale.set(this.scaleFactor)
    this.startText.x = this.splashWidth/2
    this.startText.y = this.splashHeight/2

    this.y = (rendererHeight - this.height) / 2
    this.x = (rendererWidth - this.width) / 2
  }
}
