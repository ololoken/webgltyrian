import {Container, ObservablePoint, Sprite, Texture} from "pixi.js";
import {TileMapBackgroundFilter} from "../../filters/TileMapBackgroundFilter";
import {TextureAtlas, cache} from "../../Resources";
import {MAP_TILE_HEIGHT, MAP_TILE_WIDTH} from "../../Structs";
import {MAIN_HEIGHT} from "../../Tyrian";
import {EnemyGraphic, WorldObject, IWorldLayer} from "../../world/Types";
import {EnemyRender} from "./EnemyRender";

type LayerBackOptions = {background: number[], mapWidth: number, mapHeight: number};

export class Layer extends Container implements IWorldLayer {
    private readonly backSprite: Sprite;
    private readonly backRenderer: TileMapBackgroundFilter;

    public readonly backPos: ObservablePoint<Layer>;
    public readonly parallaxOffset: ObservablePoint<Layer>;

    private objectsContainer: Container = new Container();

    public constructor (atlas: TextureAtlas, opts: LayerBackOptions) {
        super();
        this.backSprite = new Sprite(Texture.EMPTY);
        this.backSprite.width = opts.mapWidth*MAP_TILE_WIDTH;
        this.backSprite.height = MAIN_HEIGHT;
        this.backRenderer = new TileMapBackgroundFilter(
            atlas, this.backSprite.width, this.backSprite.height,
            opts.background, opts.mapWidth, opts.mapHeight);
        this.backSprite.filters = [this.backRenderer, cache.palettes[0]];
        this.backSprite.position.set((260-this.backSprite.width)/2, 0);

        this.objectsContainer.filters = [cache.palettes[0]];
        this.objectsContainer.width = this.backSprite.width;
        this.objectsContainer.height = this.backSprite.height;
        this.objectsContainer.position.copyFrom(this.backSprite);

        this.addChild(this.backSprite, this.objectsContainer);

        const initialScreenPos = opts.mapHeight*MAP_TILE_HEIGHT-MAIN_HEIGHT;
        this.backPos = new ObservablePoint<Layer>(() =>
            //while "world" moves forward background is rewinding back
            this.backRenderer.backgroundOffset.set(this.backPos.x, initialScreenPos-this.backPos.y), this, 0, 0);
        this.parallaxOffset = new ObservablePoint<Layer>(() => {
            this.objectsContainer.position.x = this.parallaxOffset.x;
            this.backSprite.position.x = this.parallaxOffset.x;
        }, this);
    }

    public registerEnemy (enemy: EnemyGraphic): WorldObject {
        let er = this.objectsContainer.addChild(new EnemyRender(enemy));
        return {
            name: er.name!,
            position: er.position,
            animationStep: er.cycle
        }
    }

    public unregisterObject (name: string): void {
        this.objectsContainer.removeChild(this.objectsContainer.getChildByName!(name, false));
    }
}
