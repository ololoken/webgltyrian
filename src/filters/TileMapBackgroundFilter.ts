import {BaseTexture, Filter, FORMATS, TARGETS, Texture, TYPES, Rectangle, Point} from "pixi.js";
import {fragment, vertex} from "./ShaderDecorators";
import {MAP_TILE_HEIGHT, MAP_TILE_WIDTH} from "../Structs";
import {TextureAtlas} from "../Resources";

export class TileMapBackgroundFilter extends Filter {
    @vertex(`
precision highp float;
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
precision highp float;
varying vec2 vTextureCoord;//standard pixi uniforms
uniform vec4 outputFrame;
uniform vec4 inputSize;

uniform sampler2D uAtlas;//texture with tiles
uniform vec2 uAtlasSize;
uniform vec2 uTileSize;
uniform vec2 uOutSize;//"css" output size

uniform sampler2D uMapping;//zw - tile coords in atlas
uniform vec2 uMappingSize;//uBackground size
uniform vec2 uBackgroundSize;//background size in tiles
uniform vec2 uBackgroundOffset;//background offset in pixels

void main() {
    vec2 uv = vTextureCoord/outputFrame.zw*inputSize.xy;//remap to [0..1] as output depends on "inner" tileset
    vec2 screenTile = uv*(uOutSize/uTileSize)+uBackgroundOffset/uTileSize;

    vec2 tileCoord = floor(screenTile);
    vec2 tileInnerCoord = fract(screenTile)*uTileSize/uAtlasSize;

    float mappingIndex = tileCoord.y*uBackgroundSize.x+tileCoord.x;
    float mappingY = floor(mappingIndex/uMappingSize.x);
    float mappingX = mappingIndex-mappingY*uMappingSize.x;
    vec2 shapeCoord = vec2(mappingX, mappingY)/uMappingSize;
    
    vec2 tileAtlasCoord = texture2D(uMapping, shapeCoord).zw*uTileSize*255.0/uAtlasSize;

    vec4 tileColor = texture2D(uAtlas, tileAtlasCoord+tileInnerCoord);
    gl_FragColor = tileColor;
}
    `)
    static fragmentShader: string;

    private readonly mappingTextureSize = 128;

    public readonly backgroundOffset = new Point(0, 0);

    public constructor (background: number[], shapesMapping: number[], atlas: TextureAtlas,
                        outWidth: number, outHeight: number,
                        backgroundWidth: number, backgroundHeight: number) {
        super(TileMapBackgroundFilter.vertexShader, TileMapBackgroundFilter.fragmentShader);

        this.uniforms.uAtlas = atlas.texture;
        this.uniforms.uAtlasSize = [atlas.texture.width, atlas.texture.height];
        this.uniforms.uTileSize = [MAP_TILE_WIDTH, MAP_TILE_HEIGHT];
        this.uniforms.uOutSize = [outWidth, outHeight];

        this.uniforms.uMapping = this.toTexture(background, shapesMapping, atlas.frames);
        this.uniforms.uMappingSize = [this.mappingTextureSize, this.mappingTextureSize];
        this.uniforms.uBackgroundSize = [backgroundWidth, backgroundHeight];
        this.uniforms.uBackgroundOffset = this.backgroundOffset;

        this.autoFit = false;
    }

    private toTexture (background: number[], shapesMapping: number[], frames: Rectangle[]): Texture {
        return new Texture(BaseTexture.fromBuffer(background.reduce((buffer, shapeId, idx) => {
                //pascal specific -1
                let rect = frames[shapesMapping[shapeId]];
                buffer[4 * idx + 0] = 0;
                buffer[4 * idx + 1] = 0;
                buffer[4 * idx + 2] = rect.x/MAP_TILE_WIDTH;
                buffer[4 * idx + 3] = rect.y/MAP_TILE_HEIGHT;
                return buffer
            }, new Uint8Array(this.mappingTextureSize*this.mappingTextureSize*4)), this.mappingTextureSize, this.mappingTextureSize, {
            width: this.mappingTextureSize,
            height: this.mappingTextureSize,
            format: FORMATS.RGBA,
            type: TYPES.UNSIGNED_BYTE,
            target: TARGETS.TEXTURE_2D
        }));
    }
}

