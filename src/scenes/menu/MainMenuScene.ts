import { AbstractMenuScene } from './AbstractMenuScene';
import { HelpScene } from './HelpScene';
import { PCX } from '../../Const';
import { SelectGameModeScene } from './SelectGameModeScene';
import { Sprite } from 'pixi.js'
import { getSprite, pcxSprite } from '../../Resources';
import { MissionGameScene } from "../game/MissionGameScene";


export class MainMenuScene extends AbstractMenuScene {

    private logo?: Sprite;

    public constructor(active: number = -1) {
        super(active, [
            {text: 'Start New Game', target: () => new MissionGameScene({episodeNumber: 1, mapIndex: 8})},
            {text: 'Load Game',},
            {text: 'Demo'},
            {text: 'Instructions', target: () => new HelpScene()},
            {text: 'High Scores'}
        ]);
    }

    public update (delta: number): void {
        if (this.logo!.position.y > 4) {
            this.logo!.position.y -= delta*1.5;
            if (this.logo!.position.y > 4) {
                this.state = 0;
            }
        }
        super.update(delta);
    }

    unload (): Promise<void> {
        this.logo = undefined;
        return super.unload();
    }

    load (): Promise<boolean> {
        return new Promise<boolean>(async resolve => {
            this.addChild(pcxSprite(PCX.MENU_BG));

            this.logo = getSprite(3, 146, 8);
            this.logo.position.set(11, this.state < 0 ? 62 : 4)
            this.addChild(this.logo);

            this.setupMenu(110);

            resolve(true);
        });
    }

}
