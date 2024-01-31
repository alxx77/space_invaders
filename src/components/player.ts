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
  disposerList: IReactionDisposer[]
  explosionSound: Howl
  engineSound: Howl
  weaponType: number
  constructor() {
    super()
    this.name = "Player"
    this.sprite = new Sprite(utils.TextureCache["player"])
    this.visible = false
    this.sprite.scale.set(2)
    this.addChild(this.sprite)

    //standard projectile as default
    this.weaponType = 0

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
    this.explosionSprite.x = this.width / 2
    this.explosionSprite.y = this.height / 2
    this.explosionSprite.anchor.set(0.5)
    this.explosionSprite.animationSpeed = 0.1
    this.addChild(this.explosionSprite)

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

    if(components.invaders){
      components.invaders.clearBonusWeapons()
    }
  }

  async shoot() {
    let projectile1: Projectile
    let projectile2: Projectile
    let projectile3: Projectile

    switch (this.weaponType) {
      case 0:
        projectile1 = new Projectile(
          {
            x: this.x + components.player.width / 2,
            y: this.y * 0.97,
          },
          projectileSpeed,
          0
        )
        components.foreground.container.addChild(projectile1)
        state.addProjectile(projectile1)
        projectile1.moveTo(
          this.x + components.player.width / 2,
          -50,
          projectile1.speed,
          () => {
            const i = state.projectiles.findIndex((el) => el === projectile1)
            state.removeProjectile(i)
            projectile1.destroy()
          }
        )
        break

      case 1:
        projectile1 = new Projectile(
          {
            x: this.x + components.player.width / 2 - 12 * this.sprite.scale.x,
            y: this.y * 0.97,
          },
          projectileSpeed * 1.5,
          0
        )
        components.foreground.container.addChild(projectile1)
        state.addProjectile(projectile1)
        projectile1.moveTo(
          this.x + components.player.width / 2 - 12 * this.sprite.scale.x,
          -50,
          projectile1.speed,
          () => {
            const i = state.projectiles.findIndex((el) => el === projectile1)
            state.removeProjectile(i)
            projectile1.destroy()
          }
        )

        projectile2 = new Projectile(
          {
            x: this.x + components.player.width / 2 + 12 * this.sprite.scale.x,
            y: this.y * 0.97,
          },
          projectileSpeed * 1.5,
          0
        )
        components.foreground.container.addChild(projectile2)
        state.addProjectile(projectile2)
        projectile2.moveTo(
          this.x + components.player.width / 2 + 12 * this.sprite.scale.x,
          -50,
          projectile2.speed,
          () => {
            const i = state.projectiles.findIndex((el) => el === projectile2)
            state.removeProjectile(i)
            projectile2.destroy()
          }
        )
        break

      case 2:
        projectile1 = new Projectile(
          {
            x: this.x + components.player.width / 2 - 20 * this.sprite.scale.x,
            y: this.y * 0.97,
          },
          projectileSpeed,
          1
        )
        components.foreground.container.addChild(projectile1)
        state.addProjectile(projectile1)
        projectile1.moveTo(
          this.x + components.player.width / 2 - 20 * this.sprite.scale.x,
          -50,
          projectile1.speed,
          () => {
            const i = state.projectiles.findIndex((el) => el === projectile1)
            state.removeProjectile(i)
            projectile1.destroy()
          }
        )

        projectile2 = new Projectile(
          {
            x: this.x + components.player.width / 2,
            y: this.y * 0.95,
          },
          projectileSpeed,
          0
        )
        components.foreground.container.addChild(projectile2)
        state.addProjectile(projectile2)
        projectile2.moveTo(
          this.x + components.player.width / 2,
          -50,
          projectile2.speed * 2,
          () => {
            const i = state.projectiles.findIndex((el) => el === projectile2)
            state.removeProjectile(i)
            projectile2.destroy()
          }
        )

        projectile3 = new Projectile(
          {
            x: this.x + components.player.width / 2 + 20 * this.sprite.scale.x,
            y: this.y * 0.97,
          },
          projectileSpeed,
          1
        )
        components.foreground.container.addChild(projectile3)
        state.addProjectile(projectile3)
        projectile3.moveTo(
          this.x + components.player.width / 2 + 20 * this.sprite.scale.x,
          -50,
          projectile3.speed,
          () => {
            const i = state.projectiles.findIndex((el) => el === projectile3)
            state.removeProjectile(i)
            projectile3.destroy()
          }
        )

        break

      default:
        break
    }
  }

  async slideIn() {
    state.setPlayerActive(false)
    this.x = -200
    this.y = stageHeight * 0.85
    this.visible = true
    return this.moveTo(
      stageWidth / 2 - this.width / 2,
      stageHeight * 0.85,
      playerSlideInSpeed,
      () => {
        state.setPlayerActive(true)
      }
    )
  }

  async slideOut() {
    state.setPlayerActive(false)
    return this.moveTo(-200, stageHeight * 0.85, playerSlideInSpeed)
  }

  async slideToCenter() {
    state.setPlayerActive(false)
    const self = this
    return this.moveTo(
      stageWidth / 2 - self.width / 2,
      stageHeight * 0.85,
      playerSlideInSpeed
    )
  }

  moveDelta(deltaX: number, deltaY: number) {
    if (!state.playerActive) return
    //X-axis movement
    if (this.x >= 0 && this.x + deltaX + this.width < stageWidth) {
      //move player
      this.x += deltaX
      //necessary to keep player inside playground
      //because there might be pixel fractions
      if (this.x < 0) {
        this.x = 0
      }
      if (this.x > stageWidth - this.width) {
        this.x = stageWidth - this.width
      }
    }

    //Y-axis movement
    if (this.y >= 0 && this.y + deltaY + this.height < stageHeight) {
      //move player
      this.y += deltaY
      //necessary to keep player inside playground
      //because there might be pixel fractions
      if (this.y < 0) {
        this.y = 0
      }
      if (this.y > stageHeight - this.height) {
        this.y = stageHeight - this.height
      }
    }
  }

  moveToPosition(x: number, y: number) {
    if (!state.playerActive) return
    //X-axis movement
    if (this.x >= 0 && this.x + x + this.width < stageWidth) {
      //move player
      this.x = x
      //necessary to keep player inside playground
      //because there might be pixel fractions
      if (this.x < 0) {
        this.x = 0
      }
      if (this.x > stageWidth - this.width) {
        this.x = stageWidth - this.width
      }
    }

    //Y-axis movement
    if (this.y >= 0 && this.y + y + this.height < stageHeight) {
      //move player
      this.y = y
      //necessary to keep player inside playground
      //because there might be pixel fractions
      if (this.y < 0) {
        this.y = 0
      }
      if (this.y > stageHeight - this.height) {
        this.y = stageHeight - this.height
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
