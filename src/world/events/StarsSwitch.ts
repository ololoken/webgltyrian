import {EventBase} from "../EventBase";
import {TyEpisodeMapEvent} from "../../Structs";
import {EventKey, TyEventType} from "../EventMappings";

export class StarsSwitch extends EventBase {
    key: EventKey = 'StarsSwitch';
    public readonly state: boolean;
    public constructor(e: TyEpisodeMapEvent) {
        super(e)
        this.state = e.type == TyEventType.STARS_ON;
    }
}
