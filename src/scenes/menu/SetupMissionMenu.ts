import { AbstractScene } from '../AbstractScene';
import { Episode } from '../../world/Episode';
import { PCX } from '../../Const';
import { getEpisodeData, pcxSprite } from '../../Resources';

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
