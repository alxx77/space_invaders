import { AnimatedSprite, Assets, Container, Resource, Sprite, Texture, utils } from "pixi.js"
import { components, state } from "../state"
import { SmartContainer } from "./smartContainer"
import { InvaderProjectile } from "./invaderProjectile"
import { invaderWidth, invaderProjectileSpeed, stageHeight, soundSource } from "../settings"
import { Howl } from "howler"

//root container
export class Invader extends SmartContainer {
  sprite: Sprite
  explosionSprite: AnimatedSprite
  explosionSound:Howl
  constructor(position: { x: number; y: number }, variety: number) {
    super()
    this.sprite = new Sprite(utils.TextureCache["invader" + variety])
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
    let gp = this.getAbsolutePosition(this)
    const projectile = new InvaderProjectile(
      {
        x: gp.x + invaderWidth / 2,
        y: gp.y * 1.05,
      },
      invaderProjectileSpeed + Math.random()
    )
    components.foreground.container.addChild(projectile)
    state.addInvaderProjectile(projectile)
    projectile.shootSound.play()
    projectile.moveTo(
      projectile.x,
      stageHeight + 50,
      projectile.speed,
      ()=>{
        const i = state.invaderProjectiles.findIndex(
          (el) => el === projectile
        )
        state.removeInvaderProjectile(i)
        projectile.destroy()
      }
    )
  }

  getAbsolutePosition(container: Container) {
    let absoluteX = container.x
    let absoluteY = container.y

    let currentContainer = container

    while (currentContainer.parent ) {
      currentContainer = currentContainer.parent
      absoluteX += currentContainer.x
      absoluteY += currentContainer.y
      if(currentContainer.name === 'foreground') break
    }

    return { x: absoluteX, y: absoluteY }
  }

  updateLayout(width: number, height: number) {}
}
