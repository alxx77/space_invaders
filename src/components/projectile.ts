import { Sprite, utils } from "pixi.js"
import { components, state } from "../state"
import { SmartContainer } from "./smartContainer"
import { Howl } from "howler"
import { soundSource } from "../settings"
import { InvaderProjectile } from "./invaderProjectile"

//root container
export class Projectile extends SmartContainer {
  sprite: Sprite
  speed: number
  shootSound: Howl
  projectileType: number
  constructor(position: { x: number; y: number }, speed: number, type: number) {
    super()
    this.projectileType = type
    this.sprite = new Sprite(
      utils.TextureCache[`projectile_${this.projectileType}`]
    )
    this.sprite.scale.set(1.5)
    this.addChild(this.sprite)
    this.speed = speed
    this.x = position.x
    this.y = position.y

    this.cbOnTweenUpdate = this.collisionTestWithInvadersAndInvadersProjectiles

    this.shootSound = new Howl({
      src: [soundSource.playerProjectile],
      volume: 0.5,
      loop: false,
    })
    this.shootSound.volume(0.2 + Math.random() * 0.4)
    this.shootSound.play()
  }

  collisionTestWithInvadersAndInvadersProjectiles(c: SmartContainer) {
    const bounds1 = this.sprite.getBounds()
    //colision with invaders
    for (const invader of state.invaders) {
      const bounds2 = invader.sprite.getBounds()
      // Check for collision using bounds
      if (
        bounds1.x < bounds2.x + bounds2.width &&
        bounds1.x + bounds1.width > bounds2.x &&
        bounds1.y < bounds2.y + bounds2.height &&
        bounds1.y + bounds1.height > bounds2.y
      ) {
        // Collision detected
        invader.takeHit()
        if (invader.isTotallyDamaged()) {
          components.invaders.removeInvader(invader)
          state.triggerInvaderDestroyed()
        }
        //projectile is immediately destroyed
        const i = state.projectiles.findIndex((el) => el === this)
        state.removeProjectile(i)
        c.stopTween()
        this.destroy()
        return
      }
    }

    //collision with invader projectiles
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
        //damage invader projectile
        invaderProjectile.takeHit()
        if (invaderProjectile.isTotallyDamaged()) {
          //remove invader projectile
          InvaderProjectile.removeProjectile(invaderProjectile)
        }

        //remove players projectile immediately
        const i = state.projectiles.findIndex((el) => el === this)
        state.removeProjectile(i)
        c.stopTween()
        this.destroy()
      }
    }
  }

  updateLayout(width: number, height: number) {
    //this.speed = projectileSpeed * components.background.scale.x
  }
}
