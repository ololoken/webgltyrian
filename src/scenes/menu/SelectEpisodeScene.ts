import {PCX, pcxSprite} from "../../Resources";
import {AbstractMenuScene} from "./AbstractMenuScene";
import {SetupMissionMenu} from "./SetupMissionMenu";
import {MissionGameScene} from "../game/MissionGameScene";


export class SelectEpisodeScene extends AbstractMenuScene {

    public constructor () {
        super(-1, [
            {text: 'Episode 1', target: () => new SetupMissionMenu({episode: 1})},
            {text: 'Episode 2', target: () => new SetupMissionMenu({episode: 2})},
            {text: 'Episode 3', target: () => new SetupMissionMenu({episode: 3})},
            {text: 'Episode 4', target: () => new SetupMissionMenu({episode: 4})},
            {text: 'Run Demo Mission', target: () => new MissionGameScene({episodeNumber: 1, mapIndex: 8})},
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
