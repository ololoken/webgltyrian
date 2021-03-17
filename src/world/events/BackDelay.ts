import {TyEpisodeMapEvent} from "../../Structs";
import {EventBase} from "../EventBase";

export class BackDelay extends EventBase {
    public readonly type: number;
    public constructor(e: TyEpisodeMapEvent) {
        super(e);
        this.type = e.data1;
    }
}
