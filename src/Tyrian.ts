import {Application, Ticker} from 'pixi.js';
import Stats from 'stats.js'
import {initBasicResources} from "./Resources";
import {SceneManager} from "./scenes/SceneManager";
import {IntroScene} from "./scenes/menu/IntroScene";

export const MAIN_WIDTH = 320, MAIN_HEIGHT = 200,
             SCALE = 4;

(async () => {
    const TYRIAN = new Application({width: SCALE*MAIN_WIDTH, height: SCALE*MAIN_HEIGHT, backgroundColor: 0x000000,
        autoStart: false, antialias: false});
    const stats = new Stats();
    Ticker.shared.stop();
    stats.showPanel(0);
    stats.dom.style.cssText = 'position:fixed;top:0;right:0;cursor:pointer;opacity:0.9;z-index:10000';

    //TYRIAN.view?.style.cssText = 'float:left;';

    document.body.style.cssText = 'padding:0;margin:0';
    document.body.appendChild(TYRIAN.view as HTMLCanvasElement);
    document.body.appendChild(stats.dom);

    TYRIAN.stage.scale.set(SCALE, SCALE);

    await initBasicResources();

    new SceneManager(TYRIAN, stats)
        .play(new IntroScene(0));
})()
