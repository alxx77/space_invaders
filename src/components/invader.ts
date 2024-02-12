import {
  AnimatedSprite,
  Assets,
  Container,
  Resource,
  Sprite,
  Texture,
  utils,
} from "pixi.js"
import { components, state } from "../state"
import { SmartContainer } from "./smartContainer"
import { InvaderProjectile } from "./invaderProjectile"
import {
  invaderWidth,
  invaderProjectileSpeed,
  stageHeight,
  soundSource,
  invaderScaleFactor,
} from "../settings"
import { Howl } from "howler"
import { BonusItem } from "./bonusItem"
import Timeout from "smart-timeout"
import { getRandomNumber } from "../utils"

//root container
export class Invader extends SmartContainer {
  sprite: Sprite
  explosionSprite: AnimatedSprite
  explosionSound: Howl
  private variety: number
  private damage: number
  private maxDamage: number = 1
  constructor(position: { x: number; y: number }, variety: number) {
    super()
    this.variety = variety

    switch (variety) {
      case 1:
      case 2:
      case 3:
        this.maxDamage = 1
        break
      case 4:
        this.maxDamage = 2
        break
      case 5:
        this.maxDamage = 3
        break
      case 6:
        this.maxDamage = 5
        break
      case 7:
        this.maxDamage = 10
        break

      default:
        break
    }

    this.damage = 0

    this.sprite = new Sprite(utils.TextureCache["invader" + variety])
    this.sprite.scale.set(invaderScaleFactor)
    this.addChild(this.sprite)
    this.x = position.x
    this.y = position.y

    const sheet = Assets.cache.get("invader_explosion")
    const textures: Texture<Resource>[] = Object.values(sheet.textures)
    this.explosionSprite = new AnimatedSprite(textures)
    this.explosionSprite.visible = false
    this.explosionSprite.loop = false
    this.explosionSprite.onComplete = () => {
      this.explosionSprite.visible = false
    }
    this.explosionSprite.x = this.width / 2
    this.explosionSprite.y = this.height / 2
    this.explosionSprite.scale.set(0.9)
    this.explosionSprite.anchor.set(0.5)
    this.explosionSprite.animationSpeed = 0.3
    this.addChild(this.explosionSprite)

    this.explosionSound = new Howl({
      src: [soundSource.invaderExplosion],
      volume: 0.5,
      loop: false,
    })
  }

  shoot() {
    //if(!components.tweenTicker.started) return
    let gp = this.getAbsolutePosition(this)
    const projectile = new InvaderProjectile(
      {
        x: gp.x + invaderWidth / 2,
        y: gp.y * 1.05,
      },
      invaderProjectileSpeed,
      InvaderProjectile.projectileCount % 4 === 0 ? 1 : 0
    )
    let destX = projectile.x
    if (InvaderProjectile.projectileCount % 2 === 0) {
      let diff = getRandomNumber() * 300 * (getRandomNumber() > 0.5 ? -1 : 1)
      destX = destX + diff
    }
    state.addInvaderProjectile(projectile)
    components.foreground.container.addChild(projectile)
    projectile.shootSound.play()
    projectile.moveTo(
      destX,
      stageHeight + 50,
      projectile.speed + getRandomNumber() * 3,
      () => {
        const i = state.invaderProjectiles.findIndex((el) => el === projectile)
        //if allready removed - return
        if (i < 0) return
        state.removeInvaderProjectile(i)
        projectile.destroy()
        InvaderProjectile.projectileCompleted++
      }
    )
  }

  createBonusWeapon(type: number) {
    let gp = this.getAbsolutePosition(this)
    const bonus = new BonusItem(
      {
        x: gp.x + invaderWidth / 2,
        y: gp.y * 1.05,
      },
      invaderProjectileSpeed / 2 + Math.random(),
      type
    )

    components.foreground.container.addChild(bonus)
    bonus.bonusCreatedSound.play()
    bonus.moveTo(bonus.x, stageHeight + 50, undefined, () => {
      if (!bonus.collected) {
        bonus.destroy()
      }
    })
  }

  blink() {
    this.sprite.tint = "#771111"
    Timeout.instantiate(() => {
      this.sprite.tint = "#FFFFFF"
    }, 50)
  }

  takeHit(h: number) {
    this.damage += h
    this.blink()
  }

  isTotallyDamaged() {
    return this.damage >= this.maxDamage
  }

  getAbsolutePosition(container: Container) {
    let absoluteX = container.x
    let absoluteY = container.y

    let currentContainer = container

    while (currentContainer.parent) {
      currentContainer = currentContainer.parent
      absoluteX += currentContainer.x
      absoluteY += currentContainer.y
      if (currentContainer.name === "foreground") break
    }

    return { x: absoluteX, y: absoluteY }
  }

  updateLayout(width: number, height: number) {}
}
