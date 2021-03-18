import {TyEpisodeMapEvent} from "../../Structs";
import {EventBase} from "../EventBase";
import {EventKey} from "../EventMappings";

export class EnemiesLoadShapes extends EventBase {
    key: EventKey = 'EnemiesLoadShapes';
    public readonly shapes: number[];
    public constructor(e: TyEpisodeMapEvent) {
        super(e);
        this.shapes = [e.data1, e.data2, e.data3, e.data4];
    }
}
