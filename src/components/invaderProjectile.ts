import {
  AnimatedSprite,
  Assets,
  Resource,
  Sprite,
  Texture,
  utils,
} from "pixi.js"
import { SmartContainer } from "./smartContainer"
import { components, state } from "../state"
import { Howl } from "howler"
import { projectileSpeed, soundSource } from "../settings"
import { getRandomWebColor } from "../utils"
import Timeout from "smart-timeout"

export class InvaderProjectile extends SmartContainer {
  sprite: Sprite
  speed: number
  shootSound: Howl
  explosionSound: Howl
  red: boolean
  explosionSprite: AnimatedSprite
  damage: number
  maxDamage:number
  scaleFactor: number
  static projectileCount: number
  constructor(position: { x: number; y: number }, speed: number) {
    super()
    this.maxDamage = 2
    this.red = false
    let texture = utils.TextureCache["invader_projectile"]

    if (InvaderProjectile.projectileCount % 3 === 0) {
      texture = utils.TextureCache["invader_projectile_red"]
      this.red = true
      this.maxDamage = 3
    }

    InvaderProjectile.projectileCount++
    
    this.damage = 0

    this.scaleFactor = 2

    this.sprite = new Sprite(texture)
    this.scale.set(this.scaleFactor)
    this.addChild(this.sprite)
    this.speed = speed
    this.x = position.x
    this.y = position.y
    this.cbOnTweenUpdate = this.collisionTestPlayerWithInvaderProjectile

    const sheet = Assets.cache.get("invader_explosion")
    const textures: Texture<Resource>[] = Object.values(sheet.textures)
    this.explosionSprite = new AnimatedSprite(textures)
    this.explosionSprite.visible = false
    this.explosionSprite.loop = false
    this.explosionSprite.scale.set(this.scaleFactor / 3)
    this.explosionSprite.x = this.width / 2 / this.scaleFactor
    this.explosionSprite.y = this.height / 2 / this.scaleFactor
    this.explosionSprite.anchor.set(0.5)
    this.explosionSprite.animationSpeed = 0.2
    this.addChild(this.explosionSprite)

    this.shootSound = new Howl({
      src: [soundSource.invaderProjectile],
      volume: 0.5,
      loop: false,
    })
    this.shootSound.volume(0.1 + Math.random() * 0.1)

    this.explosionSound = new Howl({
      src: [soundSource.invaderExplosion],
      volume: 0.1,
      loop: false,
    })
  }

  static removeProjectile(projectile: InvaderProjectile) {
    const i = state.invaderProjectiles.findIndex((el) => el === projectile)
    state.removeInvaderProjectile(i)
    projectile.sprite.visible = false
    projectile.explosionSprite.visible = true
    projectile.explosionSprite.tint = getRandomWebColor()
    projectile.explosionSprite.play()
    projectile.explosionSound.play()
    projectile.explosionSprite.onComplete = () => {
      projectile.stopTween()
      projectile.destroy()
    }
  }

  blink() {
    this.sprite.tint = "#771111"
    Timeout.instantiate(() => {
        this.sprite.tint = "#FFFFFF"
      },
      50
    )
  }

  takeHit() {
    this.damage++
    this.blink()
  }

  isTotallyDamaged() {
    return this.damage >= this.maxDamage
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
        state.setPlayerAlive(false)
        state.setInvadersActive(false)
        InvaderProjectile.removeProjectile(this)
        return
      }
    }
  }

  updateLayout(width: number, height: number) {}
}
