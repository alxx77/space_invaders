import { initGame } from "./initGame"
import { Game } from "./game"
import { components } from "./state"
import "../styles/main.scss"

//start game
;(async () => {
  //initialize
  const data = await initGame()

  //create an instance of game
  components.game = new Game()

  //start
  components.game.play()

})()
