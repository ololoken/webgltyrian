import { Container } from 'pixi.js';
import { IPlayerGraphic, IWorldObject, IPlayerLayer, PlayerShotGraphic } from '../../world/Types';
import { PLAYER_CONTAINER_HEIGHT, PLAYER_CONTAINER_WIDTH } from '../../Const';
import { PlayerRender } from './PlayerRender';
import { PlayerShotRender } from './PlayerShotRender';
import { cache } from '../../Resources';

export class PlayerLayer extends Container implements IPlayerLayer {

    public constructor () {
        super();
        this.position.set(0, 0);
        this.width = PLAYER_CONTAINER_WIDTH;
        this.height = PLAYER_CONTAINER_HEIGHT;
        this.filters = [cache.palettes[0]];
    }

    registerPlayer (player: IPlayerGraphic): IWorldObject {
        let plr = this.addChild(new PlayerRender(player));
        return {
            name: plr.name!,
            position: plr.position,
            animationStep: plr.animationStep,
            getBoundingRect: () => {
                let rect = plr.getLocalBounds();
                rect.x = plr.position.x;
                rect.y = plr.position.y;
                return rect;
            }
        }
    }

    registerShot (shot: PlayerShotGraphic): IWorldObject {
        let s = this.addChild(new PlayerShotRender(shot));
        return {
            name: s.name!,
            position: s.position,
            animationStep: s.cycle,
            getBoundingRect: () => {
                let rect = s.getLocalBounds();
                rect.x = s.position.x;
                rect.y = s.position.y;
                return rect;
            }
        }
    }

    unregisterObject (name: string): void {
        this.removeChild(this.getChildByName!(name)!);
    }

}
