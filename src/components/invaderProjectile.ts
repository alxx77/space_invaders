import { Sprite, Texture, utils } from "pixi.js"
import { SmartContainer } from "./smartContainer"
import { components, state } from "../state"
import { Howl } from "howler"
import { projectileSpeed, soundSource } from "../settings"

export class InvaderProjectile extends SmartContainer {
  sprite: Sprite
  speed: number
  shootSound: Howl
  red:boolean
  static projectileCount:number
  constructor(position: { x: number; y: number }, speed: number) {
    super()
    this.red = false
    let texture = utils.TextureCache["invader_projectile"]

    if(InvaderProjectile.projectileCount%3 === 0){
      texture = utils.TextureCache["invader_projectile_red"]
      this.red = true
    }

    InvaderProjectile.projectileCount++ 
    
    this.sprite = new Sprite(texture)
    this.scale.set(2)
    this.addChild(this.sprite)
    this.speed = speed
    this.x = position.x
    this.y = position.y
    this.cbOnTweenUpdate = this.collisionTestPlayerWithInvaderProjectile

    this.shootSound = new Howl({
      src: [soundSource.invaderProjectile],
      volume: 0.5,
      loop: false,
    })
    this.shootSound.volume(0.1 + Math.random() * 0.1)
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
        c.stopTween()
        state.setInvadersActive(false)
        state.setPlayerAlive(false)
        const i = state.invaderProjectiles.findIndex(
          (el) => el === invaderProjectile
        )
        //console.log('player kill: ' + i )
        state.removeInvaderProjectile(i)
        invaderProjectile.stopTween()
        invaderProjectile.visible = false
        invaderProjectile.destroy()
        return
      }
    }
  }

  updateLayout(width: number, height: number) {}
}
