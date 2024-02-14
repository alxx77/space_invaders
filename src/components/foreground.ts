import { Container, Sprite, Texture, Text, utils } from "pixi.js"
import { components, state } from "../state"
import {
  fontStyles,
  soundSource,
  stageHeight,
  stageWidth,
  sound,
} from "../settings"
import { reaction } from "mobx"
import { Howl } from "howler"

export class Foreground extends Container {
  container: Container
  private foregroundSprite: Sprite
  private scoreText: Text
  private livesText: Text
  private startText: Text
  private levelCompletedText: Text
  private smallPressSpaceToContinueText: Text
  private gameOverText: Text
  private gameCompletedText: Text
  private levelCompletedSound: Howl
  private startSound: Howl
  private gameOverSound: Howl
  gameTheme: Howl
  private gameCompletedSound: Howl
  weaponBonusSprite: Sprite
  fireRateBonusSprite: Sprite
  cannonballBonusSprite: Sprite
  levelText: Text

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
    this.scoreText = new Text(`SCORE: 0 `, fontStyles.scoreText)
    this.scoreText.scale.set(2)
    this.scoreText.x = 115
    this.scoreText.y = 40
    this.scoreText.alpha = 0.7

    this.container.addChild(this.scoreText)

    //lives
    this.livesText = new Text(`CREDIT: 0 `, fontStyles.scoreText)
    this.livesText.scale.set(2)
    this.livesText.x = 668
    this.livesText.y = 40
    this.livesText.alpha = 0.7

    this.container.addChild(this.livesText)

    //level
    this.levelText = new Text(`LEVEL 1`, fontStyles.scoreText)
    this.levelText.scale.set(1.9)
    this.levelText.anchor.set(0.5)
    this.levelText.x = stageWidth * 0.85
    this.levelText.y = stageHeight * 0.97
    this.levelText.alpha = 0.4

    this.container.addChild(this.levelText)

    //press space to play
    const startText = state.mobileDevice
      ? `Tap to Start`
      : `Press SPACE to Start`
    this.startText = new Text(startText, fontStyles.startText)
    //this.startText.scale.set(1.85)
    this.startText.anchor.set(0.5)
    this.startText.width = stageWidth * 0.6
    this.startText.scale.y = this.startText.scale.x
    this.startText.x = stageWidth / 2 + 10
    this.startText.y = stageHeight / 2
    this.startText.visible = false

    this.container.addChild(this.startText)

    //level completed
    this.levelCompletedText = new Text(``, fontStyles.levelCompletedText)
    this.levelCompletedText.anchor.set(0.5)
    this.levelCompletedText.scale.set(2)
    this.levelCompletedText.x = stageWidth / 2
    this.levelCompletedText.y = stageHeight / 2
    this.levelCompletedText.visible = false

    this.container.addChild(this.levelCompletedText)

    const smallPressSpaceToContinueText = state.mobileDevice
      ? `TAP TO CONTINUE`
      : `Press SPACE to Start`
    this.smallPressSpaceToContinueText = new Text(
      smallPressSpaceToContinueText,
      fontStyles.levelCompleted2Text
    )
    this.smallPressSpaceToContinueText.anchor.set(0.5)
    this.smallPressSpaceToContinueText.scale.set(2)
    this.smallPressSpaceToContinueText.x = stageWidth / 2
    this.smallPressSpaceToContinueText.y =
      this.levelCompletedText.y + this.levelCompletedText.height
    this.smallPressSpaceToContinueText.visible = false

    this.container.addChild(this.smallPressSpaceToContinueText)

    //game over
    this.gameOverText = new Text(` GAME OVER `, fontStyles.levelCompletedText)
    this.gameOverText.anchor.set(0.5)
    this.gameOverText.scale.set(2)
    this.gameOverText.x = stageWidth / 2
    this.gameOverText.y = stageHeight / 2
    this.gameOverText.visible = false

    this.container.addChild(this.gameOverText)

    //game completed text
    this.gameCompletedText = new Text(
      `GAME COMPLETED!`,
      fontStyles.levelCompletedText
    )
    this.gameCompletedText.anchor.set(0.5)
    this.gameCompletedText.scale.set(2)
    this.gameCompletedText.x = stageWidth / 2
    this.gameCompletedText.y = stageHeight / 2
    this.gameCompletedText.visible = false

