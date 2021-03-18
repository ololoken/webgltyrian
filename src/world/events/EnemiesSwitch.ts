import {EventBase} from "../EventBase";
import {TyEpisodeMapEvent} from "../../Structs";
import {EventKey, TyEventType} from "../EventMappings";

export class EnemiesSwitch extends EventBase {
    key: EventKey = 'EnemiesSwitch';
    public readonly state: boolean;
    public constructor (e: TyEpisodeMapEvent) {
        super(e);
        this.state = e.type == TyEventType.ENEMIES_ON;
    }
}
