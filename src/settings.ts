import { TextStyle } from "pixi.js"

export const sound = {
  ambienceSound: { play: false, volume: 0.3 },
  soundFX: { play: true, volume: 0.1 },
}

export const playerSpeed = 5

export const projectileSpeed = 8
export const invaderProjectileSpeed = 3

export const playerSlideInSpeed = 5

export const invaderHeight = 32
export const invaderWidth = 44

export const invaderXMargin = 10
export const invaderYMargin = 10

export const stageWidth = 1280
export const stageHeight = 960

export const backgroundScrollTimePerSprite = 7000

export const minHeight = 360
export const minWidth = 480

//font styles
export const fontStyles = {
  scoreText: new TextStyle({
    fontFamily: "Troika ",
    fontSize: "42px",
    fill: "#d69b33",
    dropShadow: true,
    dropShadowColor: "red",
    dropShadowDistance: 5,
  }),
  startText: new TextStyle({
    fontFamily: "Troika ",
    fontStyle: "italic",
    fontSize: "64px",
    fill: "white",
    dropShadow: true,
    dropShadowColor: "red",
    dropShadowDistance: 5,
  }),

  levelCompletedText: new TextStyle({
    fontFamily: "Troika ",
    fontStyle: "italic",
    fontSize: "60px",
    fill: "blue",
    dropShadow: true,
    dropShadowColor: "gray",
    dropShadowDistance: 3,
  }),
  levelCompleted2Text: new TextStyle({
    fontFamily: "Troika ",
    fontStyle: "italic",
    fontSize: "32px",
    fill: "gray",
    dropShadow: true,
    dropShadowColor: "blue",
    dropShadowDistance: 2,
  }),
}

export const soundSource = {
  playerProjectile: "assets/sounds/player_projectile.ogg",
  playerExplosion: "assets/sounds/player_explosion.ogg",
  invaderExplosion: "assets/sounds/invader_explosion.ogg",
  invaderProjectiles: [
    "assets/sounds/laserLarge_000.ogg",
    "assets/sounds/laserLarge_001.ogg",
    "assets/sounds/laserLarge_002.ogg",
    "assets/sounds/laserLarge_003.ogg",
    "assets/sounds/laserLarge_004.ogg",
  ],
  levelCompleted: "assets/sounds/level_completed.mp3",
  playerEngine:"assets/sounds/engineSound.ogg"
}
