import { reaction } from "mobx"
import { components, state } from "./state"
import { Player } from "./components/player"
import { Background } from "./components/background"
import { Invaders } from "./components/invaders"
import { Foreground } from "./components/foreground"
import { SplashScreen } from "./components/splashScreen"

//high level game logic
export class Game {
  background: Background
  foreground: Foreground
  splashScreen: SplashScreen
  constructor() {
    //initialize components
    this.background = new Background()
    this.foreground = new Foreground()
    this.splashScreen = new SplashScreen()

    //save component references
    components.game = this
    components.background = this.background
    components.foreground = this.foreground
    components.splashScreen = this.splashScreen

    components.background.visible = false
    components.foreground.visible = false

    //add to root container
    components.layout.addChild(
      this.background,
      this.foreground,
      this.splashScreen
    )

    //prevent this rebinding
    const updateView = this.updateView

    //resize event
    window.addEventListener("resize", updateView)

    //change device orientation
    window.addEventListener("orientationchange", updateView)

    window.addEventListener("keydown", function (event) {
      switch (event.key) {
        case "A":
        case "a":
        case "ArrowLeft":
          state.set_LEFT_keyPressed(true)
          state.setLastKeyPressed("A")
          break

        case "S":
        case "s":
        case "ArrowDown":
          state.set_DOWN_keyPressed(true)
          state.setLastKeyPressed("S")
          break

        case "D":
        case "d":
        case "ArrowRight":
          state.set_RIGHT_keyPressed(true)
          state.setLastKeyPressed("D")
          break

        case "W":
        case "w":
        case "ArrowUp":
          state.set_UP_keyPressed(true)
          state.setLastKeyPressed("W")
          break

        case " ":
          state.set_SPACEBAR_keyPressed(true)
          break

        default:
          break
      }
    })

    window.addEventListener("keyup", function (event) {
      switch (event.key) {
        case "A":
        case "a":
        case "ArrowLeft":
          state.set_LEFT_keyPressed(false)
          break

        case "S":
        case "s":
        case "ArrowDown":
          state.set_DOWN_keyPressed(false)
          break

        case "D":
        case "d":
        case "ArrowRight":
          state.set_RIGHT_keyPressed(false)
          break

        case "W":
        case "w":
        case "ArrowUp":
          state.set_UP_keyPressed(false)
          break

        case " ":
          state.set_SPACEBAR_keyPressed(false)
          break

        default:
          break
      }
    })

    //score count
    reaction(
      () => state.invaderDestroyed,
      (newVal) => {
        if (newVal === true) {
          state.setScoreCounter(state.scoreCounter + 100)
        }
        state.setInvaderDestroyed(false)
      }
    )

    this.updateView()
  }

  //signal when level is finished in any way
  //if current level is completed ( there i no more enemies) or
  //player is destroyed and destruction is completed
  async levelPlayingStopped() {
    return new Promise<void>((resolve) => {
      let disposer = reaction(
        () => ({
          currentLevelCompleted: state.currentLevelCompleted,
          playerAlive: state.playerAlive,
          playerDestructionCompletedTrigger:
            state.playerDestructionCompletedTrigger,
        }),
        (newVal, oldVal) => {
          if (
            newVal.currentLevelCompleted === true ||
            (newVal.playerAlive === false &&
              newVal.playerDestructionCompletedTrigger !==
                oldVal.playerDestructionCompletedTrigger)
          ) {
            resolve()
            disposer()
          }
        }
      )
    })
  }

  async play() {
    state.setWaitingForGameStart(true)

    components.player = new Player()

    components.invaders = new Invaders()
    components.invaders.createInvaders()

    this.updateView()

    state.setLivesCounter(3)
    await components.player.slideIn()

    document.body.style.cursor = "none"

    state.setPlayerActive(false)
    await components.foreground.showPressSpaceToPlayText()
    components.foreground.showLevelStartText()
    state.setPlayerActive(true)

    while (state.livesCounter > 0) {
      if (!state.playerAlive) {
        components.player = new Player()
        await components.player.slideIn()
      }

      state.setInvadersActive(true)

      //start playing
      components.invaders.startMove()

      components.invaders.startShooting()

      //wait until player dies or all enemies are destroyed
      await this.levelPlayingStopped()

      //check if level is completed
      if (state.currentLevelCompleted) {
        //there is possibility that player is destroyed although level is completed
        if (!state.playerAlive) {
          components.player = new Player()
        }

        state.setPlayerActive(false)
        await components.foreground.showLevelCompletedText()
        await components.player.slideOut()

        state.setGameLevel(state.gameLevel + 1)
        state.setCurrentLevelCompleted(false)
        //setup next level invaders
        components.invaders.createInvaders()

        state.setPlayerActive(false)
        await components.player.slideIn()
        components.foreground.showLevelStartText()
        state.setPlayerActive(true)
      } else {
        components.invaders.resetPosition()
      }
    }

    //show game over message
    await components.foreground.showGameOverText()
    document.body.style.cursor = "auto"
  }

  //recalc view
  updateView = () => {
    let w = document.documentElement.clientWidth
    let h = document.documentElement.clientHeight

    //resize
    components.renderer.resize(w, h)

    //update components
    components.layout.updateLayout(w, h)
  }
}
