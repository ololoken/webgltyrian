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
import {EventSystem} from "../../world/EventSystem";
import {FPS, SPF} from "../../Tyrian";
import {Layer} from "./Layer";
import {TyEventType} from "../../world/EventMappings";

type DemoParams = {episodeNumber: number, mapIndex: number};

enum LayerCode {
    GND = 0,
    SKY = 1,
    TOP = 2
}

type SceneLayers = [Layer, Layer, Layer];
type BackSpeed = [number, number, number];

export class MissionGameScene extends AbstractScene<DemoParams> {

    private layers!: SceneLayers;

    private eventSystem!: EventSystem;

    private hud!: Sprite;

    private timeline: number = 0;

    private readonly backSpeed: BackSpeed = [0, 0, 0];

    private readonly shapeBanks: TextureAtlas[] = [];

    constructor (params: DemoParams) {
        super(params);
    }

    load (): Promise<boolean> {
        return new Promise<boolean>( resolve => {
            getEpisodeData(this.state.episodeNumber).then(async ({maps}) => {
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

                this.eventSystem = new EventSystem(map.events, -1);

                //process load content event(s) and then ignore them
                (await Promise.all(this.eventSystem.getEvents(TyEventType.ENEMIES_LOAD_SHAPES)
                    .reduce((a, e) => [...a, ...e.shapes], <number[]>[])
                    .filter(s => s > 0)
                    .reduce((a, s) => {
                        a[s] = generateTexturesAtlasFromCompressedShapes(SHAPE_FILE_CODE[s-1], 'newsh{%c}.shp');
                        return a;
                    }, <Promise<TextureAtlas>[]>[])))
                    .forEach((atlas, index) => this.shapeBanks[index] = atlas);

                this.eventSystem.on('BackSpeedSet', (e) => {
                    this.backSpeed[LayerCode.GND] = e.backSpeed[LayerCode.GND];
                    this.backSpeed[LayerCode.SKY] = e.backSpeed[LayerCode.SKY];
                    this.backSpeed[LayerCode.TOP] = e.backSpeed[LayerCode.TOP];
                })

                resolve(true);
            })
        });
    }

    unload(): Promise<void> {
        this.shapeBanks.length = 0;
        return super.unload();
    }

    public update (delta: number): void {
        let d = delta*SPF;//literally TARGET_FPMS*delta*1/FPS makes resulting "speed" constant on different devices
        this.updateBackground(d);
        this.updateEventSystem(d);
    }

    private updateBackground (d: number) {
        //todo: add parallax effect here when player will be ready
        this.layers[LayerCode.GND].backPos.y += d*this.backSpeed[LayerCode.GND];
        this.layers[LayerCode.SKY].backPos.y += d*this.backSpeed[LayerCode.SKY];
        this.layers[LayerCode.TOP].backPos.y += d*this.backSpeed[LayerCode.TOP];
    }

    private updateEventSystem (d: number) {
        this.eventSystem.update(this.timeline += d);
    }
}
