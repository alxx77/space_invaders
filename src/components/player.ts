import { Sprite, utils, Ticker } from "pixi.js"
import { components, state, PlayerDirection } from "../state"
import { SmartContainer } from "./smartContainer"
import { reaction } from "mobx"
import { playerSpeed } from "../settings"

//linear interpolation
const lerp = (x: number, y: number, a: number) => x * (1 - a) + y * a

//single change of position
type DeltaPosition = { dx: number; dy: number }

//root container
export class Player extends SmartContainer {
  public name: string
  sprite: Sprite
  isMoving: boolean
  positionCalculator: Generator<DeltaPosition, void, number> | undefined
  playerDirection: PlayerDirection
  speed:number
  constructor() {
    super()
    this.name = "Player"
    this.sprite = new Sprite(utils.TextureCache["player"])
    this.addChild(this.sprite)
    this.isMoving = false
    this.positionCalculator = undefined
    this.playerDirection = "none"
    this.speed = 0

    reaction(
      () => state.getPlayerDirection,
      (newVal) => {
        this.playerDirection = newVal
      }
    )

    this.positionCalculator = this.getPositionDelta(this)
  }

  updatePosition() {
    let step: IteratorResult<DeltaPosition, void>
    let ticker = new Ticker()
    let self = this
    ticker.add(function (delta) {
      if (self.positionCalculator) {
        step = self.positionCalculator.next(delta)
        if (step.done === false) {
          if (step.value) {
            //X-axis movement
            if (
              self.x >= 0 &&
              self.x + step.value.dx + self.width < components.background.width
            ) {
              //move player
              self.x = self.x + step.value.dx

              //necessary to keep player inside playground
              //because there might be pixel fractions
              if (self.x < 0) {
                self.x = 0
              }
              if (self.x > components.background.width - self.width) {
                self.x = components.background.width - self.width
              }
            }

            //Y axis movement
            if (
              self.y >= 0 &&
              self.y + step.value.dy + self.height <
                components.background.height
            ) {
              self.y = self.y + step.value.dy

              if (self.y < 0) {
                self.y = 0
              }
              if (self.y > components.background.height - self.height) {
                self.y = components.background.height - self.height
              }
            }
          }
        } else {
          ticker.destroy()
        }
      }
    })
    ticker.start()
  }

  //generator that calculates move
  getPositionDelta = function* (
    self: Player
  ): Generator<DeltaPosition, void, number> {
    let delta = 1

    //actual shift
    let actualDX = 0
    let actualDY = 0

    //nominal (not delta adjusted)
    let nominalDX = 0
    let nominalDY = 0

    let speedX = 0
    let speedY = 0

    //loop until target is reached
    while (true) {
      switch (self.playerDirection) {
        case "up":
          speedY = self.speed * -1
          speedX = 0
          break

        case "down":
          speedY = self.speed * 1
          speedX = 0
          break

        case "left":
          speedY = 0
          speedX = self.speed * -1
          break

        case "right":
          speedY = 0
          speedX = self.speed * 1
          break

        case "none":
          speedX = 0
          speedY = 0
          break

        default:
          break
      }

      //nominal step (non - time adjusted)
      nominalDX = speedX
      nominalDY = speedY

      //time-adjusted steps
      actualDX = nominalDX * delta
      actualDY = nominalDY * delta

      //return value & get new input data
      delta = yield { dx: actualDX, dy: actualDY }
    }
  }

  updateLayout(width: number, height: number) {
    const oldScaleX = this.scale.x
    const oldScaleY = this.scale.y

    this.scale.x = components.background.scale.x
    this.scale.y = components.background.scale.y

    this.x = this.x * components.background.scale.x/oldScaleX
    this.y = this.y * components.background.scale.y/oldScaleY

    this.speed = playerSpeed * components.background.scale.x

  }
}
