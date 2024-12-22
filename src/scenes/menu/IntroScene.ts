import { AbstractScene } from '../AbstractScene';
import { pcxSprite } from '../../Resources';
import { MainMenuScene } from './MainMenuScene';
import { PCX } from '../../Const';

export class IntroScene extends AbstractScene<number> {
    private readonly duration = 50;
    private elapsed = 0;

    public update (delta: number): void {
        this.elapsed += delta;
        if (this.elapsed >= this.duration && this.state == 0) {
            this.state = 1;
            this.removeChildAt(1);
        }
        if (this.elapsed >= this.duration*2) {
            this.resolve(new MainMenuScene())
        }
    }


    load(): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            this.addChild(pcxSprite(PCX.INTRO_LOGO2));
            this.addChild(pcxSprite(PCX.INTRO_LOGO1));
            resolve(true);
        })
    }

}
