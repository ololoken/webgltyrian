import { Container, Sprite, Texture, ObservablePoint } from 'pixi.js'
import { COMP_TILE_HEIGHT, COMP_TILE_WIDTH } from '../../Const';
import { EnemySize } from '../../Structs';
import { IEnemyGraphic } from '../../world/Types';
import { Sprite2x2Offsets } from './Types';
import { cache, TextureAtlas } from '../../Resources';

export class EnemyRender extends Container {

    private static childId = 0;

    public readonly cycle: ObservablePoint;
    private readonly atlas: TextureAtlas;
    private readonly graphic: number[];

    public constructor (enemy: IEnemyGraphic) {
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
                (<Sprite>this.children[0]).position.set(0, 0);
                (<Sprite>this.children[1]).position.set(COMP_TILE_WIDTH, 0);
                (<Sprite>this.children[2]).position.set(0, COMP_TILE_HEIGHT);
                (<Sprite>this.children[3]).position.set(COMP_TILE_WIDTH, COMP_TILE_HEIGHT);
                break;
            case EnemySize.s1x1:
                this.addChild(new Sprite(new Texture(this.atlas.texture, this.atlas.frames[this.graphic[0]])));
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
