import { initGame } from "./initGame"
import { Game } from "./game"
import { components } from "./state"
import "../styles/main.scss"

//start game
;(async () => {
  //initialize
  const data = await initGame()

  //an instance of slot machine can be created
  //and is taking over control & loop
  components.game = new Game()
})()
