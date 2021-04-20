import {Sprite, Container, filters} from 'pixi.js'
import {AbstractScene, IScene} from "../AbstractScene";
import {
    cache,
    getSprite,
    PCX,
    pcxSprite, SFX_CODE,
    SpriteTableIndex,
    textContainer
} from "../../Resources";
import {OutlineFilter} from "../../filters/OutlineFilter";
import {HelpScene} from "./HelpScene";
import {MissionGameScene} from "../game/MissionGameScene";
import {Audio} from "../../Audio";

export type MenuItem = {
    text: string,
    target?: () => IScene,
    outline?: OutlineFilter,
    btn?: Container,
    cm?: {brightness: (b: number, multiply: boolean) => void}
}

export class MainMenuScene extends AbstractScene<number> {

    private logo?: Sprite;

    private menu: MenuItem[];

    public constructor(active: number = -1) {
        super(active);
        this.menu = [
            {text: 'Start New Game', target: () => new MissionGameScene({episodeNumber: 1, mapIndex: 8})},
            {text: 'Load Game',},
            {text: 'Demo'},
            {text: 'Instructions', target: () => new HelpScene()},
            {text: 'High Scores'}
        ];
    }

    public update (delta: number): void {
        if (this.logo!.position.y > 4) {
            this.logo!.position.y -= delta*1.5;
            if (this.logo!.position.y > 4) {
                this.state = 0;
            }
        }
        this.menu.forEach(({cm}) => cm?.brightness(0.7, false));
        if (this.state in this.menu) {
            this.menu[this.state].cm?.brightness(1.0, false);
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
            this.logo.position.set(11, this.state < 0 ? 62 : 4)
            this.addChild(this.logo);

            this.addChild(...this.menu.map((m, idx, btns) => {
                m.btn = textContainer(m.text, SpriteTableIndex.FONT_REGULAR, 0);
                m.btn.position.set(
                    (this.width-m.btn.width)/2,
                    idx > 0
                        ? btns[idx-1].btn!.position.y+btns[idx-1].btn!.height+4
                        : 110
                )
                m.btn.filters.push(m.outline = new OutlineFilter(), m.cm = new filters.ColorMatrixFilter());
                m.btn.interactive = true;
                m.btn.on('click', () => {
                    this.state = idx;
                    if (this.menu[this.state].target) {
                        Audio.getInstance().playSample(cache.sfx[SFX_CODE.S_SELECT]);
                        this.resolve(this.menu[this.state].target!());
                    }
                });
                return m.btn;
            }));

            resolve(true);
        });
    }

}
