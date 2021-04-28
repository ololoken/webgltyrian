import {EventBase} from "../EventBase";
import {EventKey} from "../EventMappings";
import {TyEpisodeMapEvent, TyEventType} from "../../Structs";

export class EnemiesOverSwitch extends EventBase {
    key: EventKey = 'EnemiesOverSwitch';

    public readonly state: boolean;

    public constructor(e: TyEpisodeMapEvent) {
        super(e);
        this.state = e.type == TyEventType.ENEMIES_TOP_OVER_ON
    }
}
