import {
  AnimatedSprite,
  Assets,
  Resource,
  Sprite,
  Texture,
  utils,
} from "pixi.js"
import { components, state } from "../state"
import { SmartContainer } from "./smartContainer"
import { Howl } from "howler"
import { soundSource } from "../settings"
import { InvaderProjectile } from "./invaderProjectile"
import { getRandomNumber, getRandomWebColor } from "../utils"

//root container
export class Projectile extends SmartContainer {
  private sprite: Sprite
  explosionSprite: AnimatedSprite
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
  projectileDestroyed = false
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

    const sheet = Assets.cache.get("invader_explosion")
    const textures: Texture<Resource>[] = Object.values(sheet.textures)
    this.explosionSprite = new AnimatedSprite(textures)
    this.explosionSprite.visible = false
    this.explosionSprite.loop = false

    this.explosionSprite.x = this.width / 2
    this.explosionSprite.y = this.height / 2
    this.explosionSprite.anchor.set(0.5)
    this.explosionSprite.animationSpeed = 0.5

    this.addChild(this.explosionSprite)

    this.cbOnTweenUpdate = this.collisionTestWithInvadersAndInvadersProjectiles

    if (emitSound) {
      Projectile.shootSound.play()
    }

    this.createdAt = Date.now()
  }

  rotate(deg: number) {
    this.sprite.angle = deg
  }

  async playExplosion(cb: Function | undefined, projectile?: Projectile ) {
    this.explosionSprite.visible = true
    this.explosionSprite.tint = getRandomWebColor()
    this.explosionSprite.play()
    this.explosionSprite.onComplete = () => {
      if (cb) cb(projectile)
    }
  }

  static removeProjectile(projectile: Projectile) {
    const i = state.projectiles.findIndex((el) => el === projectile)
    state.removeProjectile(i)
    projectile.stopTween()
    projectile.destroy()
  }

  collisionTestWithInvadersAndInvadersProjectiles() {
    if (this.destroyed || this.projectileDestroyed) return
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
          state.setInvaderDestroyed(
            invader.constructor.name === "SoloInvader" ? "S" : "I"
          )
        }

        //if not indestructible projectile is immediately destroyed
        if (!this.indestructible) {
          this.projectileDestroyed = true
          this.stopTween()
          this.playExplosion(Projectile.removeProjectile, this)
          return
        } else {
          this.playExplosion(undefined)
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
          this.projectileDestroyed = true
          this.stopTween()
          this.playExplosion(Projectile.removeProjectile, this)
          return
        } else {
          this.playExplosion(undefined)
        }
      }
    }
  }
}
