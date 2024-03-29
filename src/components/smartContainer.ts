import { Point, Container } from "pixi.js"
import * as TWEEN from "@tweenjs/tween.js"

type FinalPosition = { x: number | undefined; y: number| undefined }

export class SmartContainer extends Container {
  private finalPosition: FinalPosition
  private tween: TWEEN.Tween<this>
  public skipFeatureRequested: boolean
  public cbOnTweenUpdate: Function | undefined
  public easingFunction: any
  elapsed = 0
  constructor() {
    super()
    this.finalPosition = {} as FinalPosition
    this.tween = {} as TWEEN.Tween<this>
    this.skipFeatureRequested = false
  }

  //perform move to given location
  async moveTo(xPos: number, yPos: number, speed: number, onEnd? : Function) {
    // x&y distances
    let xDist = xPos - this.position.x
    let yDist = yPos - this.position.y

    const self = this

    //total distance traveled
    let totalDist = Math.sqrt(xDist ** 2 + yDist ** 2)

    //time required
    let totalTime = totalDist * 10 * (1 / speed)

    //save target position
    //so dynamic tweening works
    this.finalPosition = { x: xPos, y: yPos }

    // important when dynamic tweening
    // new instances of target object should not be used 
    //once tween starts  
    return new Promise<void>((resolve) => {
      this.tween = new TWEEN.Tween(self)
        .to(self.finalPosition, totalTime)
        .easing(this.easingFunction)
        .dynamic(true) //allow dynamic tween
        .onUpdate(function(a,elapsed){
          if(self.cbOnTweenUpdate){
            self.cbOnTweenUpdate()
            self.elapsed = elapsed
          }
        })
        .onComplete(() => {
          (onEnd) ? onEnd() : undefined
          resolve()
        })
        .onStop(() => {
          resolve()
        })
        .start()
    })
  }

  stopTween(){
    this.tween.stop()
  }

  endTween(){
    this.tween.end()
  }

  setEasingFunction(e: any){
    this.easingFunction = e
  }

  goToFinalPosition() {
    if(!(this.finalPosition.x && this.finalPosition.y)) return
    this.tween.pause()
    this.x = this.finalPosition.x
    this.y = this.finalPosition.y
    this.tween.stop()
    this.skipFeatureRequested = true
  }

  //update move dinamically
  updateMove(point: Point) {
    this.finalPosition.x = point.x
    this.finalPosition.y = point.y
  }
}
