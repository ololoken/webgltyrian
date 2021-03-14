import {BaseTexture, Filter, FORMATS, TARGETS, Texture, TYPES} from "pixi.js";
import {fragment, vertex} from "./ShaderDecorators";
import {
    MAP_1_HEIGHT,
    MAP_1_WIDTH,
    MAP_2_HEIGHT,
    MAP_2_WIDTH,
    MAP_3_HEIGHT,
    MAP_3_WIDTH, MAP_TO_SHAPE_MAX_INDEX, TILE_HEIGHT,
    TILE_MAX_INDEX, TILE_WIDTH, TyEpisodeMap
} from "../Structs";
import {MapTextureAtlas} from "../Resources";

export class TileMapFilter extends Filter {
    @vertex(`
precision mediump float;
attribute vec2 aVertexPosition;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

uniform vec4 inputSize;
uniform vec4 outputFrame;

vec4 filterVertexPosition (void) {
    vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;

    return vec4((projectionMatrix * vec3(position, 1.)).xy, 0., 1.);
}

vec2 filterTextureCoord (void) {
    return aVertexPosition * (outputFrame.zw * inputSize.zw);
}

void main (void) {
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
}
    `)
    static vertexShader: string;


    @fragment(`
precision mediump float;
varying vec2 vTextureCoord;
uniform vec4 outputFrame;
uniform vec4 inputSize;
uniform vec4 filterArea;

uniform sampler2D uAtlas;
uniform vec2 uTileSize;
uniform vec2 uOutSize;

uniform ivec2 map1size;

uniform sampler2D uMap1;
uniform vec2 uMapPos;

void main() {
    vec2 uv = vTextureCoord/outputFrame.zw*inputSize.xy;//remap to [0..1] as output depends on "inner" tileset
    vec2 screenTile1 = uv*(uOutSize/uTileSize);
    ivec2 tileIdx1 = ivec2(floor(screenTile1+uMapPos));
    vec2 tileCoord1 = fract(screenTile1)*uTileSize/512.0;
    float p1 = float(tileIdx1.y*map1size.y+tileIdx1.x);
    float ly1 = floor(p1/128.);
    float lx1 = p1-ly1*128.;
    vec2 lookup1 = vec2(ly1, lx1)/128.;
    vec4 mapShapeIdx1 = texture2D(uMap1, lookup1);
    vec2 subLookup1 = vec2(mapShapeIdx1.r+mapShapeIdx1.g, 
                           mapShapeIdx1.b+mapShapeIdx1.a)*256.0/512.0;
    vec4 tileColor = texture2D(uAtlas, subLookup1+tileCoord1);
    gl_FragColor = 
        //vec4(subLookup1, 0., 1.);
        tileColor;
}
    `)
    static fragmentShader: string;

    public constructor (map: TyEpisodeMap, atlas: MapTextureAtlas, width: number, height: number) {
        super(TileMapFilter.vertexShader, TileMapFilter.fragmentShader);
        this.uniforms.uAtlas = atlas.texture;
        this.uniforms.uTileSize = [TILE_WIDTH, TILE_HEIGHT];
        this.uniforms.uMap1 = this.toTexture(map.map.map1, map.map.shapeMap1, atlas.frames.map(r => [r.x, r.y]));
        this.uniforms.map1size = [MAP_1_WIDTH, MAP_1_HEIGHT];
        this.uniforms.uMap1x = map.map1x;
        this.uniforms.uMap2x = map.map2x;
        this.uniforms.uMap3x = map.map3x;
        this.uniforms.uMapPos = [5.0, 100.0];
        this.uniforms.uOutSize = [width, height];
        this.autoFit = false;
    }

    private toTexture (map: number[], shapeMap: number[], frames: number[][]): Texture {
        let buffer = new Uint8Array(128*128*4);console.log(map.map(m => shapeMap[m]-1));
        map.map(m => shapeMap[m]-1).map(s => frames[s] || [-1, -1])
            .forEach(([x, y], idx) => {
                if (x == -1 && y == -1) {
                    buffer[4 * idx + 0] =
                    buffer[4 * idx + 1] =
                    buffer[4 * idx + 2] =
                    buffer[4 * idx + 3] = 255;
                }
                else {
                    buffer[4 * idx + 0] = Math.min(x, 255);
                    buffer[4 * idx + 1] = Math.max(x - 255, 0);
                    buffer[4 * idx + 2] = Math.min(y, 255);
                    buffer[4 * idx + 3] = Math.max(y - 255, 0);
                }
            });
        return new Texture(BaseTexture.fromBuffer(buffer, 128, 128, {
            width: 128, height: 128,
            format: FORMATS.RGBA,
            type: TYPES.UNSIGNED_BYTE,
            target: TARGETS.TEXTURE_2D
        }));
    }
}

