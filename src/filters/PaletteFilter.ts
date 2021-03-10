import {Filter} from "pixi.js";
import {cache} from "../Resources";

/**
 * Just to enable glsl highlighting using via idea's language injection
 * @param shaderSrc
 */
export function fragment (shaderSrc: string) {
    return (
        target: {fragmentShader: string},
        propertyKey: string,
    ): void => {
        target.fragmentShader = shaderSrc;
    };
}

export function vertex (shaderSrc: string) {
    return (
        target: {vertexShader: string},
        propertyKey: string,
    ): void => {
        target.vertexShader = shaderSrc;
    };
}

export class PaletteFilter extends Filter {
    @fragment(`
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform sampler2D uPalette;
uniform float uPaletteIndex;
uniform float uPaletteSize;

void main() {
    float index = texture2D(uSampler, vTextureCoord).a;
    if (index == 0.0) return;
    vec4 texel = texture2D(uPalette, vec2(index, 1.0/uPaletteSize*uPaletteIndex));
    gl_FragColor = texel;
}
    `)
    static fragmentShader: string;

    public constructor (palette: number) {
        super(undefined, PaletteFilter.fragmentShader);
        this.uniforms.uPalette = cache.palette;
        this.uniforms.uPaletteIndex = palette;
        this.uniforms.uPaletteSize = cache.palette!.height;
        this.autoFit = false;
    }
}

