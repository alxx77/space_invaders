import { reaction } from "mobx"
import { components, state } from "./state"
import { Player } from "./components/player"
import { Background } from "./components/background"
import { Projectile } from "./components/projectile"
import { projectileSpeed } from "./settings"

//high level game logic
export class Game {
  player: Player
  background: Background
  constructor() {
    //initialize components

    this.background = new Background()
    this.player = new Player()
    
    //save component references
    components.game = this
    components.background = this.background
    components.player = this.player
    const componentList: any = [this.background, this.player]

    //add to root container
    components.layout.addChild(...componentList)

    this.player.x = components.background.width/2 - this.player.width/2
    this.player.y = components.background.height *0.85

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

    this.player.updatePosition()

    reaction(
      () => state.SpaceBar_keyPressed,
      (newVal, oldVal) => {
        if (newVal === true && oldVal === false) {
          const position = components.player.getGlobalPosition()
          const projectile = new Projectile(
            { x: position.x + components.player.width / 2, y: position.y * 0.95 },
            projectileSpeed * components.background.scale.x
          )
          projectile.scale.x = components.background.scale.x
          projectile.scale.y = components.background.scale.y

          components.layout.addChild(projectile)
          state.projectiles.push(projectile)
          projectile.moveTo(position.x, -50, projectile.speed, () => {
            const i = state.projectiles.findIndex((el) => el === projectile)
            state.projectiles.splice(i, 1)
            projectile.destroy()
          })
        }
      }
    )
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
