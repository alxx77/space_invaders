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
import { IReactionDisposer, reaction } from "mobx"
import {
  playerSlideInSpeed,
  playerSpeed,
  projectileSpeed,
  soundSource,
  stageHeight,
  stageWidth,
} from "../settings"
import { Projectile } from "./projectile"
import { Howl } from "howler"
import { InvaderProjectile } from "./invaderProjectile"
import Timeout from "smart-timeout"

//single change of position
type DeltaPosition = { dx: number; dy: number }

//root container
export class Player extends SmartContainer {
  public name: string
  sprite: Sprite
  shieldSprite: Sprite
  explosionSprite: AnimatedSprite
  positionCalculator: Generator<DeltaPosition, void, number> | undefined
  playerDirection: PlayerDirection
  ticker: Ticker | undefined
  disposerList: IReactionDisposer[]
  explosionSound: Howl
  engineSound: Howl
  bonusItemsList: number[]
  damage: number
  maxDamage: number
  private shieldEngaged: boolean
  constructor() {
    super()
    this.name = "Player"
    this.sprite = new Sprite(utils.TextureCache["player"])
    this.visible = false
    this.sprite.anchor.set(0.5)
    this.sprite.scale.set(2)
    this.addChild(this.sprite)

    this.damage = 0
    this.maxDamage = 3
    this.shieldEngaged = false

    //standard projectile as default
    this.bonusItemsList = [0]

    components.foreground.container.addChild(this)

    const sheet = Assets.cache.get("player_explosion")
    const textures: Texture<Resource>[] = Object.values(sheet.textures)
    this.explosionSprite = new AnimatedSprite(textures)
    this.explosionSprite.scale.set(2)
    this.explosionSprite.visible = false
    this.explosionSprite.loop = false
    this.explosionSprite.onComplete = () => {
      this.explosionSprite.visible = false
    }
    this.explosionSprite.anchor.set(0.5)
    this.explosionSprite.animationSpeed = 0.1
    this.addChild(this.explosionSprite)

    this.shieldSprite = new Sprite(utils.TextureCache["player_shield"])
    this.shieldSprite.scale.set(3)
    this.shieldSprite.anchor.set(0.5)
    this.shieldSprite.y = -35
    this.shieldSprite.visible = false
    this.addChild(this.shieldSprite)

    this.positionCalculator = undefined
    this.playerDirection = "none"

    this.disposerList = []
    let d

    //react to directions change
    d = reaction(
      () => state.getPlayerDirection,
      (newVal) => {
        this.playerDirection = newVal
      }
    )

    this.disposerList.push(d)

    //shoot
    d = reaction(
      () => ({
        SpaceBar_keyPressed: state.SPACEBAR_keyPressed,
      }),
      (newVal) => {
        //first check if player is alive
        if (!state.playerAlive || !state.playerActive) return

        //if spacebar is pressed fire a projectile
        if (newVal.SpaceBar_keyPressed === true) {
          this.shoot()
        }
      }
    )

    this.disposerList.push(d)

    //player destruction
    d = reaction(
      () => state.playerAlive,
      (newVal) => {
        if (newVal === false) {
          this.stop()
          this.sprite.visible = false
          this.engineSound.stop()
          for (const disposer of this.disposerList) {
            disposer()
          }
          this.explosionSprite.visible = true
          this.explosionSprite.play()
          this.explosionSound.play()
          state.setLivesCounter(state.livesCounter - 1)
          this.explosionSprite.onComplete = () => {
            state.triggerPlayerDestructionCompleted()
            this.visible = false
            this.destroy()
          }
          state.setPlayerActive(false)
        }
      }
    )

    this.disposerList.push(d)

    //engine
    d = reaction(
      () => state.playerActive,
      (newVal) => {
        if (newVal === true) {
          this.engineSound.play()
        } else {
          this.engineSound.stop()
        }
      }
    )

    this.disposerList.push(d)

    //create position calculator
    this.positionCalculator = this.getPositionDelta(this)

    //start receiving commands
    this.start()

    //set player alive
    state.setPlayerAlive(true)

    this.explosionSound = new Howl({
      src: [soundSource.playerExplosion],
      volume: 0.5,
      loop: false,
    })

    this.engineSound = new Howl({
      src: [soundSource.playerEngine],
      volume: 0.3,
      loop: true,
    })

    if (components.invaders) {
      components.invaders.clearBonusWeapons()
    }
  }

  addBonusItem(item: number) {
    this.bonusItemsList.push(item)
    if (item === 10) {
      this.engageShield()
      setTimeout(() => {
        this.disengageShield()
      }, 10000)
    }
  }

  async takeHitFromProjectile(ip: InvaderProjectile) {
    let damageFactor = this.shieldEngaged ? 0.25 : 1
    this.damage = this.damage + damageFactor * ip.lethalFactor
    console.log(this.damage)
    return this.blink()
  }

  isTotallyDamaged() {
    return this.damage >= this.maxDamage
  }

  resetDamage(){
    this.damage = 0
  }

  async blink() {
    this.sprite.tint = "#771111"
    await new Promise<void>((resolve) => {
      Timeout.instantiate(() => {
        this.sprite.tint = "#FFFFFF"
        resolve()
      }, 50)
    })

    await new Promise<void>((resolve) => {
      Timeout.instantiate(() => {
        this.sprite.tint = "#771111"
        resolve()
      }, 50)
    })

    await new Promise<void>((resolve) => {
      Timeout.instantiate(() => {
        this.sprite.tint = "#FFFFFF"
        resolve()
      }, 50)
    })
  }

