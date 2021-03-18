import {EventBase} from "../EventBase";
import {EventKey} from "../EventMappings";

export class ShowMessage extends EventBase {
    key: EventKey = 'ShowMessage';
}
