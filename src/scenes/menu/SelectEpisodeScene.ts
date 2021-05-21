import {PCX, pcxSprite} from "../../Resources";
import {AbstractMenuScene} from "./AbstractMenuScene";
import {MissionGameScene} from "../game/MissionGameScene";


export class SelectEpisodeScene extends AbstractMenuScene {

    public constructor () {
        super(-1, [
            {text: 'Episode 1', target: () => new MissionGameScene({episodeNumber: 1, mapIndex: 8})},
        ]);
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
