import {Container, ObservablePoint, Sprite, Texture} from "pixi.js";
import {TileMapBackgroundFilter} from "../../filters/TileMapBackgroundFilter";
import {TextureAtlas, cache} from "../../Resources";
import {TILE_HEIGHT} from "../../Structs";
import {MAIN_HEIGHT, MAIN_WIDTH} from "../../Tyrian";

type LayerBackOptions = {background: number[], shapesMapping: number[], width: number, height: number};

export class Layer extends Container {
    private readonly backSprite: Sprite;
    private readonly backRenderer: TileMapBackgroundFilter;

    public readonly backPos: ObservablePoint;

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

        const yOffset = MAIN_HEIGHT/TILE_HEIGHT;
        this.backPos = new ObservablePoint(() =>
            this.backRenderer.backgroundOffset
                .set(this.backPos.x, opts.height-yOffset-this.backPos.y), null);
    }
}
