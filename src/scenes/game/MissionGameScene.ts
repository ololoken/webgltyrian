import {AbstractScene} from "../AbstractScene";
import {
    cache,
    generateBackgroundTexturesAtlas, generateEnemyShapeBankTextureAtlas,
    getEpisodeData,
    PCX,
    pcxSprite,
    TextureAtlas
} from "../../Resources";
import {Sprite, Texture} from "pixi.js";
import {
    BACK_1_HEIGHT, BACK_1_WIDTH,
    BACK_2_HEIGHT, BACK_2_WIDTH,
    BACK_3_HEIGHT, BACK_3_WIDTH,
} from "../../Structs";
import {SPF} from "../../Tyrian";
import {Layer} from "./Layer";
import {World} from "../../world/World";
import {MainMenuScene} from "../menu/MainMenuScene";
import {SceneLayers} from "./Types";

type DemoParams = {episodeNumber: number, mapIndex: number};

export class MissionGameScene extends AbstractScene<DemoParams> {

    private layers: SceneLayers | [] = [];

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
                console.log(map);
                this.layers = [new Layer(backAtlas, {
                    background: map.background.background1,
                    shapesMapping: map.background.shapesMapping1,
                    width: BACK_1_WIDTH, height: BACK_1_HEIGHT
                }), new Layer(backAtlas, {
                    background: map.background.background2,
                    shapesMapping: map.background.shapesMapping2,
                    width: BACK_2_WIDTH, height: BACK_2_HEIGHT
                }), new Layer(backAtlas, {
                    background: map.background.background3,
                    shapesMapping: map.background.shapesMapping3,
                    width: BACK_3_WIDTH, height: BACK_3_HEIGHT
                })];

                this.addChild(...this.layers);

                this.hud = this.addChild(pcxSprite(PCX.HUD_ONE));

                this.world = new World(map, items, this.layers);

                //process load content event(s) and then ignore them
                (await Promise.all(this.world.getRequiredShapes()
                    .reduce((a, id) => {
                        a[id] = generateEnemyShapeBankTextureAtlas(id);
                        return a;
                    }, <Promise<TextureAtlas>[]>[])))
                    .forEach((atlas, id) => cache.enemyShapeBanks[id] = atlas);
/*
                generateEnemyShapeBankTextureAtlas(1).then(atlas => {


                    //let sp = new Sprite(new Texture(cache.mainShapeBanks[cache.mainShapeBanks.length-2].texture));
                    let sp = new Sprite(new Texture(atlas.texture));
                    sp.scale.set(0.62, 0.62);
                    sp.filters = [cache.palettes[0]];
                    this.addChild(sp);

                    items.enemies.filter(e => e.eSize == 1 && e.shapeBank == 1)
                        .forEach((e, i) => {
                            let idx = e.eGraphic[0]-1, p = {x: (10+i*24)%300, y: 70+24*(Math.floor(i*24/300))};
                            let esp = new Sprite(new Texture(atlas.texture, atlas.frames[idx]))

                            esp.anchor.set(1, 1)
                            esp.position.set(p.x, p.y);
                            esp.filters = [cache.palettes[0]];
                            this.addChild(esp);

                            esp = new Sprite(new Texture(atlas.texture, atlas.frames[idx+1]))
                            esp.anchor.set(0, 1)
                            esp.position.set(p.x, p.y);
                            esp.filters = [cache.palettes[0]];
                            this.addChild(esp);


                            esp = new Sprite(new Texture(atlas.texture, atlas.frames[idx+19]))
                            esp.anchor.set(1, 0)
                            esp.position.set(p.x, p.y);
                            esp.filters = [cache.palettes[0]];
                            this.addChild(esp);


                            esp = new Sprite(new Texture(atlas.texture, atlas.frames[idx+20]))
                            esp.anchor.set(0, 0)
                            esp.position.set(p.x, p.y);
                            esp.filters = [cache.palettes[0]];
                            this.addChild(esp);
                        })
                })
*/

                this.world.on('MissionEnd', () => this.resolve(new MainMenuScene(0)));

                loaded(true);
            })
        });
    }

    unload(): Promise<void> {
        cache.enemyShapeBanks.length = 0;
        this.layers = [];
        return super.unload();
    }

    public update (d: number): void {
        //delta literally TARGET_FPMS*delta makes resulting "speed" constant (approx 1) on different real fps
        //so lets pass in world real seconds between frames
        this.world.update(d*SPF);
    }
}
