import {AbstractScene} from "../AbstractScene";
import {PCX, pcxSprite, SpriteTableIndex, textContainer} from "../../Resources";
import {MainMenuScene, MenuItem} from "./MainMenuScene";
import {OutlineFilter} from "../../filters/OutlineFilter";
import {filters} from "pixi.js";


export class SelectEpisode extends AbstractScene<void> {

    private menu: MenuItem[] = [];

    private active = -1;

    public constructor () {
        super();
    }

    update (delta: number): void {
        this.menu.forEach(({cm}) => cm?.brightness(0.7, false));
        if (this.active in this.menu) {
            this.menu[this.active].cm?.brightness(1.0, false);
        }
    }

    unload (): Promise<void> {
        this.menu = [];
        return super.unload();
    }

    load (): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            this.addChild(pcxSprite(PCX.SUB_SELECT));
            let m: MenuItem = {
                text: '',
                btn: textContainer('Return to main menu', SpriteTableIndex.FONT_REGULAR, 0),
            }
            this.menu.push(m);
            m.btn!.filters.push(m.outline = new OutlineFilter(), m.cm = new filters.ColorMatrixFilter());
            m.btn!.interactive = true;
            m.btn!.on('click', () => {
                this.active = 0;
                this.resolve(new MainMenuScene(0));
            });
            m.btn!.position.set((this.width-m.btn!.width)/2, this.height-2-m.btn!.height);
            this.addChild(m.btn!);

            resolve(true);
        })
    }
}
