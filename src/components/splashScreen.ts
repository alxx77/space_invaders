import { Container, Sprite, Text, Texture, utils } from "pixi.js"
import { components, state } from "../state"
import { stageWidth, stageHeight, fontStyles } from "../settings"

//root container
export class SplashScreen extends Container {
  public name: string
  private container: Container
  private sprite: Sprite
  private startText: Text
  constructor() {
    super()
    this.name = "Splash"

    //container
    this.container = new Container()
    this.name = "splash"
    this.addChild(this.container)

    //sprite
    this.sprite = new Sprite(utils.TextureCache["splash"])
    this.container.addChild(this.sprite)

    //press space to play
    const startText = state.mobileDevice
      ? `Tap To Enter`
      : `Press Space to Enter`
    this.startText = new Text(startText, fontStyles.splashText)
    this.startText.anchor.set(0.5)
    this.startText.scale.set(2)
    this.startText.x = this.width / 2
    this.startText.y = this.height * 0.77
    this.container.addChild(this.startText)

    this.container.eventMode = 'static'
    this.container.on("pointertap", () => {
      state.set_SPACEBAR_keyPressed(true)
      state.set_SPACEBAR_keyPressed(false)
    })
  }

  onContainerTap() {}

  updateLayout(rendererWidth: number, rendererHeight: number) {
    const scaleFactorX = rendererWidth / 1920
    const scaleFactorY = rendererHeight / 1080
    const scaleFactor = Math.min(scaleFactorX, scaleFactorY)
    this.scale.set(scaleFactor)

    this.x = (rendererWidth - this.width) / 2
    this.y = (rendererHeight - this.height) / 2
  }
}
