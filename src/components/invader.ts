import { Container, Sprite, utils } from "pixi.js"
import { components, state } from "../state"
import { SmartContainer } from "./smartContainer"
import { InvaderProjectile } from "./invaderProjectile"
import { invaderWidth, invaderProjectileSpeed, stageHeight } from "../settings"

//root container
export class Invader extends SmartContainer {
  sprite: Sprite
  constructor(position: { x: number; y: number }, variety: number) {
    super()
    this.sprite = new Sprite(utils.TextureCache["invader" + variety])
    this.addChild(this.sprite)
    this.x = position.x
    this.y = position.y
  }

  shoot() {
    let gp = this.getAbsolutePosition(this)
    const projectile = new InvaderProjectile(
      {
        x: gp.x + invaderWidth / 2,
        y: gp.y * 1.05,
      },
      invaderProjectileSpeed
    )
    components.foreground.container.addChild(projectile)
    state.addInvaderProjectile(projectile)
    projectile.moveTo(
      projectile.x,
      stageHeight + 50,
      projectile.speed,
      ()=>{
        const i = state.invaderProjectiles.findIndex(
          (el) => el === projectile
        )
        state.removeInvaderProjectile(i)
        projectile.destroy()
      }
    )
  }

  getAbsolutePosition(container: Container) {
    let absoluteX = container.x
    let absoluteY = container.y

    let currentContainer = container

    while (currentContainer.parent ) {
      currentContainer = currentContainer.parent
      absoluteX += currentContainer.x
      absoluteY += currentContainer.y
      if(currentContainer.name === 'foreground') break
    }

    return { x: absoluteX, y: absoluteY }
  }

  updateLayout(width: number, height: number) {}
}
