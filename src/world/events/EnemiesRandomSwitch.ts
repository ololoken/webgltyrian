import {EventBase} from "../EventBase";
import {TyEpisodeMapEvent, TyEventType} from "../../Structs";
import {EventKey} from "../EventMappings";

export class EnemiesRandomSwitch extends EventBase {
    key: EventKey = 'EnemiesRandomSwitch';
    public readonly state: boolean;
    public constructor (e: TyEpisodeMapEvent) {
        super(e);
        this.state = e.type == TyEventType.ENEMIES_RANDOM_ON;
    }
}
