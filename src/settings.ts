import { TextStyle } from "pixi.js"

export const sound = {
  ambienceSound: { play: false, volume: 0.3 },
  soundFX: { play: true, volume: 0.1 },
}

export const playerSpeed = 5

export const projectileSpeed = 8
export const invaderProjectileSpeed = 3

export const invaderHeight = 32
export const invaderWidth = 44

export const invaderXMargin = 10
export const invaderYMargin = 10

export const stageWidth = 1280
export const stageHeight = 960

export const backgroundScrollTimePerSprite = 7000

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
    fontSize: "64px",
    fill: "white",
    dropShadow: true,
    dropShadowColor: "red",
    dropShadowDistance: 5,
  }),
}

export const soundSource = {
  // clickButton: "assets/spin-button_click.mp3",
  // clickReel: "assets/reel_spinning_click.mp3",
}
