import {Container, ObservablePoint, Sprite, Texture} from "pixi.js";
import {TileMapBackgroundFilter} from "../../filters/TileMapBackgroundFilter";
import {TextureAtlas, cache} from "../../Resources";
import {TILE_HEIGHT} from "../../Structs";
import {MAIN_HEIGHT, MAIN_WIDTH} from "../../Tyrian";
import {EnemyGraphic} from "../../world/Enemy";

type LayerBackOptions = {background: number[], shapesMapping: number[], width: number, height: number};

export class Layer extends Container {
    private readonly backSprite: Sprite;
    private readonly backRenderer: TileMapBackgroundFilter;

    public readonly backPos: ObservablePoint<Layer>;

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

        this.backPos = new ObservablePoint<Layer>(() =>
            //while "world" moves forward background is rewinding back
            this.backRenderer.backgroundOffset.set(this.backPos.x, opts.height*TILE_HEIGHT-MAIN_HEIGHT-this.backPos.y), this, 0, 0);
    }

    public registerEnemy (enemy: EnemyGraphic): ObservablePoint {
        let atlas = cache.enemyShapeBanks[enemy.shapeBank];
        let e = new Sprite(new Texture(atlas.texture, atlas.frames[enemy.graphic[enemy.animationCycle]]));
        e.position.set(enemy.position.x, enemy.position.y);
        return this.addChild(e).position;
    }
}