  fireProjectile(
    x: number,
    y: number,
    projectileSpeed: number,
    projectileType: number,
    xDestination: number,
    yDestination: number
  ) {
    const projectile = new Projectile(
      {
        x: x,
        y: y,
      },
      projectileSpeed,
      projectileType
    )
    components.foreground.container.addChild(projectile)
    state.addProjectile(projectile)
    projectile.moveTo(xDestination, yDestination, projectile.speed, () => {
      const i = state.projectiles.findIndex((el) => el === projectile)
      state.removeProjectile(i)
      projectile.destroy()
    })
  }

  async shoot() {
    if (this.bonusItemsList.includes(2)) {
      this.fireProjectile(
        this.x - 20 * this.sprite.scale.x,
        this.y * 0.97,
        projectileSpeed,
        1,
        this.x - 20 * this.sprite.scale.x,
        -50
      )
      this.fireProjectile(
        this.x + 20 * this.sprite.scale.x,
        this.y * 0.97,
        projectileSpeed,
        1,
        this.x + 20 * this.sprite.scale.x,
        -50
      )
      this.fireProjectile(
        this.x,
        this.y * 0.95,
        projectileSpeed * 2,
        0,
        this.x,
        -50
      )
      return
    }

    if (this.bonusItemsList.includes(1)) {
      this.fireProjectile(
        this.x - 12 * this.sprite.scale.x,
        this.y * 0.97,
        projectileSpeed * 1.5,
        1,
        this.x - 12 * this.sprite.scale.x,
        -50
      )
      this.fireProjectile(
        this.x + 12 * this.sprite.scale.x,
        this.y * 0.97,
        projectileSpeed * 1.5,
        1,
        this.x + 12 * this.sprite.scale.x,
        -50
      )
      return
    }

    if (this.bonusItemsList.includes(0)) {
      this.fireProjectile(
        this.x,
        this.y * 0.97,
        projectileSpeed,
        1,
        this.x,
        -50
      )
      return
    }
  }

  engageShield() {
    this.shieldEngaged = true
    this.shieldSprite.visible = true
  }

  disengageShield() {
    this.shieldEngaged = false
    this.shieldSprite.visible = false
    let i = this.bonusItemsList.findIndex((el)=> el === 10)
    this.bonusItemsList.splice(i,1)
  }

  async slideIn() {
    state.setPlayerActive(false)
    this.x = -250
    this.y = stageHeight * 0.85
    this.visible = true
    return this.moveTo(stageWidth / 2, stageHeight * 0.85, playerSlideInSpeed)
  }

  async slideOut() {
    state.setPlayerActive(false)
    return this.moveTo(-200, stageHeight * 0.85, playerSlideInSpeed)
  }

  async slideToCenter() {
    state.setPlayerActive(false)
    return this.moveTo(stageWidth / 2, stageHeight * 0.85, playerSlideInSpeed)
  }

  moveDelta(deltaX: number, deltaY: number) {
    if (!state.playerActive) return
    //X-axis movement
    if (this.x + deltaX + this.width / 2 < stageWidth) {
      //move player
      this.x += deltaX
      //necessary to keep player inside playground
      //because there might be pixel fractions
      if (this.x < this.width / 2) {
        this.x = this.width / 2
      }
      if (this.x > stageWidth - this.width / 2) {
        this.x = stageWidth - this.width / 2
      }
    }

    //Y-axis movement
    if (this.y + deltaY + this.height / 2 < stageHeight) {
      //move player
      this.y += deltaY
      //necessary to keep player inside playground
      //because there might be pixel fractions
      if (this.y < this.height / 2) {
        this.y = this.height / 2
      }
      if (this.y > stageHeight - this.height / 2) {
        this.y = stageHeight - this.height / 2
      }
    }
  }

  moveToPosition(x: number, y: number) {
    if (!state.playerActive) return
    //X-axis movement
    if (this.x >= 0 && this.x + x + this.width / 2 < stageWidth) {
      //move player
      this.x = x
      //necessary to keep player inside playground
      //because there might be pixel fractions
      if (this.x < this.width / 2) {
        this.x = this.width / 2
      }
      if (this.x > stageWidth - this.width / 2) {
        this.x = stageWidth - this.width / 2
      }
    }

    //Y-axis movement
    if (this.y + y + this.height / 2 < stageHeight) {
      //move player
      this.y = y
      //necessary to keep player inside playground
      //because there might be pixel fractions
      if (this.y < this.height / 2) {
        this.y = this.height / 2
      }
      if (this.y > stageHeight - this.height / 2) {
        this.y = stageHeight - this.height / 2
      }
    }
  }

  start() {
    if (state.mobileDevice) return
    let step: IteratorResult<DeltaPosition, void>
    let ticker = new Ticker()
    let self = this
    ticker.add(function (delta) {
      //if not active do not listen to commands
      if (!state.playerActive) return

      if (self.positionCalculator) {
        step = self.positionCalculator.next(delta)
        if (step.done === false) {
          if (step.value) {
            //X-axis movement
            if (self.x + step.value.dx + self.width / 2 < stageWidth) {
              //move player
              self.x = self.x + step.value.dx

              //necessary to keep player inside playground
              //because there might be pixel fractions
              if (self.x < self.width / 2) {
                self.x = self.width / 2
              }
              if (self.x > stageWidth - self.width / 2) {
                self.x = stageWidth - self.width / 2
              }
            }

            //Y axis movement
            if (self.y + step.value.dy + self.height / 2 < stageHeight) {
              self.y = self.y + step.value.dy

              if (self.y < self.height / 2) {
                self.y = self.height / 2
              }
              if (self.y > stageHeight - self.height / 2) {
                self.y = stageHeight - self.height / 2
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
