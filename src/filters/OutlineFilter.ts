import { Filter } from 'pixi.js';
import { fragment } from './ShaderDecorators';

export class OutlineFilter extends Filter {
    //todo: add uniforms to change outline color and width
    @fragment(`
precision mediump float;

const float offset = 1.0 / 512.0;//texel [0..1] size depends on texture size
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
void main () {
    vec4 col = texture2D(uSampler, vTextureCoord);
    
        float a = texture2D(uSampler, vec2(vTextureCoord.x + offset, vTextureCoord.y)).a +
                  texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - offset)).a +
                  texture2D(uSampler, vec2(vTextureCoord.x - offset, vTextureCoord.y)).a +
                  texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + offset)).a;
        if (col.a < 1.0 && a > 0.0) {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 0.8);
        }
        else {
            gl_FragColor = col;
        }
}
    `)
    static fragmentShader: string;

    public constructor() {
        super(undefined, OutlineFilter.fragmentShader);
        this.padding = 5;
        this.autoFit = false;
    }
}

