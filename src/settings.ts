import { TextStyle } from "pixi.js"

export const sound = {
  music: { play: false, highVolume: 0.7, lowVolume : 0.15 },
  soundFX: { play: true, volume: 0.1 },
}

export const playerSpeed = 5

export const projectileSpeed = 24
export const invaderProjectileSpeed = 3.5

export const playerSlideInSpeed = 8

export const invaderHeight = 32 * 1.5
export const invaderWidth = 44 * 1.5 

export const invaderXMargin = 10
export const invaderYMargin = 10

export const stageWidth = 1080
export const stageHeight = 2340

export const backgroundScrollTimePerSprite = 7000

export const minHeight = 240
export const minWidth = 320

export const finalLevel = 7



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
  gameTheme:"assets/sounds/theme.mp3",
  gameCompleted:"assets/sounds/game_completed.mp3",
  bonusCreated:"assets/sounds/bonus_created.mp3",
  bonusCollected:"assets/sounds/bonus_collected.mp3"
}
