import { Container } from "pixi.js"
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
import { getRandomWebColor } from "../utils"

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
    reaction(
      () => ({
        invadersLength: state.invaders.length,
        invaderProjectiles: state.invaderProjectiles.length,
      }),
      (newVal) => {
        if (
          newVal.invadersLength === 0 &&
          newVal.invaderProjectiles === 0
        ) {
          this.stopTween()

          //stop shooting
          if (components.invaders.interval) {
            clearInterval(components.invaders.interval)
          }

          //check if player is alive
          if (state.playerAlive) {
            //if yes it means that level is completed
            state.setCurrentLevelCompleted(true)
          }
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
  }

  async startMove() {
    let g = this.movesGenerator(this)
    for await (const nextMove of g) {
      if (state.invadersActive === false) break
    }
  }

  stopMove(){
    this.stopTween()
  }

  stopShooting(){
    if (components.invaders.interval) {
      clearInterval(components.invaders.interval)
    }
  }

  fadeIn(){
    
  }

  startShooting() {
    const self = this
    this.interval = setInterval(function () {
      if (state.invaders.length === 0) {
        clearInterval(self.interval)
        return
      }
      const percentInvadersRemained = state.invaders.length / 33
      for (const iterator of [1, 2, 3, 4]) {
        let invader =
          state.invaders[Math.floor(Math.random() * state.invaders.length)]
        const p = Math.random() < percentInvadersRemained * 0.3 + 0.1
        if (p === true) {
          invader.shoot()
        }
      }
    }, 500)
  }

  movesGenerator = function* (self: Invaders) {
    function* innerG(): Generator<MoveSequenceParams, void, void> {
      yield [stageWidth - self.initialContainerWidth, self.y, 1]
      yield [self.x, self.y + 50, 0.5]
      yield [0, self.y, 1]
      yield [self.x, self.y + 50, 0.5]
    }

    for (const i of [1, 2, 3, 4, 5, 6]) {
      const ig = innerG()
      for (const targetData of ig) {
        yield self.moveTo(...targetData)
      }
    }
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
    this.initialContainerWidth = this.container.width
  }

  removeInvader(invader: Invader) {
    const i = state.invaders.findIndex((el) => el === invader)
    state.removeInvader(i)
    invader.sprite.visible = false
    invader.explosionSprite.scale.set(0.5 + Math.random())
    invader.explosionSprite.tint = getRandomWebColor()
    invader.explosionSprite.visible = true
    invader.explosionSprite.play()
    invader.explosionSprite.onComplete = () => {
      invader.destroy()
    }
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

  collisionTestWithPlayer(c: SmartContainer) {
    if (state.invadersActive === false) return
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
        components.invaders.removeInvader(invader)
        return
      }
    }
  }

  updateLayout(width: number, height: number) {}
}
