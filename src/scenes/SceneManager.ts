import {Container, Ticker} from "pixi.js";
import {IScene} from "./AbstractScene";

export class SceneManager {
    private readonly root: Container;
    private ticker: Ticker;
    private currentScene?: IScene;
    private stats?: Stats;

    public constructor (root: Container, ticker: Ticker, stats?: Stats) {
        this.root = root;
        this.ticker = ticker;
        this.stats = stats;

        this.ticker.maxFPS = 40;
    }

    public play (scene: IScene): void {
        scene.load().then(loaded => {
            this.root.removeChildren();
            this.root.addChild(this.currentScene = scene).play().then(next => {
                this.ticker.remove(this.tickerCallback, this).stop();
                //todo: push some kind of transition here
                this.currentScene?.unload()
                    .then(() => this.play(next));
            });
            this.ticker.add(this.tickerCallback, this).start();
        })
    }

    public tickerCallback (dt: number) {
        this.stats && this.stats.begin();
        this.currentScene!.update(dt);
        this.stats && this.stats.end();
    }
}
