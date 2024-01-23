import { Container, Sprite, utils, Texture, Text } from "pixi.js"
import { components, state } from "../state"
import { fontStyles, soundSource, stageHeight, stageWidth } from "../settings"
import { reaction } from "mobx"
import { Howl } from "howler"

export class Foreground extends Container {
  container: Container
  private foregroundSprite: Sprite
  private scoreText: Text
  private livesText: Text
  private startText: Text
  private levelCompletedText: Text
  private smallPressSpaceToContinueText:Text
  private gameOverText:Text
  private levelCompletedSound: Howl
  private startSound: Howl
  private gameOverSound: Howl
  gameTheme: Howl
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
    this.scoreText = new Text(`SCORE: 0`, fontStyles.scoreText)
    this.scoreText.x = 10
    this.scoreText.y = stageHeight * 0.95

    this.container.addChild(this.scoreText)

    //lives
    this.livesText = new Text(`CREDIT: 0`, fontStyles.scoreText)
    this.livesText.x = 1095
    this.livesText.y = stageHeight * 0.95

    this.container.addChild(this.livesText)

    //press space to play
    this.startText = new Text(`Press SPACE to Start`, fontStyles.startText)
    this.startText.anchor.set(0.5)
    this.startText.x = (stageWidth / 2) + 10 
    this.startText.y = stageHeight / 2
    this.startText.visible = false

    this.container.addChild(this.startText)

    //level completed
    this.levelCompletedText = new Text(``, fontStyles.levelCompletedText)
    this.levelCompletedText.anchor.set(0.5)
    this.levelCompletedText.x = stageWidth / 2
    this.levelCompletedText.y = stageHeight / 2
    this.levelCompletedText.visible = false

    this.container.addChild(this.levelCompletedText)

    this.smallPressSpaceToContinueText = new Text(` PRESS SPACE TO CONTINUE `, fontStyles.levelCompleted2Text)
    this.smallPressSpaceToContinueText.anchor.set(0.5)
    this.smallPressSpaceToContinueText.x = stageWidth / 2
    this.smallPressSpaceToContinueText.y = this.levelCompletedText.y + this.levelCompletedText.height
    this.smallPressSpaceToContinueText.visible = false

    this.container.addChild(this.smallPressSpaceToContinueText)

    //game over
    this.gameOverText = new Text(`GAME OVER`, fontStyles.levelCompletedText)
    this.gameOverText.anchor.set(0.5)
    this.gameOverText.x = stageWidth / 2
    this.gameOverText.y = stageHeight / 2
    this.gameOverText.visible = false

    this.container.addChild(this.gameOverText)

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

    const self = this

    this.levelCompletedSound = new Howl({
      src: [soundSource.levelCompleted],
      volume: 1,
      loop: false,
      onend: ()=>{self.gameTheme.volume(0.7)}
    })

    this.startSound = new Howl({
      src: [soundSource.startPlay],
      volume: 0.5,
      loop: false,
    })

    this.gameOverSound = new Howl({
      src: [soundSource.gameOver],
      volume: 0.8,
      loop: false,
    })

    this.gameTheme = new Howl({
      src: [soundSource.gameTheme],
      volume: 0.7,
      loop: false,
    })
  }

  updateScoreText(score: number) {
    this.scoreText.text = `SCORE: ${score}`
  }

  updateLivesText(lives: number) {
    this.livesText.text = `CREDIT: ${lives}`
  }

  async showPressSpaceToPlayText() {
    const self = this
    self.startText.visible = true
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
            this.gameTheme.fade(0.7, 0.15, 1000)
            this.startSound.play()
            resolve()
            disposer()
          }
        }
      )
    })
  }

  async showLevelStartText() {
    const self = this
    this.levelCompletedText.text = ` LEVEL ${state.gameLevel} `
    self.levelCompletedText.visible = true

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        self.levelCompletedText.visible = false
        resolve()
      }, 1250)
    })
  }

  async showLevelCompletedText() {
    const self = this
    this.levelCompletedText.text = ` LEVEL ${state.gameLevel} COMPLETED `
    self.gameTheme.fade(0.7, 0, 10)
    this.levelCompletedSound.play()
    state.setWaitingForLevelCompletedTextToClose(true)
    self.levelCompletedText.visible = true

    const i = setInterval(() => {
      self.smallPressSpaceToContinueText.visible = !self.smallPressSpaceToContinueText.visible
    }, 550)

    const startTime = Date.now()

    return new Promise<void>((resolve) => {
      const disposer = reaction(
        //react on SPACEBAR keyup
        () => state.SPACEBAR_keyPressed,
        (newVal, oldVal) => {
          if (newVal === false && oldVal === true && (Date.now() - startTime)>1500) {
            clearInterval(i)
            self.levelCompletedText.visible = false
            self.gameTheme.fade(0.7, 0.15, 1000)
            self.smallPressSpaceToContinueText.visible = false
            state.setWaitingForLevelCompletedTextToClose(false)
            resolve()
            disposer()
          }
        }
      )
    })
  }

  async showGameOverText() {
    const self = this
    this.gameOverSound.play()
    state.setWaitingForLevelCompletedTextToClose(true)
    self.gameOverText.visible = true

    const i = setInterval(() => {
      self.smallPressSpaceToContinueText.visible = !self.smallPressSpaceToContinueText.visible
    }, 550)

    const startTime = Date.now()

    return new Promise<void>((resolve) => {
      const disposer = reaction(
        //react on SPACEBAR keyup
        () => state.SPACEBAR_keyPressed,
        (newVal, oldVal) => {
          if (newVal === false && oldVal === true && (Date.now() - startTime)>1000) {
            clearInterval(i)
            self.gameOverText.visible = false
            self.smallPressSpaceToContinueText.visible = false
            state.setWaitingForLevelCompletedTextToClose(false)
            resolve()
            disposer()
          }
        }
      )
    })
  }

  updateLayout(width: number, height: number) {
    this.scale = components.background.scale
  }
}
