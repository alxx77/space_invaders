import { Container, Sprite, Text, Texture, utils } from "pixi.js"
import { components } from "../state"
import { stageWidth, stageHeight, fontStyles } from "../settings"

//root container
export class SplashScreen extends Container {
  public name: string
  private container: Container
  private sprite: Sprite
  private startText:Text
  constructor() {
    super()
    this.name = "Splash"

    //container
    this.container = new Container()
    this.name = "splash"
    this.addChild(this.container)

    //sprite
    this.sprite = new Sprite(utils.TextureCache['splash'])
    this.container.addChild(this.sprite)

     //press space to play
     this.startText = new Text(` Press Space to Enter `, fontStyles.splashText)
     this.startText.anchor.set(0.5)
     this.startText.scale.set(1.2)
     this.startText.x = this.width / 2
     this.startText.y = this.height * 0.77
     this.container.addChild(this.startText)
  }

  updateLayout(rendererWidth: number, rendererHeight: number) {
    const scaleFactorX = rendererWidth / 1920
    const scaleFactorY = rendererHeight/ 1080
    const scaleFactor = Math.min(scaleFactorX, scaleFactorY)
    this.scale.set(scaleFactor)

    this.x = (rendererWidth - this.width)/2
    this.y = (rendererHeight - this.height)/2
  }
}
