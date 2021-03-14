import {BaseTexture, Filter, FORMATS, TARGETS, Texture, TYPES, Rectangle, Point} from "pixi.js";
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

uniform sampler2D uAtlas;
uniform vec2 uAtlasSize;
uniform vec2 uTileSize;
uniform vec2 uOutSize;
uniform float uMapTextureSize;

uniform sampler2D uMap;
uniform ivec2 mapSize;
uniform vec2 uMapPos;

void main() {
    vec2 uv = vTextureCoord/outputFrame.zw*inputSize.xy;//remap to [0..1] as output depends on "inner" tileset
    vec2 screenTile = uv*(uOutSize/uTileSize)+uMapPos;
    ivec2 tileIdx = ivec2(floor(screenTile));
    vec2 tileInnerCoord = fract(screenTile)*uTileSize/uAtlasSize;
    float mapTextureIndex = float(tileIdx.y*mapSize.x+tileIdx.x);
    float mapTextureY = floor(mapTextureIndex/uMapTextureSize);
    float mapTextureX = mapTextureIndex-mapTextureY*uMapTextureSize;
    vec2 shapeCoord = vec2(mapTextureX, mapTextureY)/uMapTextureSize;
    vec2 mapShapeIdx = texture2D(uMap, shapeCoord).zw;
    vec2 tileAtlasOffset = mapShapeIdx*uTileSize*255.0/uAtlasSize;
    vec4 tileColor = texture2D(uAtlas, tileAtlasOffset+tileInnerCoord);
    gl_FragColor = tileColor;
}
    `)
    static fragmentShader: string;

    private readonly mapTextureSize = 128;

    private _mapPos: Point = new Point(0, 0);
    public get mapPosition ():Point {
        return this._mapPos;
    }

    public constructor (map: number[], shapeMap: number[], atlas: MapTextureAtlas, width: number, height: number) {
        super(TileMapFilter.vertexShader, TileMapFilter.fragmentShader);

        this.uniforms.uAtlas = atlas.texture;
        this.uniforms.uAtlasSize = [atlas.texture.width, atlas.texture.height];
        this.uniforms.uTileSize = [TILE_WIDTH, TILE_HEIGHT];
        this.uniforms.uOutSize = [width, height];
        this.uniforms.uMapTextureSize = this.mapTextureSize;

        this.uniforms.uMap = this.toTexture(map, shapeMap, atlas.frames);
        this.uniforms.mapSize = [MAP_1_WIDTH, MAP_1_HEIGHT];
        this.uniforms.uMapPos = this._mapPos;

        this.autoFit = false;
    }

    private toTexture (map: number[], shapeMap: number[], frames: Rectangle[]): Texture {
        return new Texture(BaseTexture.fromBuffer(map.reduce((buffer, shapeId, idx) => {
                let rect = frames[shapeMap[shapeId]-1];
                buffer[4 * idx + 0] = 0;
                buffer[4 * idx + 1] = 0;
                buffer[4 * idx + 2] = rect.x/TILE_WIDTH;
                buffer[4 * idx + 3] = rect.y/TILE_HEIGHT;
                return buffer
            }, new Uint8Array(this.mapTextureSize*this.mapTextureSize*4)), this.mapTextureSize, this.mapTextureSize, {
            width: this.mapTextureSize,
            height: this.mapTextureSize,
            format: FORMATS.RGBA,
            type: TYPES.UNSIGNED_BYTE,
            target: TARGETS.TEXTURE_2D
        }));
    }
}

