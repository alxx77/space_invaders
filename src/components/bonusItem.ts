import { Sprite, Texture, utils } from "pixi.js"
import { SmartContainer } from "./smartContainer"
import { components, state } from "../state"
import { Howl } from "howler"
import { playerFireControl, projectileSpeed, soundSource } from "../settings"

export class BonusItem extends SmartContainer {
  sprite: Sprite
  speed: number
  bonusCreatedSound: Howl
  bonusCollectedSound: Howl
  itemType: number
  collected: boolean
  constructor(
    position: { x: number; y: number },
    speed: number,
    itemType: number
  ) {
    super()
    this.itemType = itemType
    this.collected = false
    //to avoid TS compiler :-D
    this.sprite = new Sprite()

    if (itemType >= 1 && itemType <= 10) {
      this.sprite = new Sprite(utils.TextureCache[`axes_1`])
      this.sprite.scale.set(1.5)
    }

    //shield
    if (itemType === 11) {
      this.sprite = new Sprite(utils.TextureCache[`shield`])
      this.sprite.scale.set(0.9)
    }

    if (itemType === 15) {
      this.sprite = new Sprite(utils.TextureCache[`bonus_health`])
      this.sprite.scale.set(0.9)
    }

    //rapid fire stage 1
    if (itemType === 20) {
      this.sprite = new Sprite(utils.TextureCache[`bonus_weapon_upgrade`])
      this.sprite.scale.set(0.9)
    }

    //rapid fire stage 2
    if (itemType === 21) {
      this.sprite = new Sprite(utils.TextureCache[`bonus_weapon_upgrade`])
      this.sprite.scale.set(0.9)
    }

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
      // Collision detected
      if (this.itemType >= 1 && this.itemType <= 10) {
        if (components.player.weapon < 3) {
          components.player.weapon++
        }
      }

      if (this.itemType === 11 && !components.player.shieldEngaged) {
        components.player.powerUpShield()
      }

      if (this.itemType === 15) {
        components.player.resetDamage()
      }

      if (this.itemType === 20) {
        components.player.setFireControlParams(
          playerFireControl.fireRate1.autofireInterval,
          playerFireControl.fireRate1.maxPlayerProjectilesFiredPerSecond
        )
      }

      if (this.itemType === 21) {
        components.player.setFireControlParams(
          playerFireControl.fireRate2.autofireInterval,
          playerFireControl.fireRate2.maxPlayerProjectilesFiredPerSecond
        )
      }

      this.stopTween()
      this.bonusCollectedSound.play()
      this.collected = true
      this.destroy()
    }
  }

  updateLayout(width: number, height: number) {}
}
