import {Container, Sprite, Texture, ObservablePoint} from "pixi.js"
import {EnemyGraphic} from "../../world/Types";
import {cache, TextureAtlas} from "../../Resources";
import {COMP_TILE_HEIGHT, COMP_TILE_WIDTH} from "../../Structs";

enum Enemy2x2SpriteOffsets {
    TOP_LEFT = 0,
    TOP_RIGHT = 1,
    BTM_LEFT = 19,
    BTM_RIGHT = 20,
}

enum EnemySize {
    s1x1 = 0,
    s2x2 = 1
}

export class EnemyRender extends Container {

    private static childId = 0;

    private readonly group: Sprite[] = [];
    public readonly cycle: ObservablePoint;
    private readonly atlas: TextureAtlas;
    private readonly graphic: number[];

    public constructor (enemy: EnemyGraphic) {
        super();
        this.name = `e${++EnemyRender.childId}`;
        this.atlas = cache.enemyShapeBanks[enemy.shapeBank];
        this.graphic = enemy.graphic;
        this.position.set(enemy.position.x, enemy.position.y);
        this.cycle = new ObservablePoint(this.updateAnimation, this, enemy.animationCycle, 0);

        switch (enemy.size) {
            case EnemySize.s2x2:
                this.group.push(
                    new Sprite(new Texture(this.atlas.texture, this.atlas.frames[this.graphic[0] + Enemy2x2SpriteOffsets.TOP_LEFT])),
                    new Sprite(new Texture(this.atlas.texture, this.atlas.frames[this.graphic[0] + Enemy2x2SpriteOffsets.TOP_RIGHT])),
                    new Sprite(new Texture(this.atlas.texture, this.atlas.frames[this.graphic[0] + Enemy2x2SpriteOffsets.BTM_LEFT])),
                    new Sprite(new Texture(this.atlas.texture, this.atlas.frames[this.graphic[0] + Enemy2x2SpriteOffsets.BTM_RIGHT])),
                );
                this.group[0].position.set(0, 0);
                this.group[1].position.set(COMP_TILE_WIDTH, 0);
                this.group[2].position.set(0, COMP_TILE_HEIGHT);
                this.group[3].position.set(COMP_TILE_WIDTH, COMP_TILE_HEIGHT);
                break;
            case EnemySize.s1x1:
                this.group.push(new Sprite(new Texture(this.atlas.texture, this.atlas.frames[this.graphic[0]])));
                this.group[0].position.set(0, 0);
                break;
        }

        this.addChild(...this.group);
        this.pivot.set(this.width/2, this.height/2);
    }

    private updateAnimation (): void {
        switch (this.group.length) {
            case 4:
                this.group[0].texture.frame = this.atlas.frames[this.graphic[this.cycle.x] + Enemy2x2SpriteOffsets.TOP_LEFT];
                this.group[1].texture.frame = this.atlas.frames[this.graphic[this.cycle.x] + Enemy2x2SpriteOffsets.TOP_RIGHT];
                this.group[2].texture.frame = this.atlas.frames[this.graphic[this.cycle.x] + Enemy2x2SpriteOffsets.BTM_LEFT];
                this.group[3].texture.frame = this.atlas.frames[this.graphic[this.cycle.x] + Enemy2x2SpriteOffsets.BTM_RIGHT];
                break;
            case 1:
                this.group[0].texture.frame = this.atlas.frames[this.graphic[this.cycle.x]];
                break;
            default: throw new Error('eh?')
        }
    }
}
