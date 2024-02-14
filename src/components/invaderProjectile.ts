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
import { soundSource } from "../settings"
import { changeSpriteTint, getRandomNumber, getRandomWebColor } from "../utils"
import Timeout from "smart-timeout"

export class InvaderProjectile extends SmartContainer {
  sprite: Sprite
  speed: number
  shootSound: Howl
  explosionSound: Howl
  explosionSprite: AnimatedSprite
  damage: number
  //how much damage can sustain
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
  lethalFactor: number
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

    texture = utils.TextureCache[`invader_projectile_${this.type}`]

    this.damage = 0

    this.scaleFactor = 2

    if (this.type === 2) {
      this.scaleFactor = 0.75
    }

    this.sprite = new Sprite(texture)
    this.sprite.anchor.set(0.5)
    this.scale.set(this.scaleFactor)

    this.x = position.x
    this.y = position.y
    this.cbOnTweenUpdate = this.collisionTestWithPlayer

    const sheet = Assets.cache.get("invader_explosion")
    const textures: Texture<Resource>[] = Object.values(sheet.textures)
    this.explosionSprite = new AnimatedSprite(textures)
    this.explosionSprite.visible = false
    this.explosionSprite.loop = false

    this.explosionSprite.x = this.width / 2 / this.scaleFactor
    this.explosionSprite.y = this.height / 2 / this.scaleFactor
    this.explosionSprite.anchor.set(0.5)
    this.explosionSprite.animationSpeed = 0.2

    switch (type) {
      case 0:
        //regular
        this.maxDamage = 1
        this.speed = speed + getRandomNumber()
        this.lethalFactor = 1
        this.explosionSprite.scale.set(this.scaleFactor * 0.3)
        break
      case 1:
        //red bomb
        this.maxDamage = 3
        this.speed = (speed + getRandomNumber()) * 2
        this.lethalFactor = 3
        this.explosionSprite.scale.set(this.scaleFactor * 0.8)
        break
      case 2:
        //solo shot
        this.maxDamage = 0.5 + getRandomNumber()
        this.speed = (speed + getRandomNumber()) * 1.5
        this.lethalFactor = 2
        this.explosionSprite.scale.set(
          this.scaleFactor * (2.5 + getRandomNumber() * 0.5)
        )
        break
      default:
        break
    }

    this.addChild(this.sprite)
    this.addChild(this.explosionSprite)

    this.shootSound = new Howl({
      src: [soundSource.invaderProjectile],
      volume: 0.5,
      loop: false,
    })
    this.shootSound.volume(0.1 + getRandomNumber() * 0.1)

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
        Timeout.instantiate(() => resolve(), getRandomNumber() * 450)
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
    await changeSpriteTint("#FFFFFF", 50, this.sprite)
    await changeSpriteTint("#771111", 50, this.sprite)
    await changeSpriteTint("#FFFFFF", 50, this.sprite)
  }

  takeHit(h: number) {
    this.damage += h
    this.lethalFactor -= 0.75
    if (this.lethalFactor < 0) this.lethalFactor = 0
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

  collisionTestWithPlayer(c: SmartContainer, elapsed: number) {
    this.onTweenUpdate(elapsed)
    if (!state.playerAlive) return
    const bPl = components.player.sprite.getBounds()

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

    //if no collision exit
    if (!(collisionA || (collisionB && this.detonationStatus === 1))) return

    //check if projectile is "live"
    //if yes do damage, otherwise not
    if (this.detonationStatus === 0) {
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
