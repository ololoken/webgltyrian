import {Container, ObservablePoint, Sprite, Texture, Rectangle} from "pixi.js";
import {TileMapBackgroundFilter} from "../../filters/TileMapBackgroundFilter";
import {TextureAtlas, cache} from "../../Resources";
import {MAP_TILE_HEIGHT, MAP_TILE_WIDTH} from "../../Structs";
import {MAIN_HEIGHT, MAIN_WIDTH} from "../../Tyrian";
import {EnemyGraphic, WorldObject, WorldLayer} from "../../world/Types";
import {EnemyRender} from "./EnemyRender";

type LayerBackOptions = {background: number[], shapesMapping: number[], width: number, height: number};

export class Layer extends Container implements WorldLayer {
    private readonly backSprite: Sprite;
    private readonly backRenderer: TileMapBackgroundFilter;

    public readonly backPos: ObservablePoint<Layer>;

    private objectsContainer: Container = new Container();

    public constructor(atlas: TextureAtlas, opts: LayerBackOptions) {
        super();
        this.backSprite = new Sprite(Texture.EMPTY);
        this.backSprite.width = opts.width*MAP_TILE_WIDTH;
        this.backSprite.height = MAIN_HEIGHT;
        this.backRenderer = new TileMapBackgroundFilter(opts.background, opts.shapesMapping, atlas,
            this.backSprite.width, this.backSprite.height,
            opts.width, opts.height);
        this.backSprite.filters = [this.backRenderer, cache.palettes[0]];
        this.backSprite.position.set((MAIN_WIDTH-this.backSprite.width)/2, 0);
        this.addChild(this.backSprite);

        this.objectsContainer.filters = [cache.palettes[0]];
        this.objectsContainer.width = MAIN_WIDTH;
        this.objectsContainer.height = MAIN_HEIGHT;
        this.addChild(this.objectsContainer);

        const initialScreenPos = opts.height*MAP_TILE_HEIGHT-MAIN_HEIGHT;
        this.backPos = new ObservablePoint<Layer>(() =>
            //while "world" moves forward background is rewinding back
            this.backRenderer.backgroundOffset.set(this.backPos.x, initialScreenPos-this.backPos.y), this, 0, 0);
    }

    public registerEnemy (enemy: EnemyGraphic): WorldObject {
        let e = this.objectsContainer.addChild(new EnemyRender(enemy));
        return {
            name: e.name!,
            position: e.position,
            cycle: e.cycle
        };
    }

    public unregisterEnemy (name: string): void {
        this.objectsContainer.removeChild(this.objectsContainer.getChildByName!(name, false));
    }
}
