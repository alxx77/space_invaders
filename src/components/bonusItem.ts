import { Sprite, utils } from "pixi.js"
import { SmartContainer } from "./smartContainer"
import { components, state } from "../state"
import { Howl } from "howler"
import { soundSource } from "../settings"

export class BonusItem extends SmartContainer {
  private sprite: Sprite
  private speed: number
  static bonusCreatedSound: Howl
  private static bonusCollectedSound: Howl
  static {
    this.bonusCollectedSound = new Howl({
      src: [soundSource.bonusCollected],
      volume: 0.12,
      loop: false,
    })

    this.bonusCreatedSound = new Howl({
      src: [soundSource.bonusCreated],
      volume: 0.175,
      loop: false,
    })
  }
  private itemType: number
  collected: boolean
  constructor(
    position: { x: number; y: number },
    speed: number,
    itemType: number
  ) {
    super()
    this.itemType = itemType
    this.collected = false
    //to please TS compiler :-D
    this.sprite = new Sprite()

    if (itemType >= 1 && itemType <= 10) {
      this.sprite = new Sprite(utils.TextureCache[`axes_1`])
      this.sprite.scale.set(1.5)
    }

    //shield
    if (itemType === 11) {
      this.sprite = new Sprite(utils.TextureCache[`shield`])
      this.sprite.scale.set(1)
    }

    if (itemType === 15) {
      this.sprite = new Sprite(utils.TextureCache[`bonus_health`])
      this.sprite.scale.set(1)
    }

    //rapid fire stage 1
    if (itemType === 20) {
      this.sprite = new Sprite(utils.TextureCache[`bonus_weapon_upgrade`])
      this.sprite.scale.set(1)
    }

    //rapid fire stage 2
    if (itemType === 21) {
      this.sprite = new Sprite(utils.TextureCache[`bonus_weapon_upgrade`])
      this.sprite.scale.set(1)
    }

    //cannonball
    if (itemType === 22) {
      this.sprite = new Sprite(utils.TextureCache[`bonus_weapon_upgrade2`])
      this.sprite.scale.set(1)
    }

    this.addChild(this.sprite)
    this.speed = speed
    this.x = position.x
    this.y = position.y
    this.cbOnTweenUpdate = this.collisionTestPlayerWithBonusWeapon
  }

  //overload
  async moveTo(xPos: number, yPos: number, speed?: number, onEnd?: Function) {
    super.moveTo(xPos, yPos, this.speed, onEnd)
  }

  collisionTestPlayerWithBonusWeapon() {
    if (!state.playerAlive || this.destroyed) return

    const bounds1 = components.player.sprite.getBounds()
    const bounds2 = this.sprite.getBounds()

    const collided =
      bounds1.x < bounds2.x + bounds2.width &&
      bounds1.x + bounds1.width > bounds2.x &&
      bounds1.y < bounds2.y + bounds2.height &&
      bounds1.y + bounds1.height > bounds2.y

    //if no collision exit early
    if (!collided) return

    if (
      this.itemType >= 1 &&
      this.itemType <= 10 &&
      components.player.weapon < 3
    ) {
      components.player.incrementWeaponType()
      this.collected = true
    }

    if (this.itemType === 11 && !components.player.shieldEngaged) {
      components.player.powerUpShield()
      this.collected = true
    }

    if (this.itemType === 15 && components.player.getHealthPercentage() < 100) {
      components.player.resetDamage()
      this.collected = true
    }

    if (this.itemType === 20) {
      components.player.engageFireRateBonus(1)
      this.collected = true
    }

    if (this.itemType === 21) {
      components.player.engageFireRateBonus(2)
      this.collected = true
    }

    if (this.itemType === 22 && !components.player.cannonballBonusOn) {
      components.player.engageCannonballBonus()
      this.collected = true
    }

    if (this.collected) {
      this.stopTween()
      BonusItem.bonusCollectedSound.play()
      this.destroy()
    }
  }

  updateLayout(width: number, height: number) {}
}
