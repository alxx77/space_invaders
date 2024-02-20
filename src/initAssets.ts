import { Assets, BaseTexture } from "pixi.js"

async function loadAssets() {
  const manifest = {
    bundles: [
      {
        name: "player",
        assets: [
          { alias: "player", src: "assets/images/player.png" },
          { alias: "shield", src: "assets/images/shield_bonus.png" },
          { alias: "player_shield", src: "assets/images/player_shield.png" },
          { alias: "projectile_0", src: "assets/images/projectile_0.png" },
          { alias: "projectile_1", src: "assets/images/projectile_1.png" },
          { alias: "projectile_2", src: "assets/images/projectile_2.png" },
          { alias: "projectile_3", src: "assets/images/projectile_3.png" },
          { alias: "space", src: "assets/images/space.png" },
          { alias: "player_explosion", src: "assets/images/explosion.json" },
          { alias: "splash", src: "assets/images/space_splash.jpg" },
          { alias: "axes_1", src: "assets/images/axes_1.png" },
          { alias: "axes_2", src: "assets/images/axes_2.png" },
          {
            alias: "bonus_health",
            src: "assets/images/shield_bonus_health.png",
          },
          {
            alias: "bonus_weapon_upgrade",
            src: "assets/images/shield_bonus_weapon_upgrade.png",
          },
          {
            alias: "bonus_weapon_upgrade2",
            src: "assets/images/shield_bonus_weapon_upgrade_II.png",
          },
        ],
      },
      {
        name: "invaders",
        assets: [
          { alias: "invader1", src: "assets/images/enemy1.png" },
          { alias: "invader2", src: "assets/images/enemy2.png" },
          { alias: "invader3", src: "assets/images/enemy3.png" },
          { alias: "invader4", src: "assets/images/enemy4.png" },
          { alias: "invader5", src: "assets/images/enemy5.png" },
          { alias: "invader6", src: "assets/images/enemy6.png" },
          { alias: "invader7", src: "assets/images/enemy7.png" },
          {
            alias: "invader_projectile_0",
            src: "assets/images/invader_projectile_0.png",
          },
          {
            alias: "invader_projectile_1",
            src: "assets/images/invader_projectile_1.png",
          },
          {
            alias: "invader_projectile_2",
            src: "assets/images/invader_projectile_2.png",
          },
          {
            alias: "invader_explosion",
            src: "assets/images/explosion_invader.json",
          },
        ],
      },
      {
        name: "fonts",
        assets: [
          {
            alias: "troika",
            src: "assets/troika.otf",
          },
          {
            alias: "arcade",
            src: "assets/ARCADE.TTF",
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
