import {Container, ObservablePoint, Sprite, Texture} from "pixi.js";
import {TileMapBackgroundFilter} from "../../filters/TileMapBackgroundFilter";
import {TextureAtlas, cache} from "../../Resources";
import {MAP_TILE_HEIGHT, MAP_TILE_WIDTH} from "../../Structs";
import {MAIN_HEIGHT, MAIN_WIDTH} from "../../Tyrian";
import {EnemyGraphic, WorldObject, WorldLayer, PlayerGraphic} from "../../world/Types";
import {EnemyRender} from "./EnemyRender";
import {PlayerRender} from "./PlayerRender";

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
        this.objectsContainer.width = this.backSprite.width;
        this.objectsContainer.height = MAIN_HEIGHT;
        this.objectsContainer.position.copyFrom(this.backSprite);
        this.addChild(this.objectsContainer);

        const initialScreenPos = opts.height*MAP_TILE_HEIGHT-MAIN_HEIGHT;
        this.backPos = new ObservablePoint<Layer>(() =>
            //while "world" moves forward background is rewinding back
            this.backRenderer.backgroundOffset.set(this.backPos.x, initialScreenPos-this.backPos.y), this, 0, 0);
    }

    public registerEnemy (enemy: EnemyGraphic): WorldObject {
        let er = this.objectsContainer.addChild(new EnemyRender(enemy));
        return {
            name: er.name!,
            position: er.position,
            animationStep: er.cycle
        }
    }

    public unregisterEnemy (name: string): void {
        this.objectsContainer.removeChild(this.objectsContainer.getChildByName!(name, false));
    }

    registerPlayer(player: PlayerGraphic): WorldObject {
        let plr = this.objectsContainer.addChild(new PlayerRender(player));
        return {
            name: plr.name!,
            position: plr.position,
            animationStep: plr.animationStep
        }
    }
}
