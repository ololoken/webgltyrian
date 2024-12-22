import Stats from 'stats.js'
import { Application } from 'pixi.js';
import { IScene } from './AbstractScene';

export class SceneManager {
    private readonly app: Application;
    private currentScene?: IScene;
    private readonly stats?: Stats;

    public static readonly TARGET_FPS = 30;
    private static readonly INTERVAL = 1000/SceneManager.TARGET_FPS;
    private prevState: number = -1;
    private requestID: number = -1;

    public constructor (root: Application, stats?: Stats) {
        this.app = root;
        this.stats = stats;
    }

    public play (scene: IScene): void {
        scene.load().then(loaded => {
            this.app.stage.removeChildren();
            this.app.stage.addChild(this.currentScene = scene).play().then(next => {
                cancelAnimationFrame(this.requestID!);
                //todo: push some kind of transition here
                this.currentScene?.unload()
                    .then(() => this.play(next));
            });
            this.animate(0);
        })
    }

    private animate (offset: number) {
        // Render loop
        this.requestID = requestAnimationFrame(this.animate.bind(this));
        this.prevState = this.prevState || offset;

        if (offset-this.prevState >= SceneManager.INTERVAL) {
            this.prevState = offset - ((offset-this.prevState)%SceneManager.INTERVAL);
            this.currentScene?.update(1);
            this.app.render();
            this.stats?.update();
        }
    }
}
