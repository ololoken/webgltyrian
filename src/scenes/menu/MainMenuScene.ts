import {Sprite, Container, filters, Texture, BaseTexture, Rectangle} from 'pixi.js'
import {AbstractScene, IScene} from "../AbstractScene";
import {
    getSprite,
    PCX,
    pcxSprite,
    SpriteTableIndex,
    textContainer,
    getEpisodeData,
    generateTexturesFromMapShapes
} from "../../Resources";
import {OutlineFilter} from "../../filters/OutlineFilter";
import {SelectEpisode} from "./SelectEpisode";
import {HelpScene} from "./HelpScene";
import {TileMapFilter} from "../../filters/TileMapFilter";
import {PaletteFilter} from "../../filters/PaletteFilter";

export type MenuItem = {
    text: string,
    target?: IScene,
    outline?: OutlineFilter,
    btn?: Container,
    cm?: {brightness: (b: number, multiply: boolean) => void}
}

export class MainMenuScene extends AbstractScene {

    private logo?: Sprite;

    private menu: MenuItem[];

    private active: number;

    private tmpf?: TileMapFilter;

    public constructor(active: number = -1) {
        super();
        this.menu = [
            {text: 'Start New Game', target: new SelectEpisode()},
            {text: 'Load Game',},
            {text: 'Demo'},
            {text: 'Instructions', target: new HelpScene()},
            {text: 'High Scores'}
        ];
        this.active = active;
    }

    public update (delta: number): void {
        if (this.logo!.position.y > 4) {
            this.logo!.position.y -= 0.8*delta;
            if (this.logo!.position.y > 4) {
                this.active = 0;
            }
        }
        this.menu.forEach(({cm}) => cm?.brightness(0.7, false));
        if (this.active in this.menu) {
            this.menu[this.active].cm?.brightness(1.0, false);
        }
        if (this.tmpf && this.tmpf.mapPosition.y > 0) {
            this.tmpf.mapPosition.y -= 0.01*delta;
        }
    }

    unload (): Promise<void> {
        this.logo = undefined;
        this.menu = [];
        return super.unload();
    }

    load (): Promise<boolean> {
        return new Promise<boolean>(async resolve => {
            this.addChild(pcxSprite(PCX.MENU_BG));

            this.logo = getSprite(3, 146, 8);
            this.logo.position.set(11, this.active == undefined ? 62 : 4)
            this.addChild(this.logo);

            this.addChild(...this.menu.map((m, idx, btns) => {
                m.btn = textContainer(m.text, SpriteTableIndex.FONT_REGULAR, 0);
                m.btn.position.set(
                    (this.width-m.btn.width)/2,
                    idx == 0 ? 110 : btns[idx-1].btn!.position.y+btns[idx-1].btn!.height+4
                )
                m.btn.filters.push(m.outline = new OutlineFilter(), m.cm = new filters.ColorMatrixFilter());
                m.btn.interactive = true;
                m.btn.on('click', () => {
                    this.active = idx;
                    if (this.menu[this.active].target) {
                        this.resolve(this.menu[this.active].target!);
                    }
                });
                return m.btn;
            }));

            getEpisodeData(1).then(({maps}) => {
                let map = maps[8];
                generateTexturesFromMapShapes(map.shapesFile).then(atlas => {
                    let sp = new Sprite(Texture.EMPTY);
                    sp.width = 160; sp.height = 200;
                    //console.log(atlas.shapes[map.map.shapeMap1[map.map.map1[14*280+9]]-1])
                    //sp.filterArea = new Rectangle(0, 0, 160, 200);
                    let tmf = new TileMapFilter(map.map.map1, map.map.shapeMap1, atlas, sp.width, sp.height);
                    this.tmpf = tmf;
                    tmf.mapPosition.set(1, 300-8);
                    sp.filters = [tmf, new PaletteFilter(0)];
                    this.addChild(sp);
                    let sp1 = new Sprite(new Texture(atlas.texture));
                    sp1.filters = [new PaletteFilter(0)];
                    this.addChild(sp1).position.set(160, 0);
                });
            })

            //let sp = this.addChild(new Sprite(new Texture((await generateTexturesFromMapShapes(90)).texture)));
            //sp.filters = [new PaletteFilter(0)];
            //sp.scale.set(200/512, 200/512);

            //console.log(await );
            //console.log()

            resolve(true);
        });
    }

}
