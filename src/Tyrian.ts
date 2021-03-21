import {Application, settings} from 'pixi.js';
import Stats from 'stats.js'
import {initBasicResources} from "./Resources";
import {SceneManager} from "./scenes/SceneManager";
import {IntroScene} from "./scenes/menu/IntroScene";

export const MAIN_WIDTH = 320, MAIN_HEIGHT = 200,
             SCALE = 3,
             FPS = 40, SPF = 1/FPS;

(async () => {
    const app = new Application({width: SCALE*MAIN_WIDTH, height: SCALE*MAIN_HEIGHT, backgroundColor: 0x000000,
                                 autoStart: false, antialias: false});
    const stats = new Stats();
    stats.showPanel(0);

    app.view.style.display = 'block';
    app.view.style.margin = '0 auto'
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
