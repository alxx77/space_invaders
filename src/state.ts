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
import { SplashScreen } from "./components/splashScreen"

export type PlayerDirection = "none" | "up" | "down" | "left" | "right"

class Store {
  _LEFT_keyPressed: boolean
  _DOWN_keyPressed: boolean
  _RIGHT_keyPressed: boolean
  _UP_keyPressed: boolean
  _SPACEBAR_keyPressed: boolean
  _lastKeyPressed: string
  _projectiles: Projectile[]
  _invaderProjectiles: InvaderProjectile[]
  _invaders: Invader[]
  _gameLevel: number
  _playerAlive: boolean
  _playerDestructionCompletedTrigger: number
  _invandersActive: boolean
  _scoreCounter: number
  _livesCounter: number
  _invaderDestroyed: number
  _currentLevelCompleted: boolean
  _waitingForGameStart: boolean
  _waitingForLevelCompletedTextToClose: boolean
  _playerActive: boolean
  _splashScreenVisible: boolean
  _mobileDevice: boolean

  constructor() {
    this._LEFT_keyPressed = false
    this._DOWN_keyPressed = false
    this._RIGHT_keyPressed = false
    this._UP_keyPressed = false
    this._SPACEBAR_keyPressed = false
    this._lastKeyPressed = ""
    this._projectiles = []
    this._invaderProjectiles = []
    this._invaders = []
    this._gameLevel = 0
    this._playerAlive = false
    this._invandersActive = false
    this._scoreCounter = 0
    this._livesCounter = 0
    this._invaderDestroyed = 0
    this._currentLevelCompleted = false
    this._waitingForGameStart = false
    this._playerDestructionCompletedTrigger = 0
    this._waitingForLevelCompletedTextToClose = false
    this._playerActive = false
    this._splashScreenVisible = true
    this._mobileDevice = false
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

  //Status of Space bar
  @action
  set_SPACEBAR_keyPressed(value: boolean) {
    this._SPACEBAR_keyPressed = value
  }
  @computed
  get SPACEBAR_keyPressed() {
    return this._SPACEBAR_keyPressed
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
    if (
      this.LEFT_keyPressed &&
      (this.lastKeyPressed === "A" || this.lastKeyPressed === "ArrowLeft")
    ) {
      return "left"
    }

    if (
      this.DOWN_keyPressed &&
      (this.lastKeyPressed === "S" || this.lastKeyPressed === "ArrowDown")
    ) {
      return "down"
    }

    if (
      this.RIGHT_keyPressed &&
      (this.lastKeyPressed === "D" || this.lastKeyPressed === "ArrowRight")
    ) {
      return "right"
    }

    if (
      this.UP_keyPressed &&
      (this.lastKeyPressed === "W" || this.lastKeyPressed === "ArrowUp")
    ) {
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
    return this._invaderProjectiles.splice(index, 1)
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
    return this._invaders.splice(index, 1)
  }

  @computed
  get invaders() {
    return this._invaders
  }

  @action
  setPlayerAlive(value: boolean) {
    this._playerAlive = value
  }

  @computed
  get playerAlive() {
    return this._playerAlive
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
  triggerInvaderDestroyed() {
    this._invaderDestroyed++
  }

  @computed
  get invaderDestroyed() {
    return this._invaderDestroyed
  }

  @action
  setCurrentLevelCompleted(value: boolean) {
    this._currentLevelCompleted = value
  }

  @computed
  get currentLevelCompleted() {
    return this._currentLevelCompleted
  }

  @action
  setWaitingForGameStart(value: boolean) {
    this._waitingForGameStart = value
  }

  @computed
  get WaitingForGameStart() {
    return this._waitingForGameStart
  }

  @action
  triggerPlayerDestructionCompleted() {
    this._playerDestructionCompletedTrigger++
  }

  @computed
  get playerDestructionCompletedTrigger() {
    return this._playerDestructionCompletedTrigger
  }

  @action
  setWaitingForLevelCompletedTextToClose(value: boolean) {
    this._waitingForLevelCompletedTextToClose = value
  }

  @computed
  get WaitingForLevelCompletedTextToClose() {
    return this._waitingForLevelCompletedTextToClose
  }

  @action
  setPlayerActive(value: boolean) {
    this._playerActive = value
  }

  @computed
  get playerActive() {
    return this._playerActive
  }

  @action
  setSplashScreenVisible(value: boolean) {
    this._splashScreenVisible = value
  }

  @computed
  get splashScreenVisible() {
    return this._splashScreenVisible
  }

  @action
  setMobileDevice(value: boolean) {
    this._mobileDevice = value
  }

  @computed
  get mobileDevice() {
    return this._mobileDevice
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
  splashScreen: SplashScreen
}

export const components = {} as Components
