import {Container, ObservablePoint, Sprite, Texture} from "pixi.js";
import {IPlayerGraphic} from "../../world/Types";
import {cache, TextureAtlas} from "../../Resources";
import {Sprite2x2Offsets} from "./Types";

export class PlayerRender extends Container {
    public readonly animationStep: ObservablePoint;
    private readonly atlas: TextureAtlas;
    private readonly ship: number;

    constructor (player: IPlayerGraphic) {
        super();
        this.name = 'player';
        this.ship = player.shipGraphic;
        this.atlas = cache.mainShapeBanks[player.shapeBank];

        this.addChild(
            new Sprite(new Texture(this.atlas.texture, this.atlas.frames[this.ship + Sprite2x2Offsets.TOP_LEFT])),
            new Sprite(new Texture(this.atlas.texture, this.atlas.frames[this.ship + Sprite2x2Offsets.TOP_RIGHT])),
            new Sprite(new Texture(this.atlas.texture, this.atlas.frames[this.ship + Sprite2x2Offsets.BTM_LEFT])),
            new Sprite(new Texture(this.atlas.texture, this.atlas.frames[this.ship + Sprite2x2Offsets.BTM_RIGHT]))
        );
        (<Sprite>this.children[0]).anchor.set(1, 1);
        (<Sprite>this.children[1]).anchor.set(0, 1);
        (<Sprite>this.children[2]).anchor.set(1, 0);
        (<Sprite>this.children[3]).anchor.set(0, 0);

        this.position.copyFrom(player.position);

        this.animationStep = new ObservablePoint(this.updateAnimation, this, player.shipGraphic, 0);
    }

    private updateAnimation (): void {
        (<Sprite>this.children[0]).texture.frame = this.atlas.frames[this.animationStep.x + Sprite2x2Offsets.TOP_LEFT];
        (<Sprite>this.children[1]).texture.frame = this.atlas.frames[this.animationStep.x + Sprite2x2Offsets.TOP_RIGHT];
        (<Sprite>this.children[2]).texture.frame = this.atlas.frames[this.animationStep.x + Sprite2x2Offsets.BTM_LEFT];
        (<Sprite>this.children[3]).texture.frame = this.atlas.frames[this.animationStep.x + Sprite2x2Offsets.BTM_RIGHT];
    }
}
