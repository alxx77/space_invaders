import {
  Sprite,
  utils,
  Ticker,
  Texture,
  AnimatedSprite,
  Assets,
  Resource,
  Text,
  TextStyle,
} from "pixi.js"
import { components, state, PlayerDirection } from "../state"
import { SmartContainer } from "./smartContainer"
import { IReactionDisposer, reaction } from "mobx"
import {
  fontStyles,
  playerCannonballBonusBlinkInterval,
  playerCannonballBonusDuration1,
  playerCannonballBonusDuration2,
  playerFireControl,
  playerFireRateBonusBlinkInterval,
  playerFireRateBonusDuration1,
  playerFireRateBonusDuration2,
  playerHeight,
  playerMaxDamage,
  playerScaleFactor,
  playerShieldDuration1,
  playerShieldDuration2,
  playerSlideInSpeed,
  playerSpeed,
  playerWeaponBonusBlinkInterval,
  playerWeaponBonusDuration1,
  playerWeaponBonusDuration2,
  playerWidth,
  projectileSpeed,
  soundSource,
  stageHeight,
  stageWidth,
} from "../settings"
import { Projectile } from "./projectile"
import { Howl } from "howler"
import { InvaderProjectile } from "./invaderProjectile"
import Timeout from "smart-timeout"
import { changeSpriteTint } from "../utils"

//single change of position
type DeltaPosition = { dx: number; dy: number }

