import { AbstractMenuScene } from './AbstractMenuScene';
import { PCX } from '../../Const';
import { SelectEpisodeScene } from './SelectEpisodeScene';
import { pcxSprite } from '../../Resources';


export class SelectGameModeScene extends AbstractMenuScene {

    public constructor () {
        super(0, [
            {text: '1 Player Full Game', target: () => new SelectEpisodeScene()},
            {text: '1 Player Arcade'},
            {text: 'Network Game'}
        ]);
    }

    update (delta: number): void {
        this.menu.forEach(({cm}) => cm?.brightness(0.7, false));
        if (this.active in this.menu) {
            this.menu[this.active].cm?.brightness(1.0, false);
        }
    }

    unload (): Promise<void> {
        return super.unload();
    }

    load (): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            this.addChild(pcxSprite(PCX.SUB_SELECT));
            this.setupReturnButton();
            this.setupMenu(25);

            resolve(true);
        })
    }
}
