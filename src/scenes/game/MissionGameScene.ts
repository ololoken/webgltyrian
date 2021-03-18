import {AbstractScene} from "../AbstractScene";
import {
    generateTexturesAtlasFromCompressedShapes,
    getEpisodeData,
    PCX,
    pcxSprite,
    SHAPE_FILE_CODE,
    TextureAtlas
} from "../../Resources";
import {Sprite} from "pixi.js";
import {
    BACK_1_HEIGHT, BACK_1_WIDTH,
    BACK_2_HEIGHT, BACK_2_WIDTH,
    BACK_3_HEIGHT, BACK_3_WIDTH,
} from "../../Structs";
import {SPF} from "../../Tyrian";
import {Layer} from "./Layer";
import {LayerCode, World} from "../../world/World";

type DemoParams = {episodeNumber: number, mapIndex: number};

type SceneLayers = [Layer, Layer, Layer] | [];

export class MissionGameScene extends AbstractScene<DemoParams> {

    private layers: SceneLayers = [];

    private hud!: Sprite;

    private readonly shapeBanks: TextureAtlas[] = [];

    private world!: World;

    constructor (params: DemoParams) {
        super(params);
    }

    load (): Promise<boolean> {
        return new Promise<boolean>( resolve => {
            getEpisodeData(this.state.episodeNumber).then(async ({maps, items}) => {
                let map = maps[this.state.mapIndex];
                let mapAtlas = await generateTexturesAtlasFromCompressedShapes(map.shapesFile, 'shapes{%c}.dat');

                this.layers = [new Layer(mapAtlas, {
                    background: map.background.background1,
                    shapesMapping: map.background.shapesMapping1,
                    width: BACK_1_WIDTH, height: BACK_1_HEIGHT
                }), new Layer(mapAtlas, {
                    background: map.background.background2,
                    shapesMapping: map.background.shapesMapping2,
                    width: BACK_2_WIDTH, height: BACK_2_HEIGHT
                }), new Layer(mapAtlas, {
                    background: map.background.background3,
                    shapesMapping: map.background.shapesMapping3,
                    width: BACK_3_WIDTH, height: BACK_3_HEIGHT
                })];

                this.addChild(...this.layers);

                this.hud = this.addChild(pcxSprite(PCX.HUD_ONE));

                this.world = new World(map, items, [this.layers[LayerCode.GND].backPos,
                                                              this.layers[LayerCode.SKY].backPos,
                                                              this.layers[LayerCode.TOP].backPos]);

                //process load content event(s) and then ignore them
                (await Promise.all(this.world.getRequiredShapes()
                    .reduce((a, s) => {
                        a[s] = generateTexturesAtlasFromCompressedShapes(SHAPE_FILE_CODE[s-1], 'newsh{%c}.shp');
                        return a;
                    }, <Promise<TextureAtlas>[]>[])))
                    .forEach((atlas, index) => this.shapeBanks[index] = atlas);

                resolve(true);
            })
        });
    }

    unload(): Promise<void> {
        this.shapeBanks.length = 0;
        this.layers = [];
        return super.unload();
    }

    public update (delta: number): void {
        let d = delta*SPF;//literally TARGET_FPMS*delta*1/FPS makes resulting "speed" constant on different real fps
        this.world.update(d);
    }
}
