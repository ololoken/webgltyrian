import {Filter, Texture} from "pixi.js";
import {fragment} from "./ShaderDecorators";

export class PaletteFilter extends Filter {
    @fragment(`
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform sampler2D uPalette;
uniform float uPaletteIndex;
uniform float uPaletteSize;

void main() {
    float index = texture2D(uSampler, vTextureCoord).a;
    vec4 texel = texture2D(uPalette, vec2(index, 1.0/uPaletteSize*uPaletteIndex));
    gl_FragColor = texel;
}
    `)
    static fragmentShader: string;

    public constructor (palette: number, texture: Texture) {
        super(undefined, PaletteFilter.fragmentShader);
        this.uniforms.uPalette = texture;
        this.uniforms.uPaletteIndex = palette;
        this.uniforms.uPaletteSize = texture.height;
        this.autoFit = false;
    }
}

