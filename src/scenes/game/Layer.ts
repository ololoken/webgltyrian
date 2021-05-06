import {Container, ObservablePoint, Sprite, Texture} from "pixi.js";
import {TileMapBackgroundFilter} from "../../filters/TileMapBackgroundFilter";
import {TextureAtlas, cache} from "../../Resources";
import {MAP_TILE_HEIGHT, MAP_TILE_WIDTH} from "../../Structs";
import {MAIN_HEIGHT} from "../../Tyrian";
import {IEnemyGraphic, IWorldObject, IWorldLayer, EnemyShotGraphic, Explosion} from "../../world/Types";
import {EnemyRender} from "./EnemyRender";
import {EnemyShotRender} from "./EnemyShotRender";
import {ExplosionRender} from "./ExplosionRender";

type LayerBackOptions = {background: number[], mapWidth: number, mapHeight: number};

export class Layer extends Container implements IWorldLayer {
    private readonly backSprite: Sprite;
    private readonly backRenderer: TileMapBackgroundFilter;

    public readonly backPos: ObservablePoint<Layer>;
    public readonly parallaxOffset: ObservablePoint<Layer>;

    private objectsContainer: Container = new Container();

    public constructor (atlas: TextureAtlas, opts: LayerBackOptions) {
        super();
        this.sortableChildren = true;
        this.backSprite = new Sprite(Texture.EMPTY);
        this.backSprite.width = opts.mapWidth*MAP_TILE_WIDTH;
        this.backSprite.height = MAIN_HEIGHT;
        this.backRenderer = new TileMapBackgroundFilter(
            atlas, this.backSprite.width, this.backSprite.height,
            opts.background, opts.mapWidth, opts.mapHeight);
        this.backSprite.filters = [this.backRenderer, cache.palettes[0]];

        this.objectsContainer.filters = [cache.palettes[0]];
        this.objectsContainer.width = this.backSprite.width;
        this.objectsContainer.height = this.backSprite.height;

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

    public registerEnemy (enemy: IEnemyGraphic): IWorldObject {
        let er = this.objectsContainer.addChild(new EnemyRender(enemy));
        return {
            name: er.name!,
            position: er.position,
            animationStep: er.cycle,
            getBoundingRect: () => {
                let rect = er.getLocalBounds();
                rect.x = er.position.x+this.objectsContainer.position.x;
                rect.y = er.position.y+this.objectsContainer.position.y;
                return rect;
            }
        }
    }

    public registerShot (shot: EnemyShotGraphic): IWorldObject {
        let sh = this.objectsContainer.addChild(new EnemyShotRender(shot));
        return {
            name: sh.name!,
            position: sh.position,
            animationStep: sh.cycle,
            getBoundingRect: () => {
                let rect = sh.getLocalBounds();
                rect.x = sh.position.x+this.objectsContainer.position.x;
                rect.y = sh.position.y+this.objectsContainer.position.y;
                return rect;
            }
        }
    }

    public registerExplosion (explosion: Explosion): IWorldObject {
        let ex = this.objectsContainer.addChild(new ExplosionRender(explosion));
        return {
            name: ex.name!,
            position: ex.position,
            animationStep: ex.cycle,
            getBoundingRect: () => {
                let rect = ex.getLocalBounds();
                rect.x = ex.position.x+this.objectsContainer.position.x;
                rect.y = ex.position.y+this.objectsContainer.position.y;
                return rect;
            }
        }
    }

    public unregisterObject (name: string): void {
        this.objectsContainer.removeChild(this.objectsContainer.getChildByName!(name, false));
    }

    public backSpriteOnTop (state: boolean): void {
        this.backSprite.zIndex = state ? 100 : 0;
    }
}
