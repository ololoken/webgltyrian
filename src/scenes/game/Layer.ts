import {Container, ObservablePoint, Sprite, Texture, Rectangle} from "pixi.js";
import {TileMapBackgroundFilter} from "../../filters/TileMapBackgroundFilter";
import {TextureAtlas, cache} from "../../Resources";
import {TILE_HEIGHT} from "../../Structs";
import {MAIN_HEIGHT, MAIN_WIDTH} from "../../Tyrian";
import {EnemyGraphic} from "../../world/Enemy";

type LayerBackOptions = {background: number[], shapesMapping: number[], width: number, height: number};

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

export class Layer extends Container {
    private readonly backSprite: Sprite;
    private readonly backRenderer: TileMapBackgroundFilter;

    public readonly backPos: ObservablePoint<Layer>;

    private objectsContainer: Container = new Container();

    private childId = 0;

    public constructor(atlas: TextureAtlas, opts: LayerBackOptions) {
        super();
        this.backSprite = new Sprite(Texture.EMPTY);
        this.backSprite.width = MAIN_WIDTH;
        this.backSprite.height = MAIN_HEIGHT;
        this.backRenderer = new TileMapBackgroundFilter(opts.background, opts.shapesMapping, atlas,
            this.backSprite.width, this.backSprite.height,
            opts.width, opts.height);
        this.backSprite.filters = [this.backRenderer, cache.palettes[0]];
        this.addChild(this.backSprite);

        this.objectsContainer.filters = [cache.palettes[0]];
        this.objectsContainer.width = MAIN_WIDTH;
        this.objectsContainer.height = MAIN_HEIGHT;
        this.addChild(this.objectsContainer);

        const initialScreenPos = opts.height*TILE_HEIGHT-MAIN_HEIGHT;
        this.backPos = new ObservablePoint<Layer>(() =>
            //while "world" moves forward background is rewinding back
            this.backRenderer.backgroundOffset.set(this.backPos.x, initialScreenPos-this.backPos.y), this, 0, 0);
    }

    public registerEnemy (enemy: EnemyGraphic): {pos: ObservablePoint, id: string} {
        console.log(enemy);
        let atlas = cache.enemyShapeBanks[enemy.shapeBank];
        let eContainer = new Sprite();
        let idx = enemy.graphic[Math.floor(enemy.animationCycle)-1];
        let group: Sprite[] = [];
        switch (enemy.size) {
            case EnemySize.s2x2:
                group = [
                    new Sprite(new Texture(atlas.texture, atlas.frames[idx+Enemy2x2SpriteOffsets.TOP_LEFT])),
                    new Sprite(new Texture(atlas.texture, atlas.frames[idx+Enemy2x2SpriteOffsets.TOP_RIGHT])),
                    new Sprite(new Texture(atlas.texture, atlas.frames[idx+Enemy2x2SpriteOffsets.BTM_LEFT])),
                    new Sprite(new Texture(atlas.texture, atlas.frames[idx+Enemy2x2SpriteOffsets.BTM_RIGHT])),
                ];
                group[0].anchor.set(1, 1);
                group[1].anchor.set(0, 1);
                group[2].anchor.set(1, 0);
                group[3].anchor.set(0, 0);
                break;
            case EnemySize.s1x1:
                group = [new Sprite(new Texture(atlas.texture, atlas.frames[idx]))];
                break;
        }
        eContainer.addChild(...group);
        eContainer.anchor.set(0.5, 0.5);
        eContainer.position.set(enemy.position.x, enemy.position.y);
        eContainer.name = `e${++this.childId}`;
        this.objectsContainer.addChild(eContainer)
        return {
            pos: eContainer.position,
            id: eContainer.name
        };
    }

    public updateEnemy (id: string, enemy: EnemyGraphic): void {
        let atlas = cache.enemyShapeBanks[enemy.shapeBank];
        let idx = enemy.graphic[Math.floor(enemy.animationCycle)-1];
        let eContainer: Container = <Container>this.objectsContainer.getChildByName!(id, false);
        switch (eContainer.children.length) {
            case 4:
                (eContainer.children[0] as Sprite).texture.frame = atlas.frames[idx+Enemy2x2SpriteOffsets.TOP_LEFT];
                (eContainer.children[1] as Sprite).texture.frame = atlas.frames[idx+Enemy2x2SpriteOffsets.TOP_RIGHT];
                (eContainer.children[2] as Sprite).texture.frame = atlas.frames[idx+Enemy2x2SpriteOffsets.BTM_LEFT];
                (eContainer.children[3] as Sprite).texture.frame = atlas.frames[idx+Enemy2x2SpriteOffsets.BTM_RIGHT];
                break;
            case 1:
                (eContainer.children[0] as Sprite).texture.frame = atlas.frames[idx];
                break;
            default: throw new Error('eh?');
        }
        eContainer.position.set(enemy.position.x, enemy.position.y);
    }

    public unregisterEnemy (id: string): void {
        this.objectsContainer.removeChild(this.objectsContainer.getChildByName!(id, false));
    }
}
