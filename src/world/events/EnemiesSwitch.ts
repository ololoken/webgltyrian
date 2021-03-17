import {EventBase} from "../EventBase";
import {TyEpisodeMapEvent} from "../../Structs";
import {TyEventType} from "../EventMappings";

export class EnemiesSwitch extends EventBase {
    public readonly state: boolean;
    public constructor (e: TyEpisodeMapEvent) {
        super(e);
        this.state = e.type == TyEventType.ENEMIES_ON;
    }
}
