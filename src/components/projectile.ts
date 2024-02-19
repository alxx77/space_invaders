import { Sprite, utils } from "pixi.js"
import { components, state } from "../state"
import { SmartContainer } from "./smartContainer"
import { Howl } from "howler"
import { soundSource } from "../settings"
import { InvaderProjectile } from "./invaderProjectile"
import { getRandomNumber } from "../utils"

//root container
export class Projectile extends SmartContainer {
  private sprite: Sprite
  speed: number
  static shootSound: Howl
  static {
    this.shootSound = new Howl({
      src: [soundSource.playerProjectile],
      volume: 0.5,
      loop: false,
      onplay: () => this.shootSound.volume(0.2 + getRandomNumber() * 0.4),
    })
  }
  private projectileType: number
  indestructible = false
  lethality = 1
  //creation timestamp
  createdAt: number
  constructor(
    position: { x: number; y: number },
    speed: number,
    type: number,
    emitSound: boolean
  ) {
    super()
    this.projectileType = type
    this.sprite = new Sprite(
      utils.TextureCache[`projectile_${this.projectileType}`]
    )
    this.sprite.scale.set(1.5)

    if (type === 3) {
      this.sprite.scale.set(0.75)
    }

    this.sprite.anchor.set(0.5)
    this.addChild(this.sprite)
    this.speed = speed
    this.x = position.x
    this.y = position.y

    this.cbOnTweenUpdate = this.collisionTestWithInvadersAndInvadersProjectiles

    if (emitSound) {
      Projectile.shootSound.play()
    }

    this.createdAt = Date.now()
  }

  rotate(deg: number) {
    this.sprite.angle = deg
  }

  collisionTestWithInvadersAndInvadersProjectiles(
    c: SmartContainer,
    elapsed: number
  ) {
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
        invader.takeHit(this.lethality)
        if (invader.isTotallyDamaged()) {
          components.invaders.removeInvader(invader)
          invader.awardBonus()
          state.setInvaderDestroyed(invader.constructor.name === "SoloInvader" ? 'S' : 'I')
        }
        //if not indestructible projectile is immediately destroyed
        if (!this.indestructible) {
          const i = state.projectiles.findIndex((el) => el === this)
          state.removeProjectile(i)
          c.stopTween()
          this.destroy()
          return
        }
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
        invaderProjectile.takeHit(this.lethality)
        if (invaderProjectile.isTotallyDamaged()) {
          //remove invader projectile
          InvaderProjectile.removeProjectile(invaderProjectile)
        }

        //if not indestructible projectile is immediately destroyed
        if (!this.indestructible) {
          const i = state.projectiles.findIndex((el) => el === this)
          state.removeProjectile(i)
          c.stopTween()
          this.destroy()
          return
        }
      }
    }
  }
}
