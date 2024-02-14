import Timeout from "smart-timeout"
import * as TWEEN from "@tweenjs/tween.js"
import {
  stageHeight,
  stageWidth,
} from "../settings"
import { components, state } from "../state"
import { getRandomNumber } from "../utils"
import { Invader } from "./invader"
import { InvaderProjectile } from "./invaderProjectile"

export class SoloInvader extends Invader {
  public active: boolean
  private projectileSpeed:number
  private speed: number
  private movePause
  constructor(position: { x: number; y: number }, variety: number, projectileSpeed:number, speed:number, movePause: number) {
    super({ x: position.x, y: position.y }, variety)
    this.active = true
    this.setEasingFunction(TWEEN.Easing.Quadratic.InOut)
    this.cbOnTweenUpdate = this.onTweenUpdate
    this.projectileSpeed = projectileSpeed
    this.speed = speed
    this.movePause = movePause
  }

  async startMoving() {
    while (this.active) {
      const x = getRandomNumber() * stageWidth
      const y = getRandomNumber() * stageHeight * 0.2

      await new Promise<void>((resolve) => {
        Timeout.instantiate(
          () => resolve(),
          this.movePause
        )
      })

      if (this.active) {
        await this.moveTo(
          x,
          y,
          this.speed
        )
      } else {
        break
      }
    }
  }

  shoot() {
    //do nothing
  }

  onTweenUpdate() {
    if (
      this.x > stageWidth + 50 ||
      this.x < -50 ||
      this.y > stageHeight + 50 ||
      this.y < -50
    ) {
      this.endTween()
    }
  }

  calculateDirectionVector(x1: number, y1: number, x2: number, y2: number) {
    const dx = x2 - x1
    const dy = y2 - y1
    const magnitude = Math.sqrt(dx * dx + dy * dy)
    return { dx: dx / magnitude, dy: dy / magnitude }
  }

  calculateIntersectionPoints(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    displayWidth: number,
    displayHeight: number
  ) {
    const intersections = []

    // Calculate the slope of the line passing through (x1, y1) and (x2, y2)
    const slope = (y2 - y1) / (x2 - x1)

    // Calculate intersection with top edge
    const intersectionTop = {
      x: (displayHeight - y1) / slope + x1,
      y: displayHeight,
    }
    if (intersectionTop.x >= 0 && intersectionTop.x <= displayWidth) {
      intersections.push(intersectionTop)
    }

    // Calculate intersection with bottom edge
    const intersectionBottom = { x: -y1 / slope + x1, y: 0 }
    if (intersectionBottom.x >= 0 && intersectionBottom.x <= displayWidth) {
      intersections.push(intersectionBottom)
    }

    // Calculate intersection with left edge
    const intersectionLeft = { x: 0, y: slope * (0 - x1) + y1 }
    if (intersectionLeft.y >= 0 && intersectionLeft.y <= displayHeight) {
      intersections.push(intersectionLeft)
    }

    // Calculate intersection with right edge
    const intersectionRight = {
      x: displayWidth,
      y: slope * (displayWidth - x1) + y1,
    }
    if (intersectionRight.y >= 0 && intersectionRight.y <= displayHeight) {
      intersections.push(intersectionRight)
    }

    return intersections
  }

  calculateIntersectionInDirection(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    displayWidth: number,
    displayHeight: number
  ) {
    // Calculate direction vector of the object's motion
    const directionVector = this.calculateDirectionVector(x1, y1, x2, y2)

    // Calculate intersection points with display boundaries
    const intersections = this.calculateIntersectionPoints(
      x1,
      y1,
      x2,
      y2,
      displayWidth,
      displayHeight
    )

    // Calculate dot product of direction vector with direction from first point to each intersection point
    const dotProducts = intersections.map((intersection) => {
      const dx = intersection.x - x1
      const dy = intersection.y - y1
      const magnitude = Math.sqrt(dx * dx + dy * dy)
      const directionX = dx / magnitude
      const directionY = dy / magnitude
      return directionVector.dx * directionX + directionVector.dy * directionY
    })

    // Find the intersection point with the highest dot product value
    const maxDotProductIndex = dotProducts.indexOf(Math.max(...dotProducts))
    return intersections[maxDotProductIndex]
  }

  //this will be handled by different method than for regular invaders
  async shootSolo() {
    const projectile = new InvaderProjectile(
      {
        x: this.x + this.width / 2,
        y: this.y + this.height / 2,
      },
      this.projectileSpeed,
      2
    )

    const thirdPoint = this.calculateIntersectionInDirection(
      this.x,
      this.y * 1.05,
      components.player.x,
      components.player.y,
      stageWidth,
      stageHeight
    )

    state.addInvaderProjectile(projectile)
    components.foreground.container.addChild(projectile)
    InvaderProjectile.shootSound.play()

    return projectile.moveTo(thirdPoint.x, thirdPoint.y, projectile.speed, () => {
      const i = state.invaderProjectiles.findIndex((el) => el === projectile)
      //if allready removed - return
      if (i < 0) return
      state.removeInvaderProjectile(i)
      projectile.destroy()
      InvaderProjectile.projectileCompleted++
    })
  }
}
