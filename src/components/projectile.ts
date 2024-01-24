import { Sprite, utils } from "pixi.js"
import { components, state } from "../state"
import { SmartContainer } from "./smartContainer"
import { Howl } from "howler"
import { soundSource } from "../settings"

//root container
export class Projectile extends SmartContainer {
  sprite: Sprite
  speed: number
  shootSound: Howl
  constructor(position: { x: number; y: number }, speed: number) {
    super()
    this.sprite = new Sprite(utils.TextureCache["projectile"])
    this.sprite.scale.set(1.5)
    this.addChild(this.sprite)
    this.speed = speed
    this.x = position.x
    this.y = position.y

    this.cbOnTweenUpdate = this.collisionTestWithInvaders

    this.shootSound = new Howl({
      src: [soundSource.playerProjectile],
      volume: 0.5,
      loop: false,
    })
    this.shootSound.volume(0.2 + Math.random() * 0.4)
    this.shootSound.play()
  }

  collisionTestWithInvaders(c: SmartContainer) {
    const bounds1 = this.sprite.getBounds()
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
        components.invaders.removeInvader(invader)
        const i = state.projectiles.findIndex((el) => el === this)
        state.removeProjectile(i)
        c.stopTween()
        state.triggerInvaderDestroyed()
        this.destroy()
      }
    }
  }

  updateLayout(width: number, height: number) {
    //this.speed = projectileSpeed * components.background.scale.x
  }
}
