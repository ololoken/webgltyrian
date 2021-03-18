import {TyEpisodeMapEvent} from "../../Structs";
import {EventBase} from "../EventBase";
import {EventKey} from "../EventMappings";

export class BackDelay extends EventBase {
    key: EventKey = 'BackDelay';
    public readonly type: number;
    public constructor(e: TyEpisodeMapEvent) {
        super(e);
        this.type = e.data1;
    }
}
