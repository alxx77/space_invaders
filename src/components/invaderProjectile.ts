import { Sprite, utils } from "pixi.js"
import { SmartContainer } from "./smartContainer"
import { components, state } from "../state"

//root container
export class InvaderProjectile extends SmartContainer {
  sprite: Sprite
  speed: number
  constructor(position: { x: number; y: number }, speed: number) {
    super()
    this.sprite = new Sprite(utils.TextureCache["invader_projectile"])
    this.addChild(this.sprite)
    this.speed = speed
    this.x = position.x
    this.y = position.y
    this.cbOnTweenUpdate = this.collisionTestPlayerWithInvaderProjectile
  }

  collisionTestPlayerWithInvaderProjectile(c: SmartContainer) {
    if (!state.playerAlive) return
    const bounds1 = components.player.getBounds()
    for (const invaderProjectile of state.invaderProjectiles) {
      const bounds2 = invaderProjectile.sprite.getBounds()
      // Check for collision using bounds
      if (
        bounds1.x < bounds2.x + bounds2.width &&
        bounds1.x + bounds1.width > bounds2.x &&
        bounds1.y < bounds2.y + bounds2.height &&
        bounds1.y + bounds1.height > bounds2.y
      ) {
        // Collision detected
        c.stopTween()
        state.setInvadersActive(false)
        state.setPlayerAlive(false)
        const i = state.invaderProjectiles.findIndex(
          (el) => el === invaderProjectile
        )
        state.removeInvaderProjectile(i)
        invaderProjectile.visible = false
        return
      }
    }
  }

  updateLayout(width: number, height: number) {}
}
