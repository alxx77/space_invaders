import { InvaderData, Invaders } from "./components/invaders"

export function* getLevelData (
    level: number,
    self: Invaders
  ): Generator<InvaderData, void, void> {
    let levelData = []
    switch (level) {
      case 1:
        levelData.push("1,1,1,0,0,0,0,0,1,1,1")
        levelData.push("2,2,1,1,1,1,1,1,1,2,2")
        levelData.push("2,2,2,2,2,2,2,2,2,2,2")
        levelData.push("3,3,3,3,3,3,3,3,3,3,3")
        levelData.push("0,0,0,3,3,3,3,3,0,0,0")

        yield* self.prepareLevelData(levelData)

        break

      case 2:
        levelData.push("4,4,4,0,0,0,4,4,4")
        levelData.push("2,2,4,4,4,4,4,2,2")
        levelData.push("0,2,2,2,2,2,2,2,0")
        levelData.push("0,0,1,1,1,1,1,0,0")
        levelData.push("0,2,2,2,2,2,2,2,0")
        levelData.push("2,2,0,0,0,0,0,2,2")
        levelData.push("4,4,0,0,0,0,0,4,4")

        yield* self.prepareLevelData(levelData)

        break

      case 3:
        levelData.push("4,4,4,4,0,4,4,4,4")
        levelData.push("0,3,3,3,4,3,3,3,0")
        levelData.push("0,0,0,3,4,3,0,0,0")
        levelData.push("0,0,3,4,1,4,3,0,0")
        levelData.push("0,3,4,1,4,1,4,3,0")
        levelData.push("3,4,1,4,1,4,1,4,3")
        levelData.push("0,3,4,1,4,1,4,3,0")
        levelData.push("0,0,3,4,1,4,3,0,0")
        levelData.push("0,0,0,3,4,3,0,0,0")
        levelData.push("0,0,0,0,3,0,0,0,0")

        yield* self.prepareLevelData(levelData)

        break

      case 4:
        levelData.push("1,1,1,1,4,4,4,1,1,1,1")
        levelData.push("2,2,2,2,2,4,2,2,2,2,2")
        levelData.push("0,3,3,3,3,3,3,3,3,3,0")
        levelData.push("0,0,0,0,4,3,4,0,0,0,0")
        levelData.push("0,1,1,1,1,1,1,1,1,1,0")
        levelData.push("2,2,2,2,2,0,2,2,2,2,2")
        levelData.push("3,3,3,3,0,0,0,3,3,3,3")

        yield* self.prepareLevelData(levelData)
        break

      case 5:
        levelData.push("4,4,4,4,4,4,4,4,4,4,4")
        levelData.push("4,4,4,4,4,4,4,4,4,4,4")
        levelData.push("0,2,2,2,2,0,2,2,2,2,0")
        levelData.push("0,0,3,3,3,3,3,3,3,0,0")
        levelData.push("0,0,0,2,2,2,2,2,0,0,0")
        levelData.push("0,0,0,0,1,1,1,0,0,0,0")
        levelData.push("0,0,0,0,0,1,0,0,0,0,0")

        yield* self.prepareLevelData(levelData)
        break

      case 6:
        levelData.push("4,4,4,4,4,4,4,4,4,4,4")
        levelData.push("4,4,4,4,4,4,4,4,4,4,4")
        levelData.push("3,4,3,4,3,4,3,4,3,4,3")
        levelData.push("3,3,3,3,3,3,3,3,3,3,3")
        levelData.push("1,3,1,3,1,3,1,3,1,3,1")
        levelData.push("0,1,0,1,0,1,0,1,0,1,0")

        yield* self.prepareLevelData(levelData)
        break

      case 7:
        levelData.push("4,4,4,4,4,4,4,4,4,4,4")
        levelData.push("4,4,4,4,4,4,4,4,4,4,4")
        levelData.push("4,4,4,4,4,4,4,4,4,4,4")
        levelData.push("3,3,3,3,3,3,3,3,3,3,3")
        levelData.push("3,3,3,3,3,3,3,3,3,3,3")
        levelData.push("2,2,2,2,2,2,2,2,2,2,2")
        levelData.push("0,2,2,2,2,2,2,2,2,2,0")
        levelData.push("0,0,1,1,1,1,1,1,1,0,0")
        levelData.push("0,0,0,1,1,1,1,1,0,0,0")
        levelData.push("0,0,0,0,1,1,1,0,0,0,0")
        levelData.push("0,0,0,0,0,1,0,0,0,0,0")

        yield* self.prepareLevelData(levelData)
        break

      case 8:
        levelData.push("0,0,0,0,0,3,0,0,0,0,0")
        levelData.push("0,0,0,0,3,3,3,0,0,0,0")
        levelData.push("0,0,0,3,3,2,3,3,0,0,0")
        levelData.push("0,0,3,3,2,2,2,3,3,0,0")
        levelData.push("0,3,3,2,2,4,2,2,3,3,0")
        levelData.push("3,3,2,2,4,1,4,3,2,3,3")
        levelData.push("0,3,3,2,2,4,2,2,3,3,0")
        levelData.push("0,0,3,3,2,2,2,3,3,0,0")
        levelData.push("0,0,0,3,3,2,3,3,0,0,0")
        levelData.push("0,0,0,0,3,3,3,0,0,0,0")
        levelData.push("0,0,0,0,0,3,0,0,0,0,0")

        yield* self.prepareLevelData(levelData)
        break

      case 9:
        levelData.push("0,0,0,3,3,2,3,3,0,0,0")
        levelData.push("0,0,3,3,2,2,2,3,3,0,0")
        levelData.push("0,3,3,2,2,4,2,2,3,3,0")
        levelData.push("3,3,2,2,4,1,4,3,2,3,3")
        levelData.push("0,3,3,2,2,4,2,2,3,3,0")
        levelData.push("0,0,3,3,2,2,2,3,3,0,0")
        levelData.push("0,0,0,3,3,2,3,3,0,0,0")

        yield* self.prepareLevelData(levelData)
        break

      case 10:
        levelData.push("0,0,3,3,2,2,2,3,3,0,0")
        levelData.push("0,3,3,2,2,4,2,2,3,3,0")
        levelData.push("3,3,2,2,4,1,4,3,2,3,3")
        levelData.push("0,3,3,2,2,4,2,2,3,3,0")
        levelData.push("0,0,3,3,2,2,2,3,3,0,0")

        yield* self.prepareLevelData(levelData)
        break

      case 11:
        levelData.push("0,4,0,4,0,4,0,4,0,4,0")
        levelData.push("4,3,4,3,4,3,4,3,4,3,4")
        levelData.push("0,4,0,4,0,4,0,4,0,4,0")

        yield* self.prepareLevelData(levelData)
        break

      default:
        break
    }
  }