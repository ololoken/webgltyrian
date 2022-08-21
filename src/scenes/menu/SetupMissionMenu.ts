import {AbstractScene} from "../AbstractScene";
import {
    getEpisodeData,
    PCX,
    pcxSprite
} from "../../Resources";
import {Episode} from "../../world/Episode";

export class SetupMissionMenu extends AbstractScene<{episode: number}> {
    load (): Promise<boolean> {
        return new Promise<boolean>(async resolve => {
            let episodeData = await getEpisodeData(this.state.episode);
            console.log(new Episode(episodeData.script));
            this.addChild(pcxSprite(PCX.MISSION_SETUP));
            resolve(true);
        });
    }

    update (delta: number): void {
    }
}
