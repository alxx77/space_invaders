import { reaction } from "mobx"
import { components, state } from "./state"
import { Player } from "./components/player"
import { Background } from "./components/background"
import { Invaders } from "./components/invaders"
import { Foreground } from "./components/foreground"
import { SplashScreen } from "./components/splashScreen"
import { IPointData, FederatedPointerEvent } from "pixi.js"
import { finalLevel } from "./settings"
import Timeout from "smart-timeout"

//high level game logic
export class Game {
  background: Background
  foreground: Foreground
  splashScreen: SplashScreen
  autofire: NodeJS.Timeout | undefined
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
      (newVal, oldVal) => {
        if (newVal > oldVal) {
          state.setScoreCounter(state.scoreCounter + 100)
        }
      }
    )

    this.updateView()

    components.layout.on("touchstart", onTouchStart)
    components.layout.on("touchmove", onTouchMove)
    components.layout.on("touchend", onTouchEnd)
    components.layout.on("touchendoutside", onTouchEndOutside)

    components.layout.eventMode = "static"

    const self = this

    // Store the initial touch position
    let initialTouch: IPointData | undefined = undefined

    // Define the touchstart event handler function
    function onTouchStart(event: FederatedPointerEvent) {
      state.set_SPACEBAR_keyPressed(true)
      initialTouch = event.getLocalPosition(components.foreground.container)
      if (
        components.player &&
        initialTouch &&
        state.playerAlive &&
        state.playerActive
      ) {
        components.player.moveToPosition(
          initialTouch.x - components.player.width / 2,
          initialTouch.y - components.player.height / 2
        )
        self.autofire = setInterval(async () => {
          if (components.player && state.playerAlive && state.playerActive) {
            await new Promise<void>((resolve) => {
              const t = Timeout.instantiate(() => {
                components.player.shoot()
                resolve()
              }, Math.random() * 75)
            })
          }
        }, 200)
      }
    }

    // Define the touchmove event handler function
    function onTouchMove(event: FederatedPointerEvent) {
      if (initialTouch) {
        const newPosition = event.getLocalPosition(
          components.foreground.container
        )

        // Calculate the distance dragged
        const deltaX = newPosition.x - initialTouch.x
        const deltaY = newPosition.y - initialTouch.y

        // Update the sprite position based on the drag distance
        if (components.player) {
          components.player.moveDelta(deltaX, deltaY)
        }

        // Update the initial touch position for the next move event
        initialTouch = newPosition
      }
    }

    // Define the touchend event handler function
    function onTouchEnd() {
      initialTouch = undefined
      clearInterval(self.autofire)
      state.set_SPACEBAR_keyPressed(false)
    }

    function onTouchEndOutside() {
      initialTouch = undefined
      clearInterval(self.autofire)
      state.set_SPACEBAR_keyPressed(false)
    }
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

    state.setGameLevel(1)
    state.setScoreCounter(0)

    components.player = new Player()

    if (!components.invaders) {
      components.invaders = new Invaders()
    }

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
        await components.player.slideToCenter()
        await components.foreground.showLevelCompletedText()

        state.setGameLevel(state.gameLevel + 1)
        if (state.gameLevel > finalLevel) {
          break
        }
        state.setCurrentLevelCompleted(false)
        //setup next level invaders
        components.invaders.createInvaders()

        state.setPlayerActive(false)
        components.foreground.showLevelStartText()
        state.setPlayerActive(true)
      } else {
        //here it is necessary to manually deactivate invaders
        //so that invaders can be cleared without triggering
        //level completed change
        state.setInvadersActive(false)
        components.invaders.clearProjectiles()
        await components.invaders.resetPosition()
        if(state.invaders.length === 0){
          //edge case - where player dies while completing level

          //level is repeated
          components.invaders.createInvaders()
        }
      }
    }

    //here it is either game over or game completed
    if (state.gameLevel > finalLevel) {
      components.foreground.showGameCompletedText()
      document.body.style.cursor = "auto"
      return
    }

    //show game over message
    await components.foreground.showGameOverText()

    //play again..!
    this.play()
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
