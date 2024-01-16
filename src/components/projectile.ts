import { Point, Sprite, utils } from "pixi.js"
import { components, state } from "../state"
import { SmartContainer } from "./smartContainer"
import { projectileSpeed } from "../settings"

//root container
export class Projectile extends SmartContainer {
  sprite: Sprite
  speed: number
  constructor(position: { x: number; y: number }, speed: number) {
    super()
    this.sprite = new Sprite(utils.TextureCache["projectile"])
    this.addChild(this.sprite)
    this.speed = speed
    this.x = position.x
    this.y = position.y

    this.cbOnTweenUpdate = this.collisionTest
  }

  collisionTest(c: SmartContainer) {
    for (const invader of state.invaders) {
      const bounds1 = this.sprite.getBounds()
      const bounds2 = invader.sprite.getBounds()
      // Check for collision using bounds
      if (
        bounds1.x < bounds2.x + bounds2.width &&
        bounds1.x + bounds1.width > bounds2.x &&
        bounds1.y < bounds2.y + bounds2.height &&
        bounds1.y + bounds1.height > bounds2.y
      ) {
        // Collision detected
        components.invaders.removeInvader(invader)
        const i = state.projectiles.findIndex((el) => el === this)
        state.removeProjectile(i)
        c.stopTween()
        this.destroy()
      }
    }
  }

  updateLayout(width: number, height: number) {
    this.speed = projectileSpeed * components.background.scale.x
  }
}
