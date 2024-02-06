import {
  Container,
  Sprite,
  Texture,
  Text,
  FederatedPointerEvent,
} from "pixi.js"
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
import * as TWEEN from "@tweenjs/tween.js"
import { TextureAtlasPage } from "pixi-spine"

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
  healthText: Text
  private levelCompletedSound: Howl
  private startSound: Howl
  private gameOverSound: Howl
  gameTheme: Howl
  private gameCompletedSound: Howl
  private weaponBonusText: Text
  private fireRateBonusText: Text
  weaponBonusTextInterval: NodeJS.Timeout | undefined
  fireRateBonusTextInterval: NodeJS.Timeout | undefined
  private weaponBonusEndsSound: Howl
  private fireRateBonusEndsSound: Howl

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
    this.scoreText.scale.set(2)
    this.scoreText.x = 10
    this.scoreText.y = stageHeight * 0.02

    this.container.addChild(this.scoreText)

    //lives
    this.livesText = new Text(`CREDIT: 0`, fontStyles.scoreText)
    this.livesText.scale.set(2)
    this.livesText.x = stageWidth - 370
    this.livesText.y = stageHeight * 0.02

    this.container.addChild(this.livesText)

    //press space to play
    const startText = state.mobileDevice
      ? `Tap to Start`
      : `Press SPACE to Start`
    this.startText = new Text(startText, fontStyles.startText)
    this.startText.scale.set(1.85)
    this.startText.anchor.set(0.5)
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

    //health
    this.healthText = new Text(`*****`, fontStyles.healthText)
    //this.healthText.anchor.set(0.5)
    this.healthText.scale.set(2)

    this.healthText.y = stageHeight * 0.14
    this.healthText.x = 10
    this.healthText.angle = -90
    this.healthText.visible = true

    this.container.addChild(this.healthText)

    //weapon bonus
    this.weaponBonusText = new Text(`Weapon Stage 3!`, fontStyles.bonus1Text)
    this.weaponBonusText.scale.set(1.75)
    this.weaponBonusText.visible = false

    this.container.addChild(this.weaponBonusText)

    //fire rate bonus
    this.fireRateBonusText = new Text(`Bonus Fire Rate!`, fontStyles.bonus2Text)
    this.fireRateBonusText.scale.set(1.75)
    this.fireRateBonusText.visible = false

    this.container.addChild(this.fireRateBonusText)

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

    this.weaponBonusEndsSound = new Howl({
      src: [soundSource.bonusEnds],
      volume: 0.3,
      loop: false,
    })

    this.fireRateBonusEndsSound = new Howl({
      src: [soundSource.bonusEnds],
      volume: 0.3,
      loop: false,
    })
  }

  showFireRateBonusText(x: number, y: number) {
    this.fireRateBonusText.x = x
    this.fireRateBonusText.y = y
    this.fireRateBonusText.visible = true
    const self = this

    new TWEEN.Tween({ xPos: x, yPos: y })
      .to({ xPos: stageWidth * 0.05, yPos: stageHeight * 0.92 }, 750)
      .delay(1000)
      .onUpdate(function (value) {
        self.fireRateBonusText.x = value.xPos
        self.fireRateBonusText.y = value.yPos
      })
      .start()
      .onComplete(() => {
        this.fireRateBonusTextInterval = setInterval(() => {
          this.fireRateBonusText.visible = !this.fireRateBonusText.visible
        }, 550)
      })
  }

  hideFireRateBonusText(playSound: boolean) {
    if (!this.fireRateBonusTextInterval) return
    this.fireRateBonusText.visible = false
    if (playSound) {
      this.fireRateBonusEndsSound.play()
      this.fireRateBonusEndsSound.once("end", () => {
        this.fireRateBonusEndsSound.play()
      })
    }
    clearInterval(this.fireRateBonusTextInterval)
    this.fireRateBonusTextInterval = undefined
  }

  showWeaponBonusText(x: number, y: number) {
    this.weaponBonusText.x = x
    this.weaponBonusText.y = y
    this.weaponBonusText.visible = true
    const self = this

    new TWEEN.Tween({ xPos: x, yPos: y })
      .to({ xPos: stageWidth * 0.53, yPos: stageHeight * 0.97 }, 750)
      .delay(1000)
      .onUpdate(function (value) {
        self.weaponBonusText.x = value.xPos
        self.weaponBonusText.y = value.yPos
      })
      .start()
      .onComplete(() => {
        this.weaponBonusTextInterval = setInterval(() => {
          this.weaponBonusText.visible = !this.weaponBonusText.visible
        }, 550)
      })
  }

  hideWeaponBonusText(playSound: boolean) {
    if (!this.weaponBonusTextInterval) return
    this.weaponBonusText.visible = false
    clearInterval(this.weaponBonusTextInterval)
    this.weaponBonusTextInterval = undefined
    if (playSound) {
      this.weaponBonusEndsSound.play()
      this.weaponBonusEndsSound.once("end", () => {
        this.weaponBonusEndsSound.play()
      })
    }
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
