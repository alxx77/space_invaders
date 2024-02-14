import { Container } from "pixi.js"
import { components, state } from "../state"
import { SmartContainer } from "./smartContainer"
import { Invader } from "./invader"
import {
  invaderHeight,
  invaderScaleFactor,
  invaderWidth,
  invaderXMargin,
  invaderYMargin,
  invadersSlideInSpeed,
  soloInvaderSpecsPerLevel,
  stageHeight,
  stageWidth,
} from "../settings"
import { reaction } from "mobx"
import { getRandomNumber, getRandomWebColor } from "../utils"
import Timeout from "smart-timeout"
import { InvaderProjectile } from "./invaderProjectile"
import { SoloInvader } from "./soloInvader"
import { getLevelData } from "../levelData"

export type InvaderData = {
  x: number
  y: number
  variety: number
}

type MoveSequenceParams = [x: number, y: number, s: number]

//root container
export class Invaders extends SmartContainer {
  container: Container
  public name: string
  private initialContainerWidth: number
  private intervalRegular: NodeJS.Timeout | undefined
  private intervalSolo: NodeJS.Timeout | undefined
  initialInvadersCount: number
  static shootCounter: number
  static shotsEnded: number
  constructor() {
    super()
    this.name = "Invaders"

    //container
    this.container = new Container()
    this.addChild(this.container)
    components.foreground.container.addChild(this)

    this.cbOnTweenUpdate = this.collisionTestWithPlayer
    this.initialContainerWidth = 0

    //when all invaders are destroyed
    //while player is active & alive
    reaction(
      () => ({
        invadersLength: state.invaders.length,
        invaderProjectiles: state.invaderProjectiles.length,
      }),
      (newVal) => {
        //invaders must be active in order to call level completed
        //because invaders can be cleared manually after game is over
        //but that removal of invaders cannot be interpreted here as level completed
        if (!state.invadersActive) return
        if (newVal.invadersLength === 0 && newVal.invaderProjectiles === 0) {
          //stop moving & shooting
          state.setInvadersActive(false)

          //*** level can be completed even if player died ***
          //if player & invader shoot each other at the same time
          state.setCurrentLevelCompleted(true)
        }
      }
    )

    //when invaders should stop
    reaction(
      () => state.invadersActive,
      (newVal) => {
        if (newVal === false) {
          this.stopMove()
          this.stopShooting()
        } else {
          this.startMove()
          this.startShooting()
          this.startShootingSolos()
        }
      }
    )

    this.initialInvadersCount = 0
  }

  async startMove() {
    //start solo invaders first
    const soloList = state.invaders.filter(
      (el) => el.constructor.name === "SoloInvader"
    )

    for (const solo of soloList) {
      ;(solo as SoloInvader).active = true
      ;(solo as SoloInvader).startMoving()
    }

    //move group
    const g = this.movesGenerator(this)
    for await (const nextMove of g) {
      if (state.invadersActive === false) break
    }
  }

  stopMove() {
    const soloList = state.invaders.filter(
      (el) => el.constructor.name === "SoloInvader"
    )

    for (const solo of soloList) {
      ;(solo as SoloInvader).active = false
      solo.stopTween()
    }

    this.stopTween()
  }

  stopShooting() {
    if (components.invaders.intervalRegular) {
      clearInterval(components.invaders.intervalRegular)
    }
    if (components.invaders.intervalSolo) {
      clearInterval(components.invaders.intervalSolo)
    }
  }

  async slideIn() {
    const promises: Promise<void>[] = []
    const soloList = state.invaders.filter(
      (el) => el.constructor.name === "SoloInvader"
    )

    for (const solo of soloList) {
      solo.visible = true
      promises.push(solo.moveTo(stageWidth / 2 - solo.width / 2, 50, 5))
    }

    this.x = stageWidth / 2 - this.width / 2
    this.y = -this.height - 50
    this.visible = true

    promises.push(
      this.moveTo(
        stageWidth / 2 - this.width / 2,
        stageHeight * 0.15,
        invadersSlideInSpeed
      )
    )

    return Promise.all(promises)
  }

  moveOutOfSight() {
    state.setInvadersActive(false)

    const soloList = state.invaders.filter(
      (el) => el.constructor.name === "SoloInvader"
    )

    for (const solo of soloList) {
      solo.x = stageWidth / 2 - this.width / 2
      solo.y = -this.height - 50
    }

    this.x = stageWidth / 2 - this.width / 2
    this.y = -this.height - 50
  }

  startShooting() {
    const self = this
    this.intervalRegular = setInterval(function () {
      if (state.invaders.length === 0) {
        clearInterval(self.intervalRegular)
        return
      }
      const percentInvadersRemained =
        state.invaders.length / self.initialInvadersCount

      let previousInvaderIndex = 0
      for (const iterator of [1, 2, 3, 4, 5, 6]) {
        let invaderIndex = Math.floor(Math.random() * state.invaders.length)
        if (previousInvaderIndex === invaderIndex) break
        previousInvaderIndex = invaderIndex
        const invader = state.invaders[invaderIndex]
        const p = Math.random() < percentInvadersRemained * 0.7 + 0.2
        if (p === true) {
          const timeout = Timeout.instantiate(
            "shoot",
            () => invader.shoot(),
            Math.random() * 75
          )
        }
      }
    }, 600 - (75 * state.gameLevel) / 2)
  }

