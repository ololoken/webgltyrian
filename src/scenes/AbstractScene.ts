import {Container} from "pixi.js";

export interface IScene extends Container {
    readonly resolve: (next: IScene) => void;
    update (delta: number): void;
    unload (): Promise<void>;

    load (params?: any): Promise<boolean>;
    play (): Promise<IScene>;
}
export abstract class AbstractScene extends Container implements IScene {
    get resolve () {
        return this._resolve!;
    }

    private _resolve?: (next: IScene) => void;

    public constructor () {
        super();
    }

    abstract update (delta: number): void;
    abstract load (params?: any): Promise<boolean>;

    unload (): Promise<void> {
        this.removeChildren();
        return Promise.resolve(undefined);
    }

    play (): Promise<IScene> {
        return new Promise<IScene>(resolve => {
            this._resolve = resolve;
        })
    }

}
