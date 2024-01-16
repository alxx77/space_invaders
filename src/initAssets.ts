import { Assets } from "pixi.js"



async function loadAssets() {
  const manifest = {
    bundles: [
      {
        name: "player",
        assets: [
          { alias: "player", src: "assets/images/player.png" },
          { alias: "projectile", src: "assets/images/projectile.png" },
        ],
      },
      {
        name: "invaders",
        assets: [
          { alias: "invader1", src: "assets/images/enemy1.png" },
          { alias: "invader2", src: "assets/images/enemy2.png" },
          { alias: "invader3", src: "assets/images/enemy3.png" },

        ],
      },
      // {
      //   name: "buttons",
      //   assets: [
      //     { alias: "spin_button", src: "assets/spin_button.png" },
      //     { alias: "plus_button", src: "assets/plus_button.png" },
      //     { alias: "minus_button", src: "assets/minus_button.png" },
      //   ],
      // },


      // {
      //   name: "background",
      //   assets: [
      //     {
      //       alias: "main_background",
      //       src: "assets/dark-wood-grain-texture_HD.jpg",
      //     },
      //   ],
      // },
      {
        name: "fonts",
        assets: [
          {
            alias: "troika",
            src: "assets/troika.otf",
          },
        ],
      },
    ],
  }

  await Assets.init({ manifest })

  // Load a bundle...
  await Assets.loadBundle("player")

  await Assets.loadBundle("invaders")

  await Assets.loadBundle("fonts")
}

export async function initAssets() {
  await loadAssets()

  console.log("assets loaded")
}
