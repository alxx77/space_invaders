import { Sprite, Texture, utils } from "pixi.js"
import { SmartContainer } from "./smartContainer"
import { components, state } from "../state"
import { Howl } from "howler"
import { projectileSpeed, soundSource } from "../settings"

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
      this.sprite = new Sprite(utils.TextureCache[`axes_${this.itemType}`])
      this.sprite.scale.set(1.5)
    }

    if (itemType === 10) {
      this.sprite = new Sprite(utils.TextureCache[`bonus_shield`])
      this.sprite.scale.set(0.8)
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
      //do not take weapon no.1 if there is already stronger weapon
      if (this.itemType === 1 && components.player.bonusItemsList.includes(2))
        return
      if (this.itemType === 1 && components.player.bonusItemsList.includes(1))
        return
      if (!components.player.bonusItemsList.includes(this.itemType)) {
        this.stopTween()
        components.player.addBonusItem(this.itemType)
        this.bonusCollectedSound.play()
        this.collected = true
        this.destroy()
      }
    }
  }

  updateLayout(width: number, height: number) {}
}
