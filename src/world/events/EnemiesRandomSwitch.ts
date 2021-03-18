import {EventBase} from "../EventBase";
import {TyEpisodeMapEvent} from "../../Structs";
import {EventKey, TyEventType} from "../EventMappings";

export class EnemiesRandomSwitch extends EventBase {
    key: EventKey = 'EnemiesRandomSwitch';
    public readonly state: boolean;
    public constructor (e: TyEpisodeMapEvent) {
        super(e);
        this.state = e.type == TyEventType.ENEMIES_RANDOM_ON;
    }
}
