import {Container, filters} from 'pixi.js'
import {AbstractScene, IScene} from "../AbstractScene";
import {
    cache, PCX, pcxSprite,
    SFX_CODE,
    SpriteTableIndex,
    textContainer
} from "../../Resources";
import {OutlineFilter} from "../../filters/OutlineFilter";
import {Audio} from "../../Audio";
import {MainMenuScene} from "./MainMenuScene";

export type MenuItem = {
    text: string,
    target?: () => IScene,
    outline?: OutlineFilter,
    btn?: Container,
    cm?: {brightness: (b: number, multiply: boolean) => void}
}

export abstract class AbstractMenuScene extends AbstractScene<number> {
    protected readonly menu: MenuItem[];
    protected active = -1;

    public constructor(active: number = -1, menu: MenuItem[]) {
        super(active);
        this.menu = menu;
    }

    public update(delta: number) {
        this.menu.forEach(({cm}) => cm?.brightness(0.7, false));
        if (this.state in this.menu) {
            this.menu[this.state].cm?.brightness(1.0, false);
        }
    }

    protected setupReturnButton () {
        let m: MenuItem = {
            text: '',
            btn: textContainer('Return to main menu', SpriteTableIndex.FONT_REGULAR, 0),
        }
        m.btn!.filters.push(m.outline = new OutlineFilter(), m.cm = new filters.ColorMatrixFilter());
        m.btn!.interactive = true;
        m.btn!.on('click', () => {
            this.active = 0;
            Audio.getInstance().playSample(cache.sfx[SFX_CODE.S_SELECT]);
            this.resolve(new MainMenuScene(0));
        });
        m.btn!.position.set((this.width-m.btn!.width)/2, this.height-2-m.btn!.height);
        this.addChild(m.btn!);
    }

    protected setupMenu (topOffset: number) {
        this.addChild(...this.menu.map((m, idx, btns) => {
            m.btn = textContainer(m.text, SpriteTableIndex.FONT_REGULAR, 0);
            m.btn.position.set(
                (this.width-m.btn.width)/2,
                idx > 0
                    ? btns[idx-1].btn!.position.y+btns[idx-1].btn!.height+4
                    : topOffset
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
    }

}
