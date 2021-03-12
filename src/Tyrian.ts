import {Application} from 'pixi.js';
import Stats from 'stats.js'
import {initBasicResources} from "./Resources";
import {SceneManager} from "./scenes/SceneManager";
import {IntroScene} from "./scenes/menu/IntroScene";

(async () => {
    const app = new Application({width: 640, height: 400, backgroundColor: 0x000000, autoStart: false, antialias: false});
    const stats = new Stats();
    stats.showPanel(0);

    app.view.style.display = 'block';
    app.view.style.margin = '0 auto'
    document.body.appendChild(app.view);
    document.body.appendChild(stats.dom);

    app.stage.scale.set(2, 2);

    await initBasicResources();

    new SceneManager(app.stage, app.ticker, stats)
        .play(new IntroScene());
})()
