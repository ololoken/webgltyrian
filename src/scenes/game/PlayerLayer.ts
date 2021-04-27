import {Container} from "pixi.js";
import {PlayerGraphic, WorldObject, IPlayerLayer, PlayerShotGraphic} from "../../world/Types";
import {PlayerRender} from "./PlayerRender";
import {cache} from "../../Resources";
import {PlayerShotRender} from "./PlayerShotRender";
import {PLAYER_CONTAINER_HEIGHT, PLAYER_CONTAINER_WIDTH} from "../../Structs";

export class PlayerLayer extends Container implements IPlayerLayer {

    public constructor () {
        super();
        this.position.set(0, 0);
        this.width = PLAYER_CONTAINER_WIDTH;
        this.height = PLAYER_CONTAINER_HEIGHT;
        this.filters = [cache.palettes[0]];
    }

    registerPlayer(player: PlayerGraphic): WorldObject {
        let plr = this.addChild(new PlayerRender(player));
        return {
            name: plr.name!,
            position: plr.position,
            animationStep: plr.animationStep,
            getBoundingRect: () => {
                let rect = plr.getLocalBounds(),
                    pos = plr.getGlobalPosition!();
                rect.x = pos.x;
                rect.y = pos.y;
                return rect;
            }
        }
    }

    registerShot(shot: PlayerShotGraphic): WorldObject {
        let s = this.addChild(new PlayerShotRender(shot));
        return {
            name: s.name!,
            position: s.position,
            animationStep: s.cycle,
            getBoundingRect: () => {
                let rect = s.getLocalBounds(),
                    pos = s.getGlobalPosition!();
                rect.x = pos.x;
                rect.y = pos.y;
                return rect;
            }
        }
    }

    unregisterObject(name: string): void {
        this.removeChild(this.getChildByName!(name));
    }

}
