import { Container, Sprite, utils, Texture, Text } from "pixi.js"
import { components, state } from "../state"
import { fontStyles, stageHeight, stageWidth } from "../settings"
import { reaction } from "mobx"

export class Foreground extends Container {
  container: Container
  private foregroundSprite: Sprite
  private scoreText: Text
  private livesText: Text
  private startText: Text
  constructor() {
    super()
    //container
    this.container = new Container()
    this.name = "foreground"
    this.addChild(this.container)

    //sprite
    this.foregroundSprite = new Sprite(Texture.EMPTY)
    this.foregroundSprite.width = stageWidth
    this.foregroundSprite.height = stageHeight
    this.container.addChild(this.foregroundSprite)

    //mask
    const mask = new Sprite(Texture.WHITE)
    mask.width = stageWidth
    mask.height = stageHeight
    this.addChild(mask)
    this.mask = mask

    //score
    this.scoreText = new Text(`Score: 0`, fontStyles.scoreText)
    this.scoreText.x = 10
    this.scoreText.y = stageHeight * 0.95

    this.container.addChild(this.scoreText)

    //lives
    this.livesText = new Text(`Credit: 0`, fontStyles.scoreText)
    this.livesText.x = 1095
    this.livesText.y = stageHeight * 0.95

    this.container.addChild(this.livesText)

    //press space to play
    this.startText = new Text(`Press Space to Start`, fontStyles.startText)
    this.startText.anchor.set(0.5)
    this.startText.x = stageWidth / 2
    this.startText.y = stageHeight / 2
    this.startText.visible = false

    this.container.addChild(this.startText)

    reaction(
      () => state.scoreCounter,
      (newVal) => {
        this.updateScoreText(newVal)
      }
    )

    reaction(
      () => state.livesCounter,
      (newVal) => {
        this.updateLivesText(newVal)
      }
    )
  }

  updateScoreText(score: number) {
    this.scoreText.text = `Score: ${score}`
  }

  updateLivesText(lives: number) {
    this.livesText.text = `Credit: ${lives}`
  }

  async showStartText() {
    const self = this
    const i = setInterval(() => {
      self.startText.visible = !self.startText.visible
    }, 750)

    return new Promise<void>((resolve) => {
      const disposer = reaction(
        //react on SPACEBAR keyup
        () => state.SPACEBAR_keyPressed,
        (newVal, oldVal) => {
          if (newVal === false && oldVal === true) {
            clearInterval(i)
            self.startText.visible = false
            state.setWaitingForGameStart(false)
            resolve()
            disposer()
          }
        }
      )
    })
  }

  updateLayout(width: number, height: number) {
    this.scale = components.background.scale
    // this.x = components.background.x
    // this.y = components.background.y
  }
}
