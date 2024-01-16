import {  Sprite, utils } from "pixi.js"
import { components } from "../state"
import { SmartContainer } from "./smartContainer"

//root container
export class Invader extends SmartContainer {
  sprite:Sprite
  constructor(position: {x:number, y:number},variety:number) {
    super()
    this.sprite = new Sprite(utils.TextureCache["invader" + variety])
    this.addChild(this.sprite)
    this.x = position.x
    this.y = position.y
  }

  updateLayout(width: number, height: number) {
  }
}