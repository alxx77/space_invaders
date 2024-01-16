import { TextStyle } from "pixi.js"

export const sound = {
  ambienceSound: { play: false, volume: 0.3 },
  soundFX: { play: true, volume: 0.1 },
}

export const playerSpeed = 5

export const projectileSpeed = 5

export const invaderHeight = 32
export const invaderWidth = 44

export const invaderXMargin = 10 
export const invaderYMargin = 10  


//font styles
export const fontStyles = {
  effectsFlyingMulti: new TextStyle({
    fontFamily: "Troika ",
    fontSize: "64px",
    fill: "red",
  }),
  effectsFlyingMultiOutline: new TextStyle({
    fontFamily: "Troika ",
    fontSize: "72px",
    fill: "gray",
  }),

  gamePanelCredit: new TextStyle({
    fontFamily: "Troika ",
    fontSize: "64px",
    fill: "#d69b33",
    dropShadow: true,
    dropShadowColor: "red",
    dropShadowDistance: 5,
  }),
  gamePanelWin: new TextStyle({
    fontFamily: "Troika ",
    fontSize: "72px",
    fill: "white",
    dropShadow: true,
    dropShadowColor: "red",
    dropShadowDistance: 5,
  }),
  gamePanelBet: new TextStyle({
    fontFamily: "Troika ",
    fontSize: "48px",
    fill: "white",
    dropShadow: true,
    dropShadowColor: "red",
    dropShadowDistance: 5,
  }),

  winFeedbackText: new TextStyle({
    fontFamily: "Troika ",
    fontSize: "64px",
    fill: "red",
  }),

  winBoardLabel: new TextStyle({
    fontFamily: "Troika ",
    fontSize: "64px",
    fill: "orange",
  }),
  winBoardMulti: new TextStyle({
    fontFamily: "Troika ",
    fontSize: "96px",
    fill: "orange",
  }),
  skipFeatureText: new TextStyle({
    fontFamily: "Troika ",
    fontSize: "42px",
    fill: "#dbc8c8",
    dropShadow: true,
    dropShadowColor: "red",
    dropShadowDistance: 5,
  }),
}

export const soundSource = {
  clickButton: "assets/spin-button_click.mp3",
  clickReel: "assets/reel_spinning_click.mp3",
}
