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
  explosionSprite: AnimatedSprite
  damage: number
  maxDamage: number
  scaleFactor: number
  type: number
  detonationTime: number
  detonationStatus: number
  static projectileCount: number
  static projectileCompleted: number
  static projectileMiss: number
  static projectileHit: number
  serialNo: number
  //how much damage it causes to player when hits it
  lethalFactor:number
  constructor(position: { x: number; y: number }, speed: number, type: number) {
    super()

    this.maxDamage = 1
    this.type = type
    let texture = utils.TextureCache["invader_projectile_0"]
    this.speed = 1
    this.detonationTime = Math.max(Math.random(), 0.2)
    this.detonationStatus = 0
    this.serialNo = InvaderProjectile.projectileCount++
    this.lethalFactor = 0

    switch (type) {
      case 0:
        this.maxDamage = 1
        this.speed = speed + Math.random()
        this.lethalFactor = 1
        break
      case 1:
        this.maxDamage = 3
        this.speed = (speed + Math.random()) * 2
        this.lethalFactor = 3
        break
      default:
        break
    }

    texture = utils.TextureCache[`invader_projectile_${this.type}`]

    this.damage = 0

    this.scaleFactor = 2

    this.sprite = new Sprite(texture)
    this.scale.set(this.scaleFactor)
    this.addChild(this.sprite)
    this.x = position.x
    this.y = position.y
    this.cbOnTweenUpdate = this.collisionTestPlayerWithInvaderProjectile

    const sheet = Assets.cache.get("invader_explosion")
    const textures: Texture<Resource>[] = Object.values(sheet.textures)
    this.explosionSprite = new AnimatedSprite(textures)
    this.explosionSprite.visible = false
    this.explosionSprite.loop = false
    this.explosionSprite.scale.set(
      this.scaleFactor * (this.type === 1 ? 0.8 : 0.3)
    )
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

  static async removeProjectile(
    projectile: InvaderProjectile,
    playSound = true,
    randomDelay = false
  ) {
    const i = state.invaderProjectiles.findIndex((el) => el === projectile)
    if (i === -1) return
    state.removeInvaderProjectile(i)

    if (randomDelay) {
      await new Promise<void>((resolve) => {
        Timeout.instantiate(() => resolve(), Math.random() * 450)
      })
    }

    //detonation started
    projectile.detonationStatus = 1
    projectile.sprite.visible = false
    projectile.explosionSprite.visible = true
    projectile.explosionSprite.tint = getRandomWebColor()
    projectile.explosionSprite.play()
    if (playSound) projectile.explosionSound.play()
    return new Promise<void>((resolve) => {
      projectile.explosionSprite.onComplete = () => {
        projectile.stopTween()
        projectile.visible = false
        projectile.destroy()

        //detonation ended
        projectile.detonationStatus = 2
        resolve()
      }
    })
  }

  async blink() {
    this.sprite.tint = "#771111"
    await new Promise<void>((resolve) => {
      Timeout.instantiate(() => {
        this.sprite.tint = "#FFFFFF"
        resolve()
      }, 50)
    })

    await new Promise<void>((resolve) => {
      Timeout.instantiate(() => {
        this.sprite.tint = "#771111"
        resolve()
      }, 50)
    })

    await new Promise<void>((resolve) => {
      Timeout.instantiate(() => {
        this.sprite.tint = "#FFFFFF"
        resolve()
      }, 50)
    })
  }

  takeHit() {
    this.damage++
    this.blink()
  }

  isTotallyDamaged() {
    return this.damage >= this.maxDamage
  }

  onTweenUpdate(elapsed: number) {
    if (
      this.type === 1 &&
      this.detonationStatus === 0 &&
      elapsed > this.detonationTime
    ) {
      InvaderProjectile.removeProjectile(this)
      InvaderProjectile.projectileMiss++
    }
  }

  collisionTestPlayerWithInvaderProjectile(c: SmartContainer, elapsed: number) {
    this.onTweenUpdate(elapsed)
    if (!state.playerAlive) return
    const bPl = components.player.getBounds()

    const bSpr = this.sprite.getBounds()
    const bExp = this.explosionSprite.getBounds()

    let collisionA = false
    let collisionB = false

    //collision with projectile itself
    collisionA =
      bPl.x < bSpr.x + bSpr.width &&
      bPl.x + bPl.width > bSpr.x &&
      bPl.y < bSpr.y + bSpr.height &&
      bPl.y + bPl.height > bSpr.y

    //colision with explosion from the projectile
    collisionB =
      bPl.x < bExp.x + bExp.width &&
      bPl.x + bPl.width > bExp.x &&
      bPl.y < bExp.y + bExp.height &&
      bPl.y + bPl.height > bExp.y

    if (collisionA || (collisionB && this.detonationStatus === 1)) {
      // Collision detected

      //check if projectile is "live"
      //if yes do damage, otherwise not
      if(this.detonationStatus === 0){
        components.player.takeHitFromProjectile(this)
        InvaderProjectile.removeProjectile(this)
        InvaderProjectile.projectileHit++
        if (components.player.isTotallyDamaged()) {
          state.setPlayerAlive(false)
          state.setInvadersActive(false)
        }
      }
    }
  }

  updateLayout(width: number, height: number) {}
}
