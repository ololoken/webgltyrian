import { AbstractScene } from '../AbstractScene';
import {
    cache,
    generateBackgroundTexturesAtlas,
    generateEnemyShapeBankTextureAtlas,
    getEpisodeData,
    pcxSprite,
} from '../../Resources';
import { Sprite } from 'pixi.js';
import {
    BACK_1_HEIGHT, BACK_1_WIDTH,
    BACK_2_HEIGHT, BACK_2_WIDTH,
    BACK_3_HEIGHT, BACK_3_WIDTH,
    PCX, SHAPE_FILE_CODE, VFX_CODE,
} from '../../Const';
import { Layer } from './Layer';
import { World } from '../../world/World';
import { MainMenuScene } from '../menu/MainMenuScene';
import { PlayerLayer } from './PlayerLayer';
import { IPlayerLayer, Layers } from '../../world/Types';
import { Audio } from '../../Audio';

type DemoParams = {episodeNumber: number, mapIndex: number};

export class MissionGameScene extends AbstractScene<DemoParams> {

    private layers: Layers | [] = [];
    private playerLayer!: IPlayerLayer;

    private hud!: Sprite;

    private world!: World;

    constructor (params: DemoParams) {
        super(params);
    }

    load (): Promise<boolean> {
        return new Promise<boolean>( loaded => {
            getEpisodeData(this.state.episodeNumber).then(async ({maps, items}) => {
                let map = maps[this.state.mapIndex];
                let backAtlas = await generateBackgroundTexturesAtlas(map.shapesFile);
                this.layers = [
                    this.addChild(new Layer(backAtlas, {
                        background: map.background.background1.map(shapeId => map.background.shapesMapping1[shapeId]),
                        mapWidth: BACK_1_WIDTH, mapHeight: BACK_1_HEIGHT
                    })),
                    this.addChild(new Layer(backAtlas, {
                        background: map.background.background2.map(shapeId => map.background.shapesMapping2[shapeId]),
                        mapWidth: BACK_2_WIDTH, mapHeight: BACK_2_HEIGHT
                    })),
                    this.addChild(new Layer(backAtlas, {
                        background: map.background.background3.map(shapeId => map.background.shapesMapping3[shapeId]),
                        mapWidth: BACK_3_WIDTH, mapHeight: BACK_3_HEIGHT
                    }))
                ];

                this.playerLayer = this.addChild(new PlayerLayer());

                this.hud = this.addChild(pcxSprite(PCX.HUD_ONE));

                this.world = new World(map, items, this.layers, this.playerLayer);

                //process load content event(s) and then ignore them
                this.world.getRequiredShapes()
                    .map(async id => cache.enemyShapeBanks[id] = await generateEnemyShapeBankTextureAtlas(SHAPE_FILE_CODE[id-1].toLowerCase()));
                cache.explosionShapeBank = await generateEnemyShapeBankTextureAtlas('6');

                this.world.on('MissionEnd', () => this.resolve(new MainMenuScene(0)));

                loaded(true);
                Audio.getInstance().playSample(cache.vfx[VFX_CODE.V_GOOD_LUCK]);
            })
        });
    }

    unload(): Promise<void> {
        cache.enemyShapeBanks.length = 0;
        this.layers = [];
        return super.unload();
    }

    public update (step: number): void {
        this.world.update(step);
    }
}
