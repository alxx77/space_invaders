import { Container, Sprite, utils, Texture, Text } from "pixi.js"
import { components, state } from "../state"
import { fontStyles, stageHeight, stageWidth } from "../settings"
import { reaction } from "mobx"

export class Foreground extends Container {
  container: Container
  private foregroundSprite: Sprite
  private scoreText: Text
  private livesText: Text
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
    this.scoreText = new Text(`Score: 0`, fontStyles.gamePanelCredit)
    this.scoreText.x = 10
    this.scoreText.y = stageHeight * 0.95

    this.container.addChild(this.scoreText)

    //lives
    this.livesText = new Text(`Credit: 0`, fontStyles.gamePanelWin)
    this.livesText.x = 1095
    this.livesText.y = stageHeight * 0.95

    this.container.addChild(this.livesText)

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

  updateLayout(width: number, height: number) {
    this.scale.x = components.background.scale.x
    this.scale.y = components.background.scale.y
  }
}