  startShootingSolos() {
    const self = this

    if (state.invaders.length === 0) {
      clearInterval(self.intervalSolo)
      return
    }

    this.intervalSolo = setInterval(function () {
      const soloList = state.invaders.filter(
        (el) => el.constructor.name === "SoloInvader"
      )

      for (const solo of soloList) {
        if (getRandomNumber() < 0.5) {
          Timeout.instantiate(
            "shoot",
            () => (solo as SoloInvader).shootSolo(),
            Math.random() * 150
          )
        }
      }
    }, 800 - 45 * state.gameLevel)
  }

  movesGenerator = function* (self: Invaders) {
    function* innerG(): Generator<MoveSequenceParams, void, void> {
      yield [stageWidth - self.initialContainerWidth, self.y, 1]
      yield [self.x, self.y + 100, 0.5 * 3]
      yield [0, self.y, 1]
      yield [self.x, self.y + 100, 0.5 * 3]
    }

    for (let index = 0; index < 40; index++) {
      const ig = innerG()
      for (const targetData of ig) {
        yield self.moveTo(...targetData)
      }
    }
  }

  createInvadersForCurrentLevel() {
    //clear invaders first
    //in case of playing game again
    this.clearAllInvaders()

    state.setLastBonusTimeStamp(0)

    const gen = getLevelData(state.gameLevel, this)
    for (const invaderData of gen) {
      const invader = new Invader(
        { x: invaderData.x, y: invaderData.y },
        invaderData.variety
      )
      state.addInvader(invader)
      this.container.addChild(invader)
    }
    this.initialContainerWidth = this.container.width
    this.x = stageWidth / 2 - this.width / 2
    this.y = stageHeight * 0.15

    //create solo invaders
    let n = 0
    let v = 5

    switch (state.gameLevel) {
      case 1:
      case 2:
        n = 2
        break
      case 3:
      case 4:
        n = 4
        break

      case 5:
      case 6:
        n = 6
        break

      case 7:
      case 8:
        n = 6
        v = 6
        break

      case 9:
      case 10:
        n = 8
        v = 6
        break

      case 11:
        n = 14
        v = 6
        break

      default:
        break
    }

    for (let i = 0; i < n; i++) {
      let projectileSpeed = soloInvaderSpecsPerLevel[state.gameLevel][2]
      let speed =
        soloInvaderSpecsPerLevel[state.gameLevel][0] + getRandomNumber() * 3
      let movePause =
        soloInvaderSpecsPerLevel[state.gameLevel][1] + getRandomNumber() * 250
      //make extra spicy invader ;-)
      if (i === n - 1) {
        projectileSpeed = Math.min(projectileSpeed + 2, 11)
        speed = Math.min(speed + 2, 10)
        movePause = Math.max(movePause / 1.5, 700)
        v = 7
      }
      const solo = new SoloInvader(
        { x: -50, y: 50 },
        v,
        projectileSpeed,
        speed,
        movePause
      )
      state.addInvader(solo)
      components.foreground.container.addChild(solo)
    }

    this.initialInvadersCount = state.invaders.length
  }

  resetPosition() {
    const promises: Promise<void>[] = []
    const soloList = state.invaders.filter(
      (el) => el.constructor.name === "SoloInvader"
    )

    for (const solo of soloList) {
      promises.push(solo.moveTo(stageWidth / 2 - solo.width / 2, 50, 8))
    }

    promises.push(
      this.moveTo(
        (stageWidth - this.initialContainerWidth) / 2,
        stageHeight * 0.15,
        5
      )
    )

    return Promise.all(promises)
  }

  clearAllInvaders() {
    for (let index = state.invaders.length - 1; index >= 0; index--) {
      const invader = state.removeInvader(index)[0]
      invader.destroy()
    }
  }

  async clearAllInvadersProjectiles() {
    const promises: Promise<void>[] = []
    for (let index = state.invaderProjectiles.length - 1; index >= 0; index--) {
      promises.push(
        InvaderProjectile.removeProjectile(
          state.invaderProjectiles[index],
          false,
          true
        )
      )
    }
    const count = promises.length
    await Promise.all(promises)
    return count
  }



  removeInvader(invader: Invader) {
    const i = state.invaders.findIndex((el) => el === invader)

    if (invader.constructor.name === "SoloInvader") {
      invader.stopTween()
      ;(invader as SoloInvader).active = false
    }

    state.removeInvader(i)
    invader.sprite.visible = false
    invader.explosionSprite.scale.set(0.5 + Math.random())
    invader.explosionSprite.tint = getRandomWebColor()
    invader.explosionSprite.visible = true
    invader.explosionSprite.play()
    Invader.explosionSound.volume(0.05 + Math.random() * 0.1)
    Invader.explosionSound.play()
    invader.explosionSprite.onComplete = () => {
      invader.destroy()
    }
  }

  prepareLevelData = function* (
    levelData: string[]
  ): Generator<InvaderData, void, void> {
    let rowCounter = 0
    for (const row of levelData) {
      let col = 0
      const columns = row.split(",")
      for (const column of columns) {
        //if there should be an invader
        if (column !== "0") {
          yield {
            x: col * (invaderWidth * invaderScaleFactor + invaderXMargin),
            y:
              rowCounter *
              (invaderHeight * invaderScaleFactor + invaderYMargin),
            variety: Number.parseInt(column),
          }
        }
        col++
      }
      rowCounter++
    }
  }

  collisionTestWithPlayer(c: SmartContainer) {
    if (state.invadersActive === false) return

    //first check if invaders are out of screen
    //if yes player dies
    if (this.y > stageHeight && state.invaders.length > 0) {
      state.setPlayerAlive(false)
      state.setInvadersActive(false)
      return
    }

    const bounds1 = components.player.sprite.getBounds()
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
        state.setInvadersActive(false)
        state.setPlayerAlive(false)
        this.removeInvader(invader)
        return
      }
    }
  }
}
