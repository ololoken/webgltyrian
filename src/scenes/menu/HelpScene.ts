import { AbstractScene } from '../AbstractScene';
import { Audio } from '../../Audio';
import { MainMenuScene } from './MainMenuScene';
import { MenuItem } from './AbstractMenuScene';
import { OutlineFilter} from '../../filters/OutlineFilter';
import { PCX, SFX_CODE, SpriteTableIndex } from '../../Const';
import { cache, pcxSprite, textContainer } from '../../Resources';
import { filters } from 'pixi.js';


export class HelpScene extends AbstractScene<number> {

    private menu: MenuItem[] = [];

    public constructor () {
        super(-1);
    }

    update (delta: number): void {
        this.menu.forEach(({cm}) => cm?.brightness(0.7, false));
        if (this.state in this.menu) {
            this.menu[this.state].cm?.brightness(1.0, false);
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
            m.btn!.filters = [...(m.btn!.filters || []), m.outline = new OutlineFilter(), m.cm = new filters.ColorMatrixFilter()];
            m.btn!.interactive = true;
            m.btn!.on('click', () => {
                Audio.getInstance().playSample(cache.sfx[SFX_CODE.S_SELECT]);
                this.state = 0;
                this.resolve(new MainMenuScene(3));
            });
            m.btn!.position.set((this.width-m.btn!.width)/2, this.height-2-m.btn!.height);
            this.addChild(m.btn!);

            resolve(true);
        })
    }
}
