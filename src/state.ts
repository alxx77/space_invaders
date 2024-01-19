import { action, makeAutoObservable, computed } from "mobx"
import { Renderer } from "pixi.js"
import { Layout } from "./components/layout"
import { Game } from "./game"
import { Player } from "./components/player"
import { Background } from "./components/background"
import { Projectile } from "./components/projectile"
import { Invaders } from "./components/invaders"
import { Invader } from "./components/invader"
import { Foreground } from "./components/foreground"
import { InvaderProjectile } from "./components/invaderProjectile"

export type PlayerDirection = "none" | "up" | "down" | "left" | "right"

class Store {
  _LEFT_keyPressed: boolean
  _DOWN_keyPressed: boolean
  _RIGHT_keyPressed: boolean
  _UP_keyPressed: boolean
  _SpaceBar_keyPressed: boolean
  _lastKeyPressed: string
  _projectiles: Projectile[]
  _invaderProjectiles: InvaderProjectile[]
  _invaders: Invader[]
  _gameLevel: number
  _allInvadersDestroyed: boolean
  _playerDestroyed: boolean
  _invandersActive: boolean
  _scoreCounter: number
  _livesCounter: number
  _invaderDestroyed: boolean

  constructor() {
    this._LEFT_keyPressed = false
    this._DOWN_keyPressed = false
    this._RIGHT_keyPressed = false
    this._UP_keyPressed = false
    this._SpaceBar_keyPressed = false
    this._lastKeyPressed = ""
    this._projectiles = []
    this._invaderProjectiles = []
    this._invaders = []
    this._gameLevel = 1
    this._allInvadersDestroyed = false
    this._playerDestroyed = false
    this._invandersActive = true
    this._scoreCounter = 0
    this._livesCounter = 0
    this._invaderDestroyed = false

    makeAutoObservable(this, {}, { autoBind: true })
  }

  //A key
  @action
  set_LEFT_keyPressed(value: boolean) {
    this._LEFT_keyPressed = value
  }
  @computed
  get LEFT_keyPressed() {
    return this._LEFT_keyPressed
  }

  //S key
  @action
  set_DOWN_keyPressed(value: boolean) {
    this._DOWN_keyPressed = value
  }
  @computed
  get DOWN_keyPressed() {
    return this._DOWN_keyPressed
  }

  //D key
  @action
  set_RIGHT_keyPressed(value: boolean) {
    this._RIGHT_keyPressed = value
  }
  @computed
  get RIGHT_keyPressed() {
    return this._RIGHT_keyPressed
  }

  //W key
  @action
  set_UP_keyPressed(value: boolean) {
    this._UP_keyPressed = value
  }
  @computed
  get UP_keyPressed() {
    return this._UP_keyPressed
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
    if (this.LEFT_keyPressed && (this.lastKeyPressed === "A" || this.lastKeyPressed === "ArrowLeft")) {
      return "left"
    }

    if (this.DOWN_keyPressed && (this.lastKeyPressed === "S" || this.lastKeyPressed === "ArrowDown")) {
      return "down"
    }

    if (this.RIGHT_keyPressed && (this.lastKeyPressed === "D" || this.lastKeyPressed === "ArrowRight")) {
      return "right"
    }

    if (this.UP_keyPressed && (this.lastKeyPressed === "W" || this.lastKeyPressed === "ArrowUp")) {
      return "up"
    }

    const totalKeysPressed = [
      this.LEFT_keyPressed,
      this.RIGHT_keyPressed,
      this.UP_keyPressed,
      this.DOWN_keyPressed,
    ].reduce((acc, el) => {
      if (el === true) acc++
      return acc
    }, 0)

    if (totalKeysPressed > 1) {
      return "none"
    }

    if (this.LEFT_keyPressed) {
      return "left"
    }

    if (this.DOWN_keyPressed) {
      return "down"
    }

    if (this.RIGHT_keyPressed) {
      return "right"
    }

    if (this.UP_keyPressed) {
      return "up"
    }

    return "none"
  }

  @action
  addProjectile(projectile: Projectile) {
    this._projectiles.push(projectile)
  }

  @action
  removeProjectile(index: number) {
    this._projectiles.splice(index, 1)
  }

  @computed
  get projectiles() {
    return this._projectiles
  }

  @action
  addInvaderProjectile(invaderProjectile: InvaderProjectile) {
    this._invaderProjectiles.push(invaderProjectile)
  }

  @action
  removeInvaderProjectile(index: number) {
    this._invaderProjectiles.splice(index, 1)
  }

  @computed
  get invaderProjectiles() {
    return this._invaderProjectiles
  }

  @action
  addInvader(invader: Invader) {
    this._invaders.push(invader)
  }

  @action
  removeInvader(index: number) {
    this._invaders.splice(index, 1)
    if (this._invaders.length === 0) {
      this.setAllInvadersDestroyed(true)
    }
  }

  @computed
  get invaders() {
    return this._invaders
  }

  @action
  setAllInvadersDestroyed(value: boolean) {
    this._allInvadersDestroyed = value
  }

  @computed
  get allInvadersDestroyed() {
    return this._allInvadersDestroyed
  }

  @action
  setPlayerDestroyed(value: boolean) {
    this._playerDestroyed = value
  }

  @computed
  get playerDestroyed() {
    return this._playerDestroyed
  }

  @action
  setInvadersActive(value: boolean) {
    this._invandersActive = value
  }

  @computed
  get invadersActive() {
    return this._invandersActive
  }

  @action
  setScoreCounter(value: number) {
    this._scoreCounter = value
  }

  @computed
  get scoreCounter() {
    return this._scoreCounter
  }

  @action
  setLivesCounter(value: number) {
    this._livesCounter = value
  }

  @computed
  get livesCounter() {
    return this._livesCounter
  }

  @action
  setGameLevel(value: number) {
    this._gameLevel = value
  }

  @computed
  get gameLevel() {
    return this._gameLevel
  }

  @action
  setInvaderDestroyed(value: boolean) {
    this._invaderDestroyed = value
  }

  @computed
  get invaderDestroyed() {
    return this._invaderDestroyed
  }
}

export const state = new Store()

type Components = {
  renderer: Renderer
  layout: Layout
  game: Game
  player: Player
  background: Background
  foreground: Foreground
  invaders: Invaders
}

export const components = {} as Components
