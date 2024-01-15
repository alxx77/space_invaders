import {  Sprite, utils } from "pixi.js"
import { components } from "../state"
import { SmartContainer } from "./smartContainer"
import { projectileSpeed } from "../settings"

//root container
export class Projectile extends SmartContainer {
  sprite:Sprite
  speed:number
  constructor(position: {x:number, y:number}, speed:number) {
    super()
    this.sprite = new Sprite(utils.TextureCache["projectile"])
    this.addChild(this.sprite)
    this.speed = speed
    this.x = position.x
    this.y = position.y
  }

  updateLayout(width: number, height: number) {
    const oldScaleX = this.scale.x
    const oldScaleY = this.scale.y

    this.scale.x = components.background.scale.x
    this.scale.y = components.background.scale.y

    this.x = this.x * components.background.scale.x/oldScaleX
    this.y = this.y * components.background.scale.y/oldScaleY

    this.speed = projectileSpeed * components.background.scale.x
  }
}