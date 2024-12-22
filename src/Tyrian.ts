import Stats from 'stats.js'
import { Application, Ticker } from 'pixi.js';
import { IntroScene } from './scenes/menu/IntroScene';
import { MAIN_HEIGHT, MAIN_WIDTH, SCALE } from './Const';
import { SceneManager } from './scenes/SceneManager';
import { initBasicResources } from './Resources';

const TYRIAN = new Application<HTMLCanvasElement>({
    width: SCALE*MAIN_WIDTH,
    height: SCALE*MAIN_HEIGHT,
    backgroundColor: 0x000000,
    autoStart: false,
    antialias: false
});
const stats = new Stats();
Ticker.shared.stop();
stats.showPanel(0);
stats.dom.style.cssText = 'position:fixed;top:0;right:0;cursor:pointer;opacity:0.9;z-index:10000';

document.body.style.cssText = 'padding:0;margin:0';
document.body.appendChild(TYRIAN.view);
document.body.appendChild(stats.dom);

TYRIAN.stage.scale.set(SCALE, SCALE);

initBasicResources()
  .then(() => new SceneManager(TYRIAN, stats))
  .then(scene => scene.play(new IntroScene(0)));

