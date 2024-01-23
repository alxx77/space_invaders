import { TextStyle } from "pixi.js"

export const sound = {
  ambienceSound: { play: false, volume: 0.3 },
  soundFX: { play: true, volume: 0.1 },
}

export const playerSpeed = 5

export const projectileSpeed = 8
export const invaderProjectileSpeed = 2.5

export const playerSlideInSpeed = 5

export const invaderHeight = 32
export const invaderWidth = 44

export const invaderXMargin = 10
export const invaderYMargin = 10

export const stageWidth = 1280
export const stageHeight = 960

export const backgroundScrollTimePerSprite = 7000

export const minHeight = 240
export const minWidth = 320

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
}

export const soundSource = {
  playerProjectile: "assets/sounds/player_projectile.mp3",
  playerExplosion: "assets/sounds/player_explosion.mp3",
  invaderExplosion: "assets/sounds/invader_explosion.mp3",
  invaderProjectile: "assets/sounds/invader_projectile.mp3",
  levelCompleted: "assets/sounds/level_completed.mp3",
  playerEngine:"assets/sounds/engineSound.mp3",
  startPlay:"assets/sounds/game_start.mp3",
  gameOver:"assets/sounds/game_over.mp3",
  gameTheme:"assets/sounds/theme.mp3"
}
