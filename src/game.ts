import { reaction, autorun } from "mobx"
import { components, state } from "./state"
import { Player } from "./components/player"
import { Background } from "./components/background"
import { Projectile } from "./components/projectile"
import { projectileSpeed, stageHeight, stageWidth } from "./settings"
import { Invaders } from "./components/invaders"
import { Foreground } from "./components/foreground"

//high level game logic
export class Game {
  background: Background
  foreground: Foreground
  constructor() {
    //initialize components
    this.background = new Background()
    this.foreground = new Foreground()

    //save component references
    components.game = this
    components.background = this.background
    components.foreground = this.foreground

    //add to root container
    components.layout.addChild(this.background, this.foreground)

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

    components.invaders.x = stageWidth / 2 - components.invaders.width / 2
    components.invaders.y = stageHeight * 0.15

    state.setLivesCounter(3)
    components.player.slideIn()
    await components.foreground.showStartText()

    components.player.start()

    while (state.livesCounter > 0) {

      if(!state.playerAlive){
        components.player = new Player()
        await components.player.slideIn()
        components.player.start()
       }
      
      state.setInvadersActive(true)
 
      //start playing
      components.invaders.startMove()
  
      components.invaders.startShooting()

      //wait until player dies or all enemies are destroyed
      await this.levelPlayingStopped()

      //check if level is completed
      // if yes setup next level
    }

    //show game over message
    

    console.log("finished")
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