    this.container.addChild(this.gameCompletedText)

    this.weaponBonusSprite = new Sprite(utils.TextureCache["axes_1"])
    this.weaponBonusSprite.scale.set(1.5)
    this.weaponBonusSprite.anchor.set(0.5)
    this.weaponBonusSprite.alpha = 0.5
    this.weaponBonusSprite.visible = false
    this.weaponBonusSprite.x = 50
    this.weaponBonusSprite.y = stageHeight * 0.85

    this.container.addChild(this.weaponBonusSprite)

    //fire rate bonus
    this.fireRateBonusSprite = new Sprite(
      utils.TextureCache["bonus_weapon_upgrade"]
    )
    this.fireRateBonusSprite.anchor.set(0.5)
    this.fireRateBonusSprite.alpha = 0.5
    this.fireRateBonusSprite.visible = false
    this.fireRateBonusSprite.x = 50
    this.fireRateBonusSprite.y = stageHeight * 0.9

    this.container.addChild(this.fireRateBonusSprite)

    //cannonball bonus
    this.cannonballBonusSprite = new Sprite(
      utils.TextureCache["bonus_weapon_upgrade2"]
    )
    this.cannonballBonusSprite.anchor.set(0.5)
    this.cannonballBonusSprite.alpha = 0.5
    this.cannonballBonusSprite.visible = false
    this.cannonballBonusSprite.x = 50
    this.cannonballBonusSprite.y = stageHeight * 0.95

    this.container.addChild(this.cannonballBonusSprite)

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
      onend: () => {
        self.gameTheme.volume(0.7)
      },
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
      volume: sound.music.highVolume,
      loop: false,
    })

    this.gameCompletedSound = new Howl({
      src: [soundSource.gameCompleted],
      volume: 0.7,
      loop: false,
    })
  }

  updateScoreText(score: number) {
    this.scoreText.text = `SCORE: ${score} `
  }

  updateLivesText(lives: number) {
    this.livesText.text = `CREDIT: ${lives} `
  }

  updateLevelText(level: number) {
    this.levelText.text = `LEVEL: ${level} `
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
        () => ({
          SPACEBAR_keyPressed: state.SPACEBAR_keyPressed,
          screenTapped: state.screenTapped,
        }),
        (newVal, oldVal) => {
          if (
            (newVal.SPACEBAR_keyPressed === false &&
              oldVal.SPACEBAR_keyPressed === true) ||
            (newVal.screenTapped === false && oldVal.screenTapped === true)
          ) {
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
      }, 1000)
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
      self.smallPressSpaceToContinueText.visible =
        !self.smallPressSpaceToContinueText.visible
    }, 550)

    const startTime = Date.now()

    return new Promise<void>((resolve) => {
      const disposer = reaction(
        //react on SPACEBAR keyup
        () => ({
          SPACEBAR_keyPressed: state.SPACEBAR_keyPressed,
          screenTapped: state.screenTapped,
        }),
        (newVal, oldVal) => {
          if (
            ((newVal.SPACEBAR_keyPressed === false &&
              oldVal.SPACEBAR_keyPressed === true) ||
              (newVal.screenTapped === false &&
                oldVal.screenTapped === true)) &&
            Date.now() - startTime > 2700
          ) {
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
      self.smallPressSpaceToContinueText.visible =
        !self.smallPressSpaceToContinueText.visible
    }, 550)

    const startTime = Date.now()

    return new Promise<void>((resolve) => {
      const disposer = reaction(
        //react on SPACEBAR keyup
        () => ({
          SPACEBAR_keyPressed: state.SPACEBAR_keyPressed,
          screenTapped: state.screenTapped,
        }),
        (newVal, oldVal) => {
          if (
            ((newVal.SPACEBAR_keyPressed === false &&
              oldVal.SPACEBAR_keyPressed === true) ||
              (newVal.screenTapped === false &&
                oldVal.screenTapped === true)) &&
            Date.now() - startTime > 1000
          ) {
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

  showGameCompletedText() {
    const self = this
    this.gameCompletedSound.play()
    state.setWaitingForLevelCompletedTextToClose(true)
    self.gameCompletedText.visible = true

    const i = setInterval(() => {
      self.gameCompletedText.visible = !self.gameCompletedText.visible
    }, 650)
  }

  updateLayout(width: number, height: number) {
    this.scale = components.background.scale
  }
}
