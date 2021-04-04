import {Container, Sprite, Texture, ObservablePoint} from "pixi.js"
import {EnemyGraphic} from "../../world/Types";
import {cache, TextureAtlas} from "../../Resources";
import {Sprite2x2Offsets} from "./Types";

enum EnemySize {
    s1x1 = 0,
    s2x2 = 1
}

export class EnemyRender extends Container {

    private static childId = 0;

    public readonly cycle: ObservablePoint;
    private readonly atlas: TextureAtlas;
    private readonly graphic: number[];

    public constructor (enemy: EnemyGraphic) {
        super();
        this.name = `e${++EnemyRender.childId}`;
        this.atlas = cache.enemyShapeBanks[enemy.shapeBank];
        this.graphic = enemy.graphic;
        this.position.set(enemy.position.x, enemy.position.y);
        this.cycle = new ObservablePoint(this.updateAnimation, this, 0, 0);

        switch (enemy.size) {
            case EnemySize.s2x2:
                this.addChild(
                    new Sprite(new Texture(this.atlas.texture, this.atlas.frames[this.graphic[0] + Sprite2x2Offsets.TOP_LEFT])),
                    new Sprite(new Texture(this.atlas.texture, this.atlas.frames[this.graphic[0] + Sprite2x2Offsets.TOP_RIGHT])),
                    new Sprite(new Texture(this.atlas.texture, this.atlas.frames[this.graphic[0] + Sprite2x2Offsets.BTM_LEFT])),
                    new Sprite(new Texture(this.atlas.texture, this.atlas.frames[this.graphic[0] + Sprite2x2Offsets.BTM_RIGHT])),
                );
                (<Sprite>this.children[0]).anchor.set(1, 1);
                (<Sprite>this.children[1]).anchor.set(0, 1);
                (<Sprite>this.children[2]).anchor.set(1, 0);
                (<Sprite>this.children[3]).anchor.set(0, 0);
                break;
            case EnemySize.s1x1:
                this.addChild(new Sprite(new Texture(this.atlas.texture, this.atlas.frames[this.graphic[0]])));
                (<Sprite>this.children[0]).anchor.set(0.5, 0.5);
                break;
            default: throw new Error('eh?')
        }
    }

    private updateAnimation (): void {
        switch (this.children.length) {
            case 4:
                (<Sprite>this.children[0]).texture.frame = this.atlas.frames[this.graphic[this.cycle.x] + Sprite2x2Offsets.TOP_LEFT];
                (<Sprite>this.children[1]).texture.frame = this.atlas.frames[this.graphic[this.cycle.x] + Sprite2x2Offsets.TOP_RIGHT];
                (<Sprite>this.children[2]).texture.frame = this.atlas.frames[this.graphic[this.cycle.x] + Sprite2x2Offsets.BTM_LEFT];
                (<Sprite>this.children[3]).texture.frame = this.atlas.frames[this.graphic[this.cycle.x] + Sprite2x2Offsets.BTM_RIGHT];
                break;
            case 1:
                (<Sprite>this.children[0]).texture.frame = this.atlas.frames[this.graphic[this.cycle.x]];
                break;
            default: throw new Error('eh?')
        }
    }
}
