import { Sprite, Texture, utils } from "pixi.js"
import { SmartContainer } from "./smartContainer"
import { components, state } from "../state"
import { Howl } from "howler"
import { projectileSpeed, soundSource } from "../settings"

export class BonusWeapon extends SmartContainer {
  sprite: Sprite
  speed: number
  bonusCreatedSound: Howl
  bonusCollectedSound: Howl
  weaponType: number
  collected: boolean
  constructor(
    position: { x: number; y: number },
    speed: number,
    weaponType: number
  ) {
    super()
    this.weaponType = weaponType
    this.collected = false

    this.sprite = new Sprite( utils.TextureCache[`axes_${this.weaponType}`])
    this.sprite.scale.set(1.5)
    this.addChild(this.sprite)
    this.speed = speed
    this.x = position.x
    this.y = position.y
    this.cbOnTweenUpdate = this.collisionTestPlayerWithBonusWeapon

    this.bonusCollectedSound = new Howl({
      src: [soundSource.bonusCollected],
      volume: 0.5,
      loop: false,
    })

    this.bonusCreatedSound = new Howl({
      src: [soundSource.bonusCreated],
      volume: 0.5,
      loop: false,
    })
  }

  collisionTestPlayerWithBonusWeapon(c: SmartContainer) {
    //console.log(this.x,this.y)
    if (!state.playerAlive) return
    const bounds1 = components.player.sprite.getBounds()

    const bounds2 = this.sprite.getBounds()
    // Check for collision using bounds
    if (
      bounds1.x < bounds2.x + bounds2.width &&
      bounds1.x + bounds1.width > bounds2.x &&
      bounds1.y < bounds2.y + bounds2.height &&
      bounds1.y + bounds1.height > bounds2.y
    ) {
      // Collision detected - player uses bonus weapon
      if (components.player.weaponType < this.weaponType) {
        this.stopTween()
        components.player.weaponType = this.weaponType
        this.bonusCollectedSound.play()
        this.collected = true
        this.destroy()
      }
    }
  }

  updateLayout(width: number, height: number) {}
}