import { Container, Prepare } from "pixi.js"
import { components, state } from "../state"
import { SmartContainer } from "./smartContainer"
import { Invader } from "./invader"
import {
  invaderHeight,
  invaderWidth,
  invaderXMargin,
  invaderYMargin,
  stageHeight,
  stageWidth,
} from "../settings"
import { reaction } from "mobx"
import { getRandomNumber, getRandomWebColor } from "../utils"
import Timeout from "smart-timeout"
import { InvaderProjectile } from "./invaderProjectile"

type InvaderData = {
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
  interval: NodeJS.Timeout | undefined
  private initialInvadersCount: number
  static shootCounter: number
  static shotsEnded: number
  bonusCreatedForCurrentLevel: number[]
  constructor() {
    super()
    this.name = "Invaders"

    this.bonusCreatedForCurrentLevel = []

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
        }
      }
    )

    this.initialInvadersCount = 0
  }

  async startMove() {
    let g = this.movesGenerator(this)
    for await (const nextMove of g) {
      if (state.invadersActive === false) break
    }
  }

  stopMove() {
    this.stopTween()
  }

  stopShooting() {
    if (components.invaders.interval) {
      clearInterval(components.invaders.interval)
    }
  }

  startShooting() {
    const self = this
    this.interval = setInterval(function () {
      if (state.invaders.length === 0) {
        clearInterval(self.interval)
        return
      }
      const percentInvadersRemained =
        state.invaders.length / self.initialInvadersCount

      let previousInvaderIndex = 0
      for (const iterator of [1, 2, 3, 4]) {
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
    }, 600 - 75 * state.gameLevel)
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
    this.bonusCreatedForCurrentLevel = []

    const gen = this.getLevelData(state.gameLevel, this)
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

    this.initialInvadersCount = state.invaders.length
  }

  clearBonusWeapons() {
    this.bonusCreatedForCurrentLevel = []
  }

  resetPosition() {
    return this.moveTo(
      (stageWidth - this.initialContainerWidth) / 2,
      stageHeight * 0.15,
      5
    )
  }

  clearAllInvaders() {
    for (let index = state.invaders.length - 1; index >= 0; index--) {
      const invader = state.removeInvader(index)[0]
      invader.destroy()
    }
  }

  async clearAllInvadersProjectiles() {
    const promises: Promise<void>[] = []
    for (let index = state.invaderProjectiles.length-1; index >= 0; index--) {
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
    //create bonus weapon
    const percentageInvadersDestroyed =
      1 - state.invaders.length / this.initialInvadersCount
    const r = getRandomNumber()
    if (
      !this.bonusCreatedForCurrentLevel.includes(1) &&
      components.player.weaponType < 1
    ) {
      if (r <= percentageInvadersDestroyed) {
        if (getRandomNumber() < 0.15) {
          invader.createBonusWeapon(1)
          this.bonusCreatedForCurrentLevel.push(1)
        }
      }
    } else if (
      this.bonusCreatedForCurrentLevel.includes(1) &&
      !this.bonusCreatedForCurrentLevel.includes(2) &&
      components.player.weaponType < 2
    ) {
      if (r <= percentageInvadersDestroyed) {
        if (getRandomNumber() < 0.05) {
          invader.createBonusWeapon(2)
          this.bonusCreatedForCurrentLevel.push(2)
        }
      }
    }

    const i = state.invaders.findIndex((el) => el === invader)
    state.removeInvader(i)
    invader.sprite.visible = false
    invader.explosionSprite.scale.set(0.5 + Math.random())
    invader.explosionSprite.tint = getRandomWebColor()
    invader.explosionSprite.visible = true
    invader.explosionSprite.play()
    invader.explosionSound.volume(0.05 + Math.random() * 0.1)
    invader.explosionSound.play()
    invader.explosionSprite.onComplete = () => {
      invader.destroy()
    }
  }

  getLevelData = function* (
    level: number,
    self: Invaders
  ): Generator<InvaderData, void, void> {
    let levelData = []
    switch (level) {
      case 1:
        levelData.push("1,1,1,0,0,0,0,0,1,1,1")
        levelData.push("2,2,1,1,1,1,1,1,1,2,2")
        levelData.push("2,2,2,2,2,2,2,2,2,2,2")
        levelData.push("3,3,3,3,3,3,3,3,3,3,3")
        levelData.push("0,0,0,3,3,3,3,3,0,0,0")

        yield* self.prepareLevelData(levelData)

        break

      case 2:
        levelData.push("4,4,0,0,0,0,0,4,4")
        levelData.push("2,2,0,0,0,0,0,2,2")
        levelData.push("0,2,2,2,2,2,2,2,0")
        levelData.push("0,0,1,1,1,1,1,0,0")
        levelData.push("0,2,2,2,2,2,2,2,0")
        levelData.push("2,2,0,0,0,0,0,2,2")
        levelData.push("4,4,0,0,0,0,0,4,4")

        yield* self.prepareLevelData(levelData)

        break

      case 3:
        levelData.push("4,4,4,4,0,4,4,4,4")
        levelData.push("0,3,3,3,4,3,3,3,0")
        levelData.push("0,0,0,3,4,3,0,0,0")
        levelData.push("0,0,3,4,1,4,3,0,0")
        levelData.push("0,3,4,1,4,1,4,3,0")
        levelData.push("3,4,1,4,1,4,1,4,3")
        levelData.push("0,3,4,1,4,1,4,3,0")
        levelData.push("0,0,3,4,1,4,3,0,0")
        levelData.push("0,0,0,3,4,3,0,0,0")
        levelData.push("0,0,0,0,3,0,0,0,0")

        yield* self.prepareLevelData(levelData)

        break

      case 4:
        levelData.push("1,1,1,1,0,0,0,1,1,1,1")
        levelData.push("2,2,2,2,2,0,2,2,2,2,2")
        levelData.push("0,3,3,3,3,3,3,3,3,3,0")
        levelData.push("0,0,0,0,0,4,0,0,0,0,0")
        levelData.push("0,1,1,1,1,1,1,1,1,1,0")
        levelData.push("2,2,2,2,2,0,2,2,2,2,2")
        levelData.push("3,3,3,3,0,0,0,3,3,3,3")

        yield* self.prepareLevelData(levelData)
        break

      case 5:
        levelData.push("4,4,4,4,4,4,4,4,4,4,4")
        levelData.push("0,2,2,2,2,0,2,2,2,2,0")
        levelData.push("0,0,3,3,3,3,3,3,3,0,0")
        levelData.push("0,0,0,2,2,2,2,2,0,0,0")
        levelData.push("0,0,0,0,1,1,1,0,0,0,0")
        levelData.push("0,0,0,0,0,1,0,0,0,0,0")

        yield* self.prepareLevelData(levelData)
        break

      case 6:
        levelData.push("4,4,4,4,4,4,4,4,4,4,4")
        levelData.push("4,4,4,4,4,4,4,4,4,4,4")
        levelData.push("3,4,3,4,3,4,3,4,3,4,3")
        levelData.push("3,3,3,3,3,3,3,3,3,3,3")
        levelData.push("1,3,1,3,1,3,1,3,1,3,1")
        levelData.push("0,1,0,1,0,1,0,1,0,1,0")

        yield* self.prepareLevelData(levelData)
        break

      case 7:
        levelData.push("4,4,4,4,4,4,4,4,4,4,4")
        levelData.push("4,4,4,4,4,4,4,4,4,4,4")
        levelData.push("4,4,4,4,4,4,4,4,4,4,4")
        levelData.push("3,3,3,3,3,3,3,3,3,3,3")
        levelData.push("3,3,3,3,3,3,3,3,3,3,3")
        levelData.push("2,2,2,2,2,2,2,2,2,2,2")
        levelData.push("0,2,2,2,2,2,2,2,2,2,0")
        levelData.push("0,0,1,1,1,1,1,1,1,0,0")
        levelData.push("0,0,0,1,1,1,1,1,0,0,0")
        levelData.push("0,0,0,0,4,4,4,0,0,0,0")
        levelData.push("0,0,0,0,0,4,0,0,0,0,0")

        yield* self.prepareLevelData(levelData)
        break

      default:
        break
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
            x: col * (invaderWidth + invaderXMargin),
            y: rowCounter * (invaderHeight + invaderYMargin),
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

    const bounds1 = components.player.getBounds()
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

  updateLayout(width: number, height: number) {}
}
