import {AbstractScene} from "./AbstractScene";
import {generateTexturesFromMapShapes, getEpisodeData} from "../Resources";
import {Sprite, Texture} from "pixi.js";
import {TileMapFilter} from "../filters/TileMapFilter";
import {PaletteFilter} from "../filters/PaletteFilter";
import {MAP_1_HEIGHT, MAP_1_WIDTH, TyEpisodeMap} from "../Structs";

type DemoParams = {episode: number, map: number};

export class MainGameScene extends AbstractScene<DemoParams> {

    private map1Sprite!: Sprite;
    private map1Renderer!: TileMapFilter;

    private map!: TyEpisodeMap;

    constructor (params: DemoParams) {
        super(params);
    }

    load (): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            getEpisodeData(this.state.episode).then(({maps}) => {
                this.map = maps[this.state.map];
                generateTexturesFromMapShapes(this.map.shapesFile).then(atlas => {
                    this.map1Sprite = new Sprite(Texture.EMPTY);
                    this.map1Sprite.width = 320; this.map1Sprite.height = 200;
                    this.map1Renderer = new TileMapFilter(this.map.map.map1, this.map.map.shapeMap1, atlas,
                        this.map1Sprite.width, this.map1Sprite.height,
                        MAP_1_WIDTH, MAP_1_HEIGHT);
                    this.map1Renderer.mapPosition.set(1, 300-8);
                    this.map1Sprite.filters = [this.map1Renderer, new PaletteFilter(0)];
                    this.addChild(this.map1Sprite);
                    resolve(true);
                });
            })
        });
    }

    update (delta: number): void {
        if (this.map1Renderer.mapPosition.y > 0) {
            this.map1Renderer.mapPosition.y -= 0.01*delta;
        }
    }

}
