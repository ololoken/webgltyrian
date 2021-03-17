import {EventBase} from "../EventBase";
import {TyEpisodeMapEvent} from "../../Structs";
import {TyEventType} from "../EventSystem";

export class StarSwitch extends EventBase {
    public readonly state: boolean;
    public constructor(e: TyEpisodeMapEvent) {
        super(e)
        this.state = e.type == TyEventType.STAR_ON;
    }
}
