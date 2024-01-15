import { action, makeAutoObservable, computed } from "mobx"
import { Renderer } from "pixi.js"
import { Layout } from "./components/layout"
import { Game } from "./game"
import { Player } from "./components/player"
import { Background } from "./components/background"
import { Projectile } from "./components/projectile"

export type PlayerDirection = "none" | "up" | "down" | "left" | "right"

class Store {
  _A_keyPressed: boolean
  _S_keyPressed: boolean
  _D_keyPressed: boolean
  _W_keyPressed: boolean
  _SpaceBar_keyPressed: boolean
  _lastKeyPressed: string
  _projectiles: Projectile[]

  constructor() {
    this._A_keyPressed = false
    this._S_keyPressed = false
    this._D_keyPressed = false
    this._W_keyPressed = false
    this._SpaceBar_keyPressed = false
    this._lastKeyPressed = ""
    this._projectiles = []
    makeAutoObservable(this)
  }

  //A key
  @action
  set_A_keyPressed(value: boolean) {
    this._A_keyPressed = value
  }
  @computed
  get A_keyPressed() {
    return this._A_keyPressed
  }

  //S key
  @action
  set_S_keyPressed(value: boolean) {
    this._S_keyPressed = value
  }
  @computed
  get S_keyPressed() {
    return this._S_keyPressed
  }

  //D key
  @action
  set_D_keyPressed(value: boolean) {
    this._D_keyPressed = value
  }
  @computed
  get D_keyPressed() {
    return this._D_keyPressed
  }

  //W key
  @action
  set_W_keyPressed(value: boolean) {
    this._W_keyPressed = value
  }
  @computed
  get W_keyPressed() {
    return this._W_keyPressed
  }

  //Ctrl key
  @action
  set_SpaceBar_keyPressed(value: boolean) {
    this._SpaceBar_keyPressed = value
  }
  @computed
  get SpaceBar_keyPressed() {
    return this._SpaceBar_keyPressed
  }

  //last key that was pressed from A,S,D or W keys
  @action
  setLastKeyPressed(value: string) {
    this._lastKeyPressed = value
  }
  @computed
  get lastKeyPressed() {
    return this._lastKeyPressed
  }

  @computed
  get getPlayerDirection(): PlayerDirection {
    if (this.A_keyPressed && this.lastKeyPressed === "A") {
      return "left"
    }

    if (this.S_keyPressed && this.lastKeyPressed === "S") {
      return "down"
    }

    if (this.D_keyPressed && this.lastKeyPressed === "D") {
      return "right"
    }

    if (this.W_keyPressed && this.lastKeyPressed === "W") {
      return "up"
    }

    const totalKeysPressed = [
      this.A_keyPressed,
      this.D_keyPressed,
      this.W_keyPressed,
      this.S_keyPressed,
    ].reduce((acc, el) => {
      if (el === true) acc++
      return acc
    }, 0)

    if (totalKeysPressed > 1) {
      return "none"
    }

    if (this.A_keyPressed) {
      return "left"
    }

    if (this.S_keyPressed) {
      return "down"
    }

    if (this.D_keyPressed) {
      return "right"
    }

    if (this.W_keyPressed) {
      return "up"
    }

    return "none"
  }

  @computed
  get projectiles() {
    return this._projectiles
  }
}

export const state = new Store()

type Components = {
  renderer: Renderer
  layout: Layout
  game: Game
  player: Player
  background: Background
}

export const components = {} as Components
