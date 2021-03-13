import {Filter, Texture} from "pixi.js";
import {fragment, vertex} from "./ShaderDecorators";
import {
    MAP_1_HEIGHT,
    MAP_1_WIDTH,
    MAP_2_HEIGHT,
    MAP_2_WIDTH,
    MAP_3_HEIGHT,
    MAP_3_WIDTH, TILE_HEIGHT,
    TILE_MAX_INDEX, TILE_WIDTH
} from "../Structs";

export class TileMapFilter extends Filter {
    @vertex(`
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
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform sampler2D uAtlas;
uniform vec2 uTileSize;
uniform vec4 outputFrame;
const int TILE_MAX_INDEX = ${TILE_MAX_INDEX};
const int MAP_1_WIDTH = ${MAP_1_WIDTH};
const int MAP_1_HEIGHT = ${MAP_1_HEIGHT};
const int MAP_2_WIDTH = ${MAP_2_WIDTH};
const int MAP_2_HEIGHT = ${MAP_2_HEIGHT};
const int MAP_3_WIDTH = ${MAP_3_WIDTH};
const int MAP_3_HEIGHT = ${MAP_3_HEIGHT};
uniform vec2[TILE_MAX_INDEX] uTileCoords;
uniform int[MAP_1_WIDTH*MAP_1_HEIGHT] uMap1;
uniform int uMap1x;
uniform int[MAP_2_WIDTH*MAP_2_HEIGHT] uMap2;
uniform int uMap2x;
uniform int[MAP_3_WIDTH*MAP_3_HEIGHT] uMap3;
uniform int uMap3x;
uniform float uMap0x;
uniform float uMap0y;

void main() {
    int tile1x = int(floor((uMap0x+outputFrame.x+outputFrame.w*vTextureCoord.x)/float(MAP_1_WIDTH)));
    int tile1y = int(floor((uMap0y+outputFrame.y+outputFrame.z*vTextureCoord.y)/float(MAP_1_HEIGHT)));
    vec2 tile1SubCoords = vec2(vTextureCoord.x-float(tile1x)*uTileSize.x, vTextureCoord.y-float(tile1y)*uTileSize.y);
    vec2 tile1At = uTileCoords[MAP_1_WIDTH*tile1y+tile1x];
    vec4 texel = texture2D(uAtlas, tile1At/outputFrame.zw+tile1SubCoords);
    
    gl_FragColor = texel;
}
    `)
    static fragmentShader: string;

    public constructor (map: number[], atlas: {texture: Texture, coors: {x: number, y: number}[]}, maps: {
        map1x: number, map2x: number, map3x: number,
        map1: number[], map2: number[], map3: number[]
    }) {
        super(TileMapFilter.vertexShader, TileMapFilter.fragmentShader);
        this.uniforms.uAtlas = atlas.texture;
        this.uniforms.uTileCoords = atlas.coors;
        this.uniforms.uTileSize = {x: TILE_WIDTH, y: TILE_HEIGHT};
        this.uniforms.uMap1 = maps.map1;
        this.uniforms.uMap2 = maps.map2;
        this.uniforms.uMap3 = maps.map3;
        this.uniforms.uMap1x = maps.map1x;
        this.uniforms.uMap2x = maps.map2x;
        this.uniforms.uMap3x = maps.map3x;
        this.uniforms.uMap0x = 0.0;
        this.uniforms.uMap0y = 0.0;
        this.autoFit = false;
    }
}

