import { Container, Sprite, utils, Texture } from "pixi.js"
import { stageHeight, stageWidth } from "../settings"

export class Background extends Container {
  container: Container
  private backgroundSprite: Sprite
  constructor() {
    super()
    //container
    this.container = new Container()
    this.name = "background"
    this.addChild(this.container)

    //sprite
    this.backgroundSprite = new Sprite(utils.TextureCache['space'])
    this.backgroundSprite.width = stageWidth
    this.backgroundSprite.height = stageHeight
    this.container.addChild(this.backgroundSprite)
  }

  updateLayout(width: number, height: number) {
        // desired w/h ratio of grid
        let backgroundRatio = 4/3

        // parent
        let layoutRatio = width / height
    
        // grid dimensions
        let bgHeight = 0
        let bgWidth = 0
    
        //if renderer aspect ratio is wider, game height is first calculated
        if (layoutRatio > backgroundRatio) {
          bgHeight = Math.max(height, 250)
    
          //recalculate width
          bgWidth = bgHeight * backgroundRatio
        } else {
          //if renderer aspect ratio is more narrow
          //means width is constraining factor and is calculated first
          bgWidth = Math.max(Math.min(width, 1280), 480) 
    
          //recalculate height
          bgHeight = bgWidth / backgroundRatio
        }
    
        //set stage dimensions
        this.width = bgWidth
        this.height = bgHeight

  }
}
