import {EventBase} from "../EventBase";
import {EventKey} from "../EventMappings";
import {TyEpisodeMapEvent} from "../../Structs";

export class EnemySmallAdjustPos extends EventBase {
    key: EventKey = 'EnemySmallAdjustPos';
    public readonly state: boolean;
    public constructor (e: TyEpisodeMapEvent) {
        super(e);
        this.state = Boolean(e.data1);
    }
}
