import {Application, settings} from 'pixi.js';
import Stats from 'stats.js'
import {initBasicResources} from "./Resources";
import {SceneManager} from "./scenes/SceneManager";
import {IntroScene} from "./scenes/menu/IntroScene";

export const MAIN_WIDTH = 320, MAIN_HEIGHT = 200,
             SCALE = 3,
             FPS = 40;

(async () => {
    const app = new Application({width: SCALE*MAIN_WIDTH, height: SCALE*MAIN_HEIGHT, backgroundColor: 0x000000,
                                 autoStart: false, antialias: false});
    const stats = new Stats();
    stats.showPanel(0);
    stats.dom.style.cssText = 'position:fixed;top:0;right:0;cursor:pointer;opacity:0.9;z-index:10000';

    app.view.style.cssText = 'float:left;';

    document.body.style.cssText = 'padding:0;margin:0';
    document.body.appendChild(app.view);
    document.body.appendChild(stats.dom);

    app.stage.scale.set(SCALE, SCALE);

    await initBasicResources();

    //pixi's ticker "delta" is delta*TARGET_FPMS, so we need to set it manually
    settings.TARGET_FPMS = FPS/1000;
    app.ticker.maxFPS = FPS;
    new SceneManager(app.stage, app.ticker, stats)
        .play(new IntroScene(0));
})()
