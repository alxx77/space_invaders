import { TextStyle } from "pixi.js"

export const sound = {
  music: { play: true, highVolume: 0.7, lowVolume: 0.15 },
  soundFX: { play: true, volume: 0.1 },
}

export const playerSpeed = 10

export const projectileSpeed = 24
export const invaderProjectileSpeed = 4

export const playerSlideInSpeed = 8

export const playerShieldDuration1 = 6000
export const playerShieldDuration2 = 2000

export const invadersSlideInSpeed = 6

export const invaderHeight = 32
export const invaderWidth = 44

export const invaderScaleFactor = 1.5

export const playerHeight = 50
export const playerWidth = 48

export const playerScaleFactor = 2

export const playerMaxDamage = 3

//solo invader speed, pause MS, projectile speed
export const soloInvaderSpecsPerLevel = [
  [0, 0, 0],
  [5, 1500, 4],
  [5, 1500, 5],
  [5, 1500, 6],
  [5, 1200, 6],
  [6, 1200, 7],
  [6, 1200, 7],
  [6, 900, 8],
  [7, 900, 8],
  [7, 900, 8],
  [7, 800, 9],
  [10, 700, 11],
]

export const playerFireControl = {
  fireRate0: {
    autofireInterval: 330,
    maxPlayerProjectilesFiredPerSecond: 3,
  },

  fireRate1: {
    autofireInterval: 280,
    maxPlayerProjectilesFiredPerSecond: 4,
  },
  fireRate2: {
    autofireInterval: 200,
    maxPlayerProjectilesFiredPerSecond: 5,
  },
}

export const playerWeaponBonusDuration1 = 3500
export const playerWeaponBonusDuration2 = 1600
export const playerWeaponBonusBlinkInterval = 180

export const playerFireRateBonusDuration1 = 3500
export const playerFireRateBonusDuration2 = 1600
export const playerFireRateBonusBlinkInterval = 180

export const playerCannonballBonusDuration1 = 2500
export const playerCannonballBonusDuration2 = 1250
export const playerCannonballBonusBlinkInterval = 150

export const invaderXMargin = 10
export const invaderYMargin = 10

export const stageWidth = 1080
export const stageHeight = 2340

export const backgroundScrollTimePerSprite = 7000

export const minHeight = 240
export const minWidth = 320

export const finalLevel = 11

//font styles
export const fontStyles = {
  scoreText: new TextStyle({
    fontFamily: "Arcade",
    fontSize: "42px",
    fill: "#d69b33",
    dropShadow: false,
    dropShadowColor: "red",
    dropShadowDistance: 5,
  }),
  startText: new TextStyle({
    fontFamily: "Arcade",
    fontSize: "58px",
    fill: "white",
    dropShadow: true,
    dropShadowColor: "blue",
    dropShadowDistance: 3,
  }),

  levelCompletedText: new TextStyle({
    fontFamily: "Troika",
    fontStyle: "italic",
    fontSize: "60px",
    fill: "blue",
    dropShadow: true,
    dropShadowColor: "gray",
    dropShadowDistance: 3,
  }),
  levelCompleted2Text: new TextStyle({
    fontFamily: "Troika",
    fontStyle: "italic",
    fontSize: "32px",
    fill: "gray",
    dropShadow: true,
    dropShadowColor: "blue",
    dropShadowDistance: 2,
  }),
  splashText: new TextStyle({
    fontFamily: "Arcade",
    fontSize: "96px",
    fill: "white",
    dropShadow: true,
    dropShadowColor: "black",
    dropShadowDistance: 3,
  }),
  shieldTextWhite: new TextStyle({
    fontFamily: "Arcade",
    fontSize: "56px",
    fill: "white",
    dropShadow: true,
    dropShadowColor: "black",
    dropShadowDistance: 3,
  }),
  shieldTextRed: new TextStyle({
    fontFamily: "Arcade",
    fontSize: "56px",
    fill: "red",
    dropShadow: true,
    dropShadowColor: "white",
    dropShadowDistance: 3,
  }),
  healthText: new TextStyle({
    fontFamily: "Troika",
    fontSize: "60px",
    fill: "yellow",
    dropShadow: false,
    dropShadowColor: "white",
    dropShadowDistance: 3,
  }),
  bonus1Text: new TextStyle({
    fontFamily: "Arcade",
    fontSize: "36px",
    fill: "red",
    dropShadow: true,
    dropShadowColor: "gray",
    dropShadowDistance: 2,
  }),
  bonus2Text: new TextStyle({
    fontFamily: "Arcade",
    fontSize: "36px",
    fill: "orange",
    dropShadow: true,
    dropShadowColor: "gray",
    dropShadowDistance: 2,
  }),
}

export const soundSource = {
  playerProjectile: "assets/sounds/player_projectile.mp3",
  playerExplosion: "assets/sounds/player_explosion.mp3",
  invaderExplosion: "assets/sounds/invader_explosion.mp3",
  invaderProjectile: "assets/sounds/invader_projectile.mp3",
  levelCompleted: "assets/sounds/level_completed.mp3",
  playerEngine: "assets/sounds/engineSound.mp3",
  startPlay: "assets/sounds/game_start.mp3",
  gameOver: "assets/sounds/game_over.mp3",
  gameTheme: "assets/sounds/theme.mp3",
  gameCompleted: "assets/sounds/game_completed.mp3",
  bonusCreated: "assets/sounds/bonus_created.mp3",
  bonusCollected: "assets/sounds/bonus_collected.mp3",
  bonusEnds: "assets/sounds/bonus_ends.mp3",
}
