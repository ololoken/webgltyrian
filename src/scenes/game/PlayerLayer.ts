import {Container} from "pixi.js";
import {PlayerGraphic, WorldObject, IPlayerLayer} from "../../world/Types";
import {PlayerRender} from "./PlayerRender";
import {cache} from "../../Resources";

export class PlayerLayer extends Container implements IPlayerLayer {

    public constructor () {
        super();
        this.position.set(0, 0);
        this.width = 260;
        this.height = 190;
        this.filters = [cache.palettes[0]];
    }

    registerPlayer(player: PlayerGraphic): WorldObject {
        let plr = this.addChild(new PlayerRender(player));
        return {
            name: plr.name!,
            position: plr.position,
            animationStep: plr.animationStep
        }
    }
}
