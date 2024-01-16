import { reaction, autorun } from "mobx"
import { components, state } from "./state"
import { Player } from "./components/player"
import { Background } from "./components/background"
import { Projectile } from "./components/projectile"
import { projectileSpeed } from "./settings"
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
    components.layout.addChild(this.background,this.foreground)

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
          state.set_A_keyPressed(true)
          state.setLastKeyPressed("A")
          break

        case "S":
        case "s":
          state.set_S_keyPressed(true)
          state.setLastKeyPressed("S")
          break

        case "D":
        case "d":
          state.set_D_keyPressed(true)
          state.setLastKeyPressed("D")
          break

        case "W":
        case "w":
          state.set_W_keyPressed(true)
          state.setLastKeyPressed("W")
          break

        case " ":
          state.set_SpaceBar_keyPressed(true)
          break

        default:
          break
      }
    })

    window.addEventListener("keyup", function (event) {
      switch (event.key) {
        case "A":
        case "a":
          state.set_A_keyPressed(false)
          break

        case "S":
        case "s":
          state.set_S_keyPressed(false)
          break

        case "D":
        case "d":
          state.set_D_keyPressed(false)
          break

        case "W":
        case "w":
          state.set_W_keyPressed(false)
          break

        case " ":
          state.set_SpaceBar_keyPressed(false)
          break

        default:
          break
      }
    })

    this.updateView()
  }

  async play() {
    for (const level of [1]) {
      await this.playLevel()
    }
  }

  async playLevel() {
    const player = new Player()

    components.player = player
    components.layout.addChild(player)

    const invaders = new Invaders()
    components.invaders = invaders
    invaders.createInvaders()
    components.layout.addChild(components.invaders)

    this.updateView()

    player.x = components.background.width / 2 - player.width / 2
    player.y = components.background.height * 0.85


    invaders.x = components.background.width / 2 - invaders.width / 2
    invaders.y = components.background.height * 0.15

    invaders.startMove()

    player.start()

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
