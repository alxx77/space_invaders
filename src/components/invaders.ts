import { Container } from "pixi.js"
import { components, state } from "../state"
import { SmartContainer } from "./smartContainer"
import { Invader } from "./invader"
import {
  invaderHeight,
  invaderWidth,
  invaderXMargin,
  invaderYMargin,
} from "../settings"

type InvaderData = {
  x: number
  y: number
  variety: number
}

//root container
export class Invaders extends SmartContainer {
  container: Container
  public name: string
  constructor() {
    super()
    this.name = "Invaders"

    //container
    this.container = new Container()
    this.addChild(this.container)
  }

  async startMove() {
    const leftTarget = components.background.width-this.width
    console.log(leftTarget)
    await this.moveTo(leftTarget, this.y, 1)
    await this.moveTo(this.x, this.y + 50, 0.5)
    await this.moveTo(0, this.y, 1)
    await this.moveTo(this.x, this.y + 50, 0.5)
    await this.moveTo(components.background.width-this.width, this.y, 1)
    await this.moveTo(this.x, this.y + 50, 0.5)
    await this.moveTo(0, this.y, 1)
  }

  createInvaders() {
    const gen = this.getInvaders(state.gameLevel)
    for (const invaderData of gen) {
      const invader = new Invader(
        { x: invaderData.x, y: invaderData.y },
        invaderData.variety
      )
      state.addInvader(invader)
      this.container.addChild(invader)
    }
  }

  removeInvader(invader: Invader) {
    const i = state.invaders.findIndex((el) => el === invader)
    state.removeInvader(i)
    invader.destroy()
  }

  getInvaders = function* (level: number): Generator<InvaderData, void, void> {
    switch (level) {
      case 1:
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 11; col++) {
            yield {
              x: col * (invaderWidth + invaderXMargin),
              y: row * (invaderHeight + invaderYMargin),
              variety: row + 1,
            }
          }
        }
        break

      default:
        break
    }
  }

  updateLayout(width: number, height: number) {
    const oldScaleX = this.scale.x
    const oldScaleY = this.scale.y

    this.scale.x = components.background.scale.x
    this.scale.y = components.background.scale.y

    this.x = (this.x * components.background.scale.x) / oldScaleX
    this.y = (this.y * components.background.scale.y) / oldScaleY
  }
}
