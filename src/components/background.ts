import { Container, Sprite, utils, Texture } from "pixi.js"

export class Background extends Container {
  private container: Container
  private backgroundSprite: Sprite
  constructor() {
    super()
    //container
    this.container = new Container()
    this.name = "background"
    this.addChild(this.container)

    //sprite
    this.backgroundSprite = new Sprite(Texture.WHITE)
    this.backgroundSprite.width = 1280
    this.backgroundSprite.height = 960
    this.container.addChild(this.backgroundSprite)

    this.backgroundSprite.tint = '#777777'
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
