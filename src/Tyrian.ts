import {Application} from 'pixi.js';
import Stats from 'stats.js'
import {initBasicResources} from "./Resources";
import {SceneManager} from "./scenes/SceneManager";
import {IntroScene} from "./scenes/menu/IntroScene";
import {MAIN_HEIGHT, MAIN_WIDTH} from "./Structs";

const SCALE = 3;

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

    new SceneManager(app.stage, app.ticker, stats)
        .play(new IntroScene(0));
})()
