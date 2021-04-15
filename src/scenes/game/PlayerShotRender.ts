import {Sprite, Texture, ObservablePoint} from "pixi.js"
import {PlayerShotGraphic} from "../../world/Types";
import {cache, TextureAtlas} from "../../Resources";

export class PlayerShotRender extends Sprite {

    private static childId = 0;

    public readonly cycle: ObservablePoint;
    private readonly atlas: TextureAtlas;
    private readonly graphic: number;

    public constructor (shot: PlayerShotGraphic) {
        super(new Texture(cache.mainShapeBanks[shot.shapeBank].texture, cache.mainShapeBanks[shot.shapeBank].frames[shot.graphic[0]]));
        this.atlas = cache.mainShapeBanks[shot.shapeBank];
        this.graphic = shot.graphic[0];
        this.name = `ps${++PlayerShotRender.childId}`;
        this.position.set(shot.position.x, shot.position.y);
        this.cycle = new ObservablePoint(this.updateAnimation, this, 0, 0);
    }

    private updateAnimation (): void {
        this.texture.frame = this.atlas.frames[this.graphic+this.cycle.x];
    }
}
