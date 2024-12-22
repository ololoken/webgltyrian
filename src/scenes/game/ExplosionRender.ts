import { Sprite, Texture, ObservablePoint } from 'pixi.js'
import { Explosion } from '../../world/Types';
import { cache, TextureAtlas } from '../../Resources';

export class ExplosionRender extends Sprite {

    private static childId = 0;

    public readonly cycle: ObservablePoint;
    private readonly atlas: TextureAtlas;
    private readonly graphic: number;

    public constructor (explosion: Explosion) {
        super(new Texture(cache.explosionShapeBank!.texture, cache.explosionShapeBank!.frames[explosion.sprite]));
        this.atlas = cache.explosionShapeBank!;
        this.graphic = explosion.sprite;
        this.name = `ex${++ExplosionRender.childId}`;
        this.position.set(explosion.position.x, explosion.position.y);
        this.cycle = new ObservablePoint(this.updateAnimation, this, 0, 0);
    }

    private updateAnimation (): void {
        this.texture.frame = this.atlas.frames[this.graphic+this.cycle.x];
    }
}
