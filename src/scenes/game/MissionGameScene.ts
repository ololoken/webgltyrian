import {AbstractScene} from "../AbstractScene";
import {generateTexturesFromMapShapes, getEpisodeData, PCX, pcxSprite} from "../../Resources";
import {Sprite, Texture, ObservablePoint} from "pixi.js";
import {TileMapBackgroundFilter} from "../../filters/TileMapBackgroundFilter";
import {PaletteFilter} from "../../filters/PaletteFilter";
import {
    BACK_1_HEIGHT, BACK_1_WIDTH,
    BACK_2_HEIGHT, BACK_2_WIDTH,
    BACK_3_HEIGHT, BACK_3_WIDTH,
    TILE_HEIGHT, TILE_WIDTH,
    TyEpisodeMap
} from "../../Structs";
import {EventSystem} from "../../world/EventSystem";
import {FPS, MAIN_HEIGHT, MAIN_WIDTH} from "../../Tyrian";

type DemoParams = {episodeNumber: number, mapIndex: number};

export class MissionGameScene extends AbstractScene<DemoParams> {

    private back1Sprite!: Sprite;
    private back1Renderer!: TileMapBackgroundFilter;

    private back2Sprite!: Sprite;
    private back2Renderer!: TileMapBackgroundFilter;

    private back3Sprite!: Sprite;
    private back3Renderer!: TileMapBackgroundFilter;

    private map!: TyEpisodeMap;
    private eventSystem!: EventSystem;

    private readonly back1Pos: ObservablePoint;
    private readonly back2Pos: ObservablePoint;
    private readonly back3Pos: ObservablePoint;

    private timeline: number = 0;

    private readonly timeCompression = 1/FPS;

    private back1Speed = 1;
    private back2Speed = 2;
    private back3Speed = 2;

    constructor (params: DemoParams) {
        super(params);

        const yOffset = MAIN_HEIGHT/TILE_HEIGHT;
        this.back1Pos = new ObservablePoint(() =>
            this.back1Renderer.backgroundOffset
                .set(this.back1Pos.x, BACK_1_HEIGHT-yOffset-this.back1Pos.y), null);
        this.back2Pos = new ObservablePoint(() =>
            this.back2Renderer.backgroundOffset
                .set(this.back2Pos.x, BACK_2_HEIGHT-yOffset-this.back2Pos.y), null);
        this.back3Pos = new ObservablePoint(() =>
            this.back3Renderer.backgroundOffset
                .set(this.back3Pos.x, BACK_3_HEIGHT-yOffset-this.back3Pos.y), null);
    }

    load (): Promise<boolean> {
        return new Promise<boolean>( resolve => {
            getEpisodeData(this.state.episodeNumber).then(async ({maps}) => {
                this.map = maps[this.state.mapIndex];
                let atlas = await generateTexturesFromMapShapes(this.map.shapesFile);
                this.back1Sprite = new Sprite(Texture.EMPTY);
                this.back1Sprite.width = MAIN_WIDTH;
                this.back1Sprite.height = MAIN_HEIGHT;
                this.back1Renderer = new TileMapBackgroundFilter(this.map.background.background1, this.map.background.shapesMapping1, atlas,
                    this.back1Sprite.width, this.back1Sprite.height,
                    BACK_1_WIDTH, BACK_1_HEIGHT);
                this.back1Sprite.filters = [this.back1Renderer, new PaletteFilter(0)];
                this.addChild(this.back1Sprite);

                this.back2Sprite = new Sprite(Texture.EMPTY);
                this.back2Sprite.width = MAIN_WIDTH;
                this.back2Sprite.height = MAIN_HEIGHT;
                this.back2Renderer = new TileMapBackgroundFilter(this.map.background.background2, this.map.background.shapesMapping2, atlas,
                    this.back2Sprite.width, this.back2Sprite.height,
                    BACK_2_WIDTH, BACK_2_HEIGHT);
                this.back2Sprite.filters = [this.back2Renderer, new PaletteFilter(0)];
                this.addChild(this.back2Sprite);

                this.back3Sprite = new Sprite(Texture.EMPTY);
                this.back3Sprite.width = MAIN_WIDTH;
                this.back3Sprite.height = MAIN_HEIGHT;
                this.back3Renderer = new TileMapBackgroundFilter(this.map.background.background3, this.map.background.shapesMapping3, atlas,
                    this.back3Sprite.width, this.back3Sprite.height,
                    BACK_3_WIDTH, BACK_3_HEIGHT);
                this.back3Sprite.filters = [this.back3Renderer, new PaletteFilter(0)];
                this.addChild(this.back3Sprite);

                this.addChild(pcxSprite(PCX.HUD_ONE));

                this.eventSystem = new EventSystem(this.map.events, -1);


                resolve(true);
            })
        });
    }

    public update (delta: number): void {
        let d = delta*this.timeCompression;
        this.updateBackground(d);
        this.updateEventSystem(d);
    }

    private updateBackground (d: number) {
        //todo: add parallax effect here when player will be ready
        this.back1Pos.y += d*this.back1Speed;
        this.back2Pos.y += d*this.back2Speed;
        this.back3Pos.y += d*this.back3Speed;
    }

    private updateEventSystem (d: number) {
        this.eventSystem.update(this.timeline += d);
    }
}
