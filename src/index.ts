import { initGame } from "./initGame"
import { Game } from "./game"
import { components, state } from "./state"
import "../styles/main.scss"
import { reaction } from "mobx"

const waitForSpacebarKeyPress = async () => {
  return new Promise<void>((resolve) => {
    let disposer = reaction(
      () => state.SPACEBAR_keyPressed,
      (newVal) => {
        if (newVal === true) {
          resolve()
          disposer()
        }
      }
    )
  })
}

//start game
;(async () => {
  //initialize
  const data = await initGame()

  //create an instance of game
  components.game = new Game()

  //wait for space bar
  await waitForSpacebarKeyPress()

  //show components
  components.background.visible = true
  components.foreground.visible = true
  components.splashScreen.visible = false
  state.setSplashScreenVisible(false)

  //start theme
  components.foreground.gameTheme.play()

  //start
  components.game.play()
})()
