import {EventBase} from "../EventBase";
import {EventKey, TyEventType} from "../EventMappings";
import {TyEpisodeMapEvent} from "../../Structs";

export class BackOverSwitch extends EventBase {
    key: EventKey = 'BackOverSwitch';

    public readonly backTopOver: number = -1;

    public constructor (e: TyEpisodeMapEvent) {
        super(e);
        switch (e.type) {
            case TyEventType.BACK_3_OVER_1: this.backTopOver = 1; break;
            case TyEventType.BACK_3_OVER_OFF: this.backTopOver = 0; break;
            case TyEventType.BACK_3_OVER_2: this.backTopOver = 2; break;
        }
    }
}
