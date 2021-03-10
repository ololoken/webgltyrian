import {Sprite, Container, filters} from 'pixi.js'
import {AbstractScene, IScene} from "../AbstractScene";
import {getSprite, PCX, pcxSprite, SpriteTableIndex, textContainer} from "../../Resources";
import {OutlineFilter} from "../../filters/OutlineFilter";
import {SelectEpisode} from "./SelectEpisode";
import {HelpScene} from "./HelpScene";

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

    private active?: number = undefined;

    public constructor(active?: number) {
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
        if (this.active != undefined && this.active in this.menu) {
            this.menu[this.active].cm?.brightness(1.0, false);
        }
    }

    unload (): Promise<void> {
        this.logo = undefined;
        this.menu = [];
        return super.unload();
    }

    load (): Promise<boolean> {
        return new Promise<boolean>(resolve => {
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
            resolve(true);
        })
    }

}
