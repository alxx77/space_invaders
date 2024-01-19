import {
  Sprite,
  utils,
  Ticker,
  Texture,
  AnimatedSprite,
  Assets,
  Resource,
} from "pixi.js"
import { components, state, PlayerDirection } from "../state"
import { SmartContainer } from "./smartContainer"
import { reaction } from "mobx"
import {
  playerSpeed,
  projectileSpeed,
  stageHeight,
  stageWidth,
} from "../settings"
import { Projectile } from "./projectile"

//single change of position
type DeltaPosition = { dx: number; dy: number }

//root container
export class Player extends SmartContainer {
  public name: string
  sprite: Sprite
  explosionSprite: AnimatedSprite
  positionCalculator: Generator<DeltaPosition, void, number> | undefined
  playerDirection: PlayerDirection
  ticker: Ticker | undefined
  constructor() {
    super()
    this.name = "Player"
    this.sprite = new Sprite(utils.TextureCache["player"])
    this.addChild(this.sprite)

    const sheet = Assets.cache.get("player_explosion")
    const textures: Texture<Resource>[] = Object.values(sheet.textures)
    this.explosionSprite = new AnimatedSprite(textures)
    this.explosionSprite.visible = false
    this.explosionSprite.loop = false
    this.explosionSprite.onComplete = () => {
      this.explosionSprite.visible = false
    }
    this.explosionSprite.x = this.width / 2
    this.explosionSprite.y = this.height / 2
    this.explosionSprite.anchor.set(0.5)
    this.explosionSprite.animationSpeed = 0.1
    this.addChild(this.explosionSprite)

    this.positionCalculator = undefined
    this.playerDirection = "none"

    //react to directions change
    reaction(
      () => state.getPlayerDirection,
      (newVal) => {
        this.playerDirection = newVal
      }
    )

    //shoot
    reaction(
      () => state.SpaceBar_keyPressed,
      (newVal, oldVal) => {
        //first check if player is not destroyed
        if (state.playerDestroyed) return

        //if spacebar is pressed fire a projectile
        if (newVal === true && oldVal === false) {
          const projectile = new Projectile(
            {
              x: this.x + components.player.width / 2,
              y: this.y * 0.95,
            },
            projectileSpeed
          )
          components.foreground.container.addChild(projectile)
          state.addProjectile(projectile)
          projectile.moveTo(
            this.x + components.player.width / 2,
            -50,
            projectile.speed,
            () => {
              const i = state.projectiles.findIndex((el) => el === projectile)
              state.removeProjectile(i)
              projectile.destroy()
            }
          )
        }
      }
    )

    //player destruction
    reaction(
      () => state.playerDestroyed,
      (newVal, oldVal) => {
        if (newVal === true && oldVal === false) {
          this.stop()
          this.sprite.visible = false
          this.explosionSprite.visible = true
          this.explosionSprite.play()
          state.setLivesCounter(state.livesCounter - 1)
        }
      }
    )

    //create position calculator
    this.positionCalculator = this.getPositionDelta(this)
  }

  start() {
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
              self.x + step.value.dx + self.width < stageWidth
            ) {
              //move player
              self.x = self.x + step.value.dx

              //necessary to keep player inside playground
              //because there might be pixel fractions
              if (self.x < 0) {
                self.x = 0
              }
              if (self.x > stageWidth - self.width) {
                self.x = stageWidth - self.width
              }
            }

            //Y axis movement
            if (
              self.y >= 0 &&
              self.y + step.value.dy + self.height < stageHeight
            ) {
              self.y = self.y + step.value.dy

              if (self.y < 0) {
                self.y = 0
              }
              if (self.y > stageHeight - self.height) {
                self.y = stageHeight - self.height
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
          speedY = playerSpeed * -1
          speedX = 0
          break

        case "down":
          speedY = playerSpeed * 1
          speedX = 0
          break

        case "left":
          speedY = 0
          speedX = playerSpeed * -1
          break

        case "right":
          speedY = 0
          speedX = playerSpeed * 1
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

  stop() {
    if (this.ticker) {
      this.ticker.stop()
      this.ticker.destroy()
    }
    this.positionCalculator = undefined
  }

  updateLayout(width: number, height: number) {}
}