//root container
export class Player extends SmartContainer {
  public name: string
  readonly sprite: Sprite
  private shieldSprite: Sprite
  private explosionSprite: AnimatedSprite
  private positionCalculator: Generator<DeltaPosition, void, number> | undefined
  private playerDirection: PlayerDirection
  private ticker: Ticker | undefined
  private disposerList: IReactionDisposer[]
  private explosionSound: Howl
  private engineSound: Howl
  weapon: number
  private damage: number
  private shieldText: Text
  shieldEngaged: boolean
  autofireInterval: number
  maxPlayerProjectilesFiredPerSecond: number
  bonusApplied: number[]
  cannonballBonusOn = false
  weaponBonusOn = false
  fireRateBonusOn = false
  weaponBonusBlinkInterval: NodeJS.Timeout | undefined
  fireRateBonusBlinkInterval: NodeJS.Timeout | undefined
  cannonballBonusBlinkInterval: NodeJS.Timeout | undefined
  private healthText: Text
  constructor() {
    super()
    this.name = "Player"
    this.sprite = new Sprite(utils.TextureCache["player"])
    this.visible = false
    this.sprite.anchor.set(0.5)
    this.sprite.scale.set(playerScaleFactor)
    this.addChild(this.sprite)

    this.damage = 0
    this.shieldEngaged = false
    this.bonusApplied = []

    //standard projectile as default
    this.weapon = 0
    this.autofireInterval = playerFireControl.fireRate0.autofireInterval
    this.maxPlayerProjectilesFiredPerSecond =
      playerFireControl.fireRate0.maxPlayerProjectilesFiredPerSecond

    components.foreground.container.addChild(this)

    const sheet = Assets.cache.get("player_explosion")
    const textures: Texture<Resource>[] = Object.values(sheet.textures)
    this.explosionSprite = new AnimatedSprite(textures)
    this.explosionSprite.scale = this.sprite.scale
    this.explosionSprite.visible = false
    this.explosionSprite.loop = false
    this.explosionSprite.onComplete = () => {
      this.explosionSprite.visible = false
    }
    this.explosionSprite.anchor.set(0.5)
    this.explosionSprite.animationSpeed = 0.1
    this.addChild(this.explosionSprite)

    this.shieldSprite = new Sprite(utils.TextureCache["player_shield"])
    this.shieldSprite.scale.set(playerScaleFactor * 1.5)
    this.shieldSprite.anchor.set(0.5)
    this.shieldSprite.y = -35
    this.shieldSprite.visible = false
    this.addChild(this.shieldSprite)

    //score
    this.shieldText = new Text(``, fontStyles.shieldTextWhite)
    this.shieldText.anchor.set(0.5)
    this.shieldText.x = 6
    this.shieldText.y = 85

    this.addChild(this.shieldText)

    //health
    this.healthText = new Text(`*****`, fontStyles.healthText)
    this.healthText.anchor.set(0.5)
    this.healthText.y = 60 * playerScaleFactor
    this.healthText.visible = true
    this.healthText.alpha = 0.6

    this.addChild(this.healthText)

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
        //if conditions are met
        if (newVal.SpaceBar_keyPressed === true) {
          if (
            components.game.firingRateCalculator.calculateRate() <
            this.maxPlayerProjectilesFiredPerSecond
          ) {
            components.player.shoot()
          }
        }
      }
    )

    this.disposerList.push(d)

    //player destruction
    d = reaction(
      () => state.playerAlive,
      (newVal) => {
        if (newVal === false) {
          this.damage = playerMaxDamage
          this.healthText.text = this.percentageToAsterisks(
            this.getHealthPercentage()
          )
          Timeout.reset("wb", 0)
          Timeout.reset("frb", 0)
          Timeout.reset("cbb", 0)

          this.disengageShield()
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
      volume: 0.25,
      loop: true,
    })

    this.healthText.text = this.percentageToAsterisks(
      this.getHealthPercentage()
    )
  }

  private percentageToAsterisks(percent: number): string {
    // Ensure the percentage is within the range [0, 100]
    const percentage = Math.max(0, Math.min(100, percent))

    // Calculate the equivalent number of asterisks
    const numAsterisks = Math.round(percentage / 20) // Each 20% corresponds to one asterisk

    // Generate the asterisk string
    return "*".repeat(numAsterisks)
  }

  getHealthPercentage() {
    return (100 / playerMaxDamage) * (playerMaxDamage - this.damage)
  }

  setFireControlParams(interval: number, maxRate: number) {
    this.autofireInterval = interval
    this.maxPlayerProjectilesFiredPerSecond = maxRate
    //reignite autofire with new params
    if (components.game.autofire) {
      components.game.dismountAutofire()
      components.game.mountAutofire()
    }
  }

  powerUpShield() {
    //handle shield
    this.engageShield()
    this.shieldText.visible = true
    this.shieldText.style = new TextStyle(fontStyles.shieldTextWhite)
    Timeout.instantiate(() => {
      Timeout.instantiate(() => {
        this.disengageShield()
        this.stopShieldBlink(i)
      }, playerShieldDuration2)
      const i = this.startShieldBlink()
    }, playerShieldDuration1)

    //stopwatch
    let totalTimeLeft = playerShieldDuration1 + playerShieldDuration2
    const self = this
    const i = setInterval(function () {
      totalTimeLeft = totalTimeLeft - 100
      const formattedNumber: string = (totalTimeLeft / 1000).toFixed(1)
      self.shieldText.text = formattedNumber
      if (totalTimeLeft <= 0) {
        clearInterval(i)
      }
    }, 100)
  }

  async takeHitFromProjectile(ip: InvaderProjectile) {
    let damageFactor = this.shieldEngaged ? 0.25 : 1
    this.damage = this.damage + damageFactor * ip.lethalFactor
    this.healthText.text = this.percentageToAsterisks(
      this.getHealthPercentage()
    )

    return this.blink()
  }

  isTotallyDamaged() {
    return this.damage >= playerMaxDamage
  }

  resetDamage() {
    this.damage = 0
    this.healthText.text = this.percentageToAsterisks(
      this.getHealthPercentage()
    )
  }

  private async blink() {
    this.sprite.tint = "#771111"
    await changeSpriteTint("#FFFFFF", 50, this.sprite)
    await changeSpriteTint("#771111", 50, this.sprite)
    await changeSpriteTint("#FFFFFF", 50, this.sprite)
  }

  private startShieldBlink() {
    return setInterval(() => {
      this.shieldSprite.visible = !this.shieldSprite.visible
      this.shieldText.style = new TextStyle(fontStyles.shieldTextRed)
    }, 350)
  }

  private stopShieldBlink(i: NodeJS.Timeout) {
    clearInterval(i)
    this.shieldSprite.visible = false
    this.shieldText.visible = false
  }

  private fireProjectile(
    x: number,
    y: number,
    projectileSpeed: number,
    projectileType: number,
    xDestination: number,
    yDestination: number,
    indestructible: boolean = false,
    emitSound: boolean
  ) {
    const projectile = new Projectile(
      {
        x: x,
        y: y,
      },
      projectileSpeed,
      projectileType,
      emitSound
    )
    projectile.indestructible = indestructible
    components.foreground.container.addChild(projectile)
    state.addProjectile(projectile)
    projectile.moveTo(xDestination, yDestination, projectile.speed, () => {
      const i = state.projectiles.findIndex((el) => el === projectile)
      state.removeProjectile(i)
      projectile.destroy()
    })

    return projectile
  }

  private fireWeapon0() {
    const pl = this.fireProjectile(
      this.x,
      this.y * 0.97,
      projectileSpeed,
      1,
      this.x,
      -50,
      this.cannonballBonusOn,
      true
    )
  }

  private fireWeapon1() {
    this.fireProjectile(
      this.x - 12 * this.sprite.scale.x,
      this.y * 0.97,
      projectileSpeed * 1.2,
      1,
      this.x - 12 * this.sprite.scale.x,
      -50,
      this.cannonballBonusOn,
      true
    )
    this.fireProjectile(
      this.x + 12 * this.sprite.scale.x,
      this.y * 0.97,
      projectileSpeed * 1.2,
      1,
      this.x + 12 * this.sprite.scale.x,
      -50,
      false,
      false
    )
  }

  private fireWeapon2() {
    this.fireProjectile(
      this.x - 20 * this.sprite.scale.x,
      this.y * 0.96,
      projectileSpeed,
      1,
      this.x - 20 * this.sprite.scale.x,
      -50,
      false,
      false
    )
    this.fireProjectile(
      this.x + 20 * this.sprite.scale.x,
      this.y * 0.96,
      projectileSpeed,
      1,
      this.x + 20 * this.sprite.scale.x,
      -50,
      false,
      false
    )
    this.fireProjectile(
      this.x,
      this.y * 0.94,
      projectileSpeed,
      0,
      this.x,
      -50,
      this.cannonballBonusOn,
      true
    )
  }

  private fireWeapon3() {
    this.fireProjectile(
      this.x - playerWidth * 0.75 * this.sprite.scale.x,
      this.y * 0.98,
      projectileSpeed,
      0,
      this.x - playerWidth * 0.75 * this.sprite.scale.x,
      -50,
      false,
      false
    )

    this.fireProjectile(
      this.x + playerWidth * 0.75 * this.sprite.scale.x,
      this.y * 0.98,
      projectileSpeed,
      0,
      this.x + playerWidth * 0.75 * this.sprite.scale.x,
      -50,
      false,
      false
    )
  }

  async shoot() {
    switch (this.weapon) {
      case 0:
        this.fireWeapon0()
        break
      case 1:
        this.fireWeapon1()
        break
      case 2:
        this.fireWeapon2()
        break
      case 3:
        this.fireWeapon2()
        this.fireWeapon3()
        break
      default:
        break
    }

    //add an event, so fire rate per second can be calculated
    components.game.firingRateCalculator.addEvent()
  }

  private engageShield() {
    this.shieldEngaged = true
    this.shieldSprite.visible = true
  }

  private disengageShield() {
    this.shieldEngaged = false
    this.shieldSprite.visible = false
    this.shieldText.visible = false
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

    const w = playerWidth * playerScaleFactor
    const h = playerHeight * playerScaleFactor

    //X-axis movement
    if (this.x + deltaX + w / 2 < stageWidth) {
      //move player
      this.x += deltaX
      //necessary to keep player inside playground
      //because there might be pixel fractions
      if (this.x < w / 2) {
        this.x = w / 2
      }
      if (this.x > stageWidth - w / 2) {
        this.x = stageWidth - w / 2
      }
    }

    //Y-axis movement
    if (this.y + deltaY + h / 2 < stageHeight) {
      //move player
      this.y += deltaY
      //necessary to keep player inside playground
      //because there might be pixel fractions
      if (this.y < h / 2) {
        this.y = h / 2
      }
      if (this.y > stageHeight - h / 2) {
        this.y = stageHeight - h / 2
      }
    }
  }

  moveToPosition(x: number, y: number) {
    if (!state.playerActive) return

    const w = playerWidth * playerScaleFactor
    const h = playerHeight * playerScaleFactor

    //X-axis movement
    if (this.x >= 0 && this.x + x + w / 2 < stageWidth) {
      //move player
      this.x = x
      //necessary to keep player inside playground
      //because there might be pixel fractions
      if (this.x < w / 2) {
        this.x = w / 2
      }
      if (this.x > stageWidth - w / 2) {
        this.x = stageWidth - w / 2
      }
    }

    //Y-axis movement
    if (this.y + y + h / 2 < stageHeight) {
      //move player
      this.y = y
      //necessary to keep player inside playground
      //because there might be pixel fractions
      if (this.y < h / 2) {
        this.y = h / 2
      }
      if (this.y > stageHeight - h / 2) {
        this.y = stageHeight - h / 2
      }
    }
  }

  start() {
    if (state.mobileDevice) return
    let step: IteratorResult<DeltaPosition, void>
    let ticker = new Ticker()
    let self = this
    const w = playerWidth * playerScaleFactor
    const h = playerHeight * playerScaleFactor
    ticker.add(function (delta) {
      //if not active do not listen to commands
      if (!state.playerActive) return

      if (self.positionCalculator) {
        step = self.positionCalculator.next(delta)
        if (step.done === false) {
          if (step.value) {
            //X-axis movement
            if (self.x + step.value.dx + w / 2 < stageWidth) {
              //move player
              self.x = self.x + step.value.dx

              //necessary to keep player inside playground
              //because there might be pixel fractions
              if (self.x < w / 2) {
                self.x = w / 2
              }
              if (self.x > stageWidth - w / 2) {
                self.x = stageWidth - w / 2
              }
            }

            //Y axis movement
            if (self.y + step.value.dy + h / 2 < stageHeight) {
              self.y = self.y + step.value.dy

              if (self.y < h / 2) {
                self.y = h / 2
              }
              if (self.y > stageHeight - h / 2) {
                self.y = stageHeight - h / 2
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

  //weapon bonus
  incrementWeaponType() {
    if (components.player.weapon < 3) {
      components.player.weapon++
      if (components.player.weapon === 3) {
        components.player.engageWeaponBonus()
      }
    }
  }

  async engageWeaponBonus() {
    this.weaponBonusOn = true
    components.foreground.weaponBonusSprite.visible = true

    await new Promise<void>((resolve) => {
      Timeout.instantiate(
        "wb",
        () => {
          resolve()
        },
        playerWeaponBonusDuration1
      )
    })

    this.weaponBonusBlinkInterval = setInterval(() => {
      components.foreground.weaponBonusSprite.visible =
        !components.foreground.weaponBonusSprite.visible
    }, playerWeaponBonusBlinkInterval)

    await new Promise<void>((resolve) => {
      Timeout.instantiate(
        "wb",
        () => {
          clearInterval(this.weaponBonusBlinkInterval)
          components.foreground.weaponBonusSprite.visible = false
          resolve()
        },
        playerWeaponBonusDuration2
      )
    })

    components.player.weapon = 2

    this.weaponBonusOn = false
  }

  //fire rate bonus
  async engageFireRateBonus(stage: number) {
    //if stage is 1 there is no real need to check anything
    //just set firerate to 1
    if (stage === 1) {
      this.setFireControlParams(
        playerFireControl.fireRate1.autofireInterval,
        playerFireControl.fireRate1.maxPlayerProjectilesFiredPerSecond
      )
      return
    }

    //in order to use firerate stage 2 current rate must be 1
    //and fireRateBonus must be false (bonus not already in effect)
    if (stage === 2) {
      if (
        !(
          this.autofireInterval ===
            playerFireControl.fireRate1.autofireInterval &&
          this.maxPlayerProjectilesFiredPerSecond ===
            playerFireControl.fireRate1.maxPlayerProjectilesFiredPerSecond &&
          this.fireRateBonusOn === false
        )
      )
        return
    }

    this.fireRateBonusOn = true
    components.foreground.fireRateBonusSprite.visible = true

    this.setFireControlParams(
      playerFireControl.fireRate2.autofireInterval,
      playerFireControl.fireRate2.maxPlayerProjectilesFiredPerSecond
    )

    await new Promise<void>((resolve) => {
      Timeout.instantiate(
        "frb",
        () => {
          resolve()
        },
        playerFireRateBonusDuration1
      )
    })

    this.fireRateBonusBlinkInterval = setInterval(() => {
      components.foreground.fireRateBonusSprite.visible =
        !components.foreground.fireRateBonusSprite.visible
    }, playerFireRateBonusBlinkInterval)

    await new Promise<void>((resolve) => {
      Timeout.instantiate(
        "frb",
        () => {
          clearInterval(this.fireRateBonusBlinkInterval)
          components.foreground.fireRateBonusSprite.visible = false
          resolve()
        },
        playerFireRateBonusDuration2
      )
    })

    this.setFireControlParams(
      playerFireControl.fireRate1.autofireInterval,
      playerFireControl.fireRate1.maxPlayerProjectilesFiredPerSecond
    )
    this.fireRateBonusOn = false
  }

  //cannonball bonus
  async engageCannonballBonus() {
    if (this.cannonballBonusOn === true) return
    this.cannonballBonusOn = true
    components.foreground.cannonballBonusSprite.visible = true

    await new Promise<void>((resolve) => {
      Timeout.instantiate(
        "cbb",
        () => {
          resolve()
        },
        playerCannonballBonusDuration1
      )
    })

    this.cannonballBonusBlinkInterval = setInterval(() => {
      components.foreground.cannonballBonusSprite.visible =
        !components.foreground.cannonballBonusSprite.visible
    }, playerCannonballBonusBlinkInterval)

    await new Promise<void>((resolve) => {
      Timeout.instantiate(
        "cbb",
        () => {
          clearInterval(this.cannonballBonusBlinkInterval)
          components.foreground.cannonballBonusSprite.visible = false
          resolve()
        },
        playerCannonballBonusDuration2
      )
    })

    this.cannonballBonusOn = false
  }
}
