import {BaseTexture, Texture, Rectangle, FORMATS, TARGETS, TYPES, MIPMAP_MODES, Sprite, Container, BufferResource} from "pixi.js";
import {PaletteFilter} from "./filters/PaletteFilter";
import {
    TyCompressedShapesOffsets,
    TyPalettesStruct,
    TyPCXImage,
    TyPCXOffsetsStruct,
    ReadBytes,
    TyShapesTableStruct,
    TyShapeTablesHeaderStruct,
    TyEpisodeMapsFileHeaderStruct,
    TyItemsStruct,
    TyItems,
    TyEpisodeMapStruct,
    TyLevelScriptStruct,
    TyMapBackgroundShapesStruct,
    TyShape,
    TILE_WIDTH, TILE_HEIGHT, PALETTE_SIZE, TyEpisodeMap,
} from "./Structs";
import {PaletteDecoder, TyShapeDecoder, TyShapeW12Decoder} from "./Decoders";
import {MAIN_HEIGHT, MAIN_WIDTH} from "./Tyrian";

type ResourceInit = (dt: DataView) => void;
type Resource = {[code: string]: {path: string, init: ResourceInit}};

export enum PCX {
    NAME_1 = 0,
    SUB_SELECT = 1,
    HUD_ONE = 2,
    MENU_BG = 3,
    NAME_5 = 4,
    HUD_TWO = 5,
    NAME_7 = 6,
    NAME_8 = 7,
    NAME_9 = 8,
    INTRO_LOGO1 = 9,
    NOME_ = 10,
    INTRO_LOGO2 = 11,
    INTRO_LOGO2_ = 12,
}
const PCX_PAL_INDEX = [0, 7, 5, 8, 10, 5, 18, 19, 19, 20, 21, 22, 5];
export const SHAPE_FILE_CODE = [
    '2', '4', '7', '8', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
    'O', 'P', 'Q', 'R', 'S', 'T', 'U', '5', '#', 'V', '0', '@', '3', '^', '5', '9'
].map(c => c.charCodeAt(0));
const FontSprite: number[] = [
    -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,
    -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,
    -1,  26,  33,  60,  61,  62,  -1,  32,  64,  65,  63,  84,  29,  83,  28,  80, //  !"#$%&'()*+,-./
    79,  70,  71,  72,  73,  74,  75,  76,  77,  78,  31,  30,  -1,  85,  -1,  27, // 0123456789:;<=>?
    -1,   0,   1,   2,   3,   4,   5,   6,   7,   8,   9,  10,  11,  12,  13,  14, // @ABCDEFGHIJKLMNO
    15,  16,  17,  18,  19,  20,  21,  22,  23,  24,  25,  68,  82,  69,  -1,  -1, // PQRSTUVWXYZ[\]^_
    -1,  34,  35,  36,  37,  38,  39,  40,  41,  42,  43,  44,  45,  46,  47,  48, // `abcdefghijklmno
    49,  50,  51,  52,  53,  54,  55,  56,  57,  58,  59,  66,  81,  67,  -1,  -1, // pqrstuvwxyz{|}~⌂

    86,  87,  88,  89,  90,  91,  92,  93,  94,  95,  96,  97,  98,  99, 100, 101, // ÇüéâäàåçêëèïîìÄÅ
    102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, // ÉæÆôöòûùÿÖÜ¢£¥₧ƒ
    118, 119, 120, 121, 122, 123, 124, 125, 126,  -1,  -1,  -1,  -1,  -1,  -1,  -1, // áíóúñÑªº¿
    -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,
    -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,
    -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,
    -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,
    -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,
];

export enum SpriteTableIndex {
    FONT_LARGE = 0,
    FONT_REGULAR = 1,
    FONT_SMALL = 2
}

type TyEpisodeData = {
    episode: number, script: string, maps: TyEpisodeMap[], items: TyItems
}

export const cache : {
        pcxBaseTexture?: BaseTexture,
        palettes: PaletteFilter[],
        shapeTextures: {frames: Rectangle[], texture: BaseTexture}[],
        episodes: TyEpisodeData[]
    } = {shapeTextures: [], episodes: [], palettes: []}

const generatePalettes: ResourceInit = (dt) => {
    const data = PaletteDecoder(TyPalettesStruct.unpack(dt).palettes);
    for (let i = 0; i < data.length/(PALETTE_SIZE*4); i++) {
        data[PALETTE_SIZE * 4 * i + 3] = 0;//zero alpha for colors at 0 index in palette;
    }
    let paletteTexture = new Texture(BaseTexture.fromBuffer(Uint8Array.from(data), PALETTE_SIZE, data.length/(PALETTE_SIZE*4), {
        width: PALETTE_SIZE,
        height: data.length/(PALETTE_SIZE*4),
        format: FORMATS.RGBA,
        type: TYPES.UNSIGNED_BYTE,
        target: TARGETS.TEXTURE_2D,
        mipmap: MIPMAP_MODES.OFF
    }));
    cache.palettes = [...new Array(data.length/(PALETTE_SIZE*4)).keys()]
        .map(index => new PaletteFilter(index, paletteTexture));
}

const generatePCXTexture: ResourceInit = (dt) => {
    const offsets = [...TyPCXOffsetsStruct.unpack(dt).offsets, dt.byteLength];
    const count = offsets.length-1;
    const imgSize = MAIN_WIDTH*MAIN_HEIGHT;
    const imageBuffer: Uint8Array = new Uint8Array(imgSize*count).fill(0);
    for (let i = 0; i < count; i++) {
        const {img} = TyPCXImage(offsets[i], offsets[i+1]-offsets[i]).unpack(dt);
        for (let offset = 0, dPtr = 0, sPtr = 0; offset < imgSize;) {
            if ((img[sPtr] & 0xC0) == 0xC0) {
                for (let y = 0; y < (img[sPtr] & 0x3F); y++) {
                    imageBuffer[i*imgSize+dPtr+y] = img[sPtr+1];
                }
                offset += (img[sPtr] & 0x3F);
                dPtr += (img[sPtr] & 0x3F);
                sPtr += 2;
            }
            else {
                offset++;
                imageBuffer[i*imgSize+dPtr++] = img[sPtr++];
            }
        }
    }
    cache.pcxBaseTexture = BaseTexture.fromBuffer(imageBuffer, MAIN_WIDTH, count*MAIN_HEIGHT, {
        width: MAIN_WIDTH,
        height: count*MAIN_HEIGHT,
        format: FORMATS.ALPHA,
        type: TYPES.UNSIGNED_BYTE,
        target: TARGETS.TEXTURE_2D
    })
}

const generateTexturesFromShapes: ResourceInit = (dt) => TyShapeTablesHeaderStruct.unpack(dt).offsets
    .map((offset, idx, offsets) => {
        switch (true) {
            //misc sprites with W & H
            case idx < 7:// fonts, interface, option sprites
                return TyShapesTableStruct.unpack(dt, offset).shapes.map(TyShapeDecoder);
            default:
                return TyCompressedShapesOffsets(offset).unpack(dt, offset).offsets
                    .reduce((shapes: number[][], shapeOffset, i, shapesOffsets) => {
                        let nextShapeOffset = i < shapesOffsets.length ? shapesOffsets[i+1] : offsets[idx+1]-offset;
                        let {data} = ReadBytes(nextShapeOffset-shapeOffset).unpack(dt, offset+shapeOffset);
                        shapes.push(data);
                        return shapes;
                    }, [])
                    .map(TyShapeW12Decoder);
        }
    })
    .forEach((shapes, idx) => {
        cache.shapeTextures[idx] = shapesToTexture(shapes);
    });

export type TextureAtlas = {
    frames: Rectangle[],
    texture: BaseTexture<BufferResource>
}

const shapesToTexture = (shapes: TyShape[], tSize = 512): TextureAtlas => {
    const sortedBySize = shapes.map((sp, idx) => ({idx, sp}))
        .sort((a, b) => {
            let aD = a.sp.hasData ? a.sp.payload[0].height * a.sp.payload[0].width : 0,
                bD = b.sp.hasData ? b.sp.payload[0].height * b.sp.payload[0].width : 0;
            return aD-bD == 0 ? b.idx-a.idx : aD-bD;
        });

    let textureData = new Uint8Array(tSize*tSize);
    let rowHeight = 0, xOffset = 0, yOffset = 0;
    let frames: Rectangle[] = [];
    //create sprite sheet: copy shapes to texture and save frame information
    for (let i = 0; i < sortedBySize.length; i++) {
        if (!sortedBySize[i].sp.hasData) {
            frames[sortedBySize[i].idx] = new Rectangle(tSize, tSize, 0, 0);
            continue;
        }
        let [s] = sortedBySize[i].sp.payload;
        if (xOffset + s.width > tSize) {
            xOffset = 0;
            yOffset += rowHeight;
            rowHeight = 0;
        }
        frames[sortedBySize[i].idx] = new Rectangle(xOffset, yOffset, s.width, s.height);
        rowHeight = rowHeight < s.height ? s.height : rowHeight;
        for (let y = 0; y < s.height; y++) {
            for (let x = 0; x < s.width; x++) {
                let tX = xOffset+x;
                let tY = (yOffset+y)*tSize
                textureData[tY+tX] = s.data[y*s.width+x];
            }
        }
        xOffset += s.width;
    }
    let lastFrame = frames[frames.length-1];
    if (tSize < lastFrame.x+lastFrame.width || tSize < lastFrame.y+lastFrame.height) {
        console.warn(`shapes doesn't fit texture size`);
    }

    return {frames, texture: BaseTexture.fromBuffer(textureData, tSize, tSize, {
            width: tSize,
            height: tSize,
            format: FORMATS.ALPHA,
            type: TYPES.UNSIGNED_BYTE,
            target: TARGETS.TEXTURE_2D
        })}
}

export const pcxSprite = (pcx: PCX): Sprite => Object.assign(
    new Sprite(new Texture(cache.pcxBaseTexture!, new Rectangle(0, MAIN_HEIGHT*pcx, MAIN_WIDTH, MAIN_HEIGHT))),
    {filters: [cache.palettes[PCX_PAL_INDEX[pcx]]]}
)

export const getSprite = (table: number, index: number, palette?: number) => Object.assign(
    new Sprite(new Texture(cache.shapeTextures[table].texture, cache.shapeTextures[table].frames[index])),
    {filters: palette && palette >= 0 ? [cache.palettes[palette]] : []});

export const textContainer = (text: string, font: SpriteTableIndex, palette: number): Container =>
    text.split('')
        .reduce(({container, x}, char) => {
            switch (char) {
                case ' ':
                    x += 6;
                    break;
                case '~'://todo: highlight text
                    break;
                default:
                    let sp = getSprite(font, FontSprite[char.charCodeAt(0)], -1);
                    sp.position.x = x;
                    container.addChild(sp);
                    x += sp.width+1;
                    break;
            }
            return {container, x};
        }, {container: Object.assign(new Container(), {filters: palette >= 0 ? [cache.palettes[palette]] : []}), x: 0}).container;


const basicResources: Resource = {
    pal: {path: 'palette.dat', init: generatePalettes},
    pcx: {path: 'tyrian.pic', init: generatePCXTexture},
    shp: {path: 'tyrian.shp', init: generateTexturesFromShapes}
}

const getFileDataView = async (path: string) => fetch(`/assets/data/${path}`)
    .then(r => r.arrayBuffer())
    .then(b => new DataView(b));

export const initBasicResources = async () => Promise.all(Object.values(basicResources)
    .map((res) => getFileDataView(res.path).then(dt => res.init(dt))));

export const getEpisodeData = async (episode: number): Promise<TyEpisodeData> => {
    if (episode in cache.episodes) return cache.episodes[episode];
    let levelData = await getFileDataView(`tyrian${episode}.lvl`);
    const mapsFileHeader = TyEpisodeMapsFileHeaderStruct.unpack(levelData);

    let items: TyItems;
    if (episode < 4) {
        items = await getFileDataView(`tyrian.hdt`).then(data => {
            let itemsOffset = data.getInt32(0, true);
            return TyItemsStruct.unpack(data, itemsOffset);
        });
    }
    else {//episode 4 items data is stored in level file
        items = TyItemsStruct.unpack(levelData, [...mapsFileHeader.offsets].pop());
    }

    let maps = mapsFileHeader.offsets.filter((offset, idx) => 0 === idx%2 && idx < mapsFileHeader.length-2)
        .map(offset => TyEpisodeMapStruct.unpack(levelData, offset));

    let script = await getFileDataView(`levels${episode}.dat`).then(scriptData =>
        TyLevelScriptStruct.unpack(scriptData).strings.map(s => s.data).join('\n'));
    return cache.episodes[episode] = {episode, script, maps, items}
}

export const generateTexturesAtlasFromCompressedShapes = async (shapesFile: number, mask: 'shapes{%c}.dat' | 'newsh{%c}.shp'): Promise<TextureAtlas> =>
    getFileDataView(mask.replace('{%c}', String.fromCharCode(shapesFile).toLowerCase()))
        .then(shapesData => TyMapBackgroundShapesStruct.unpack(shapesData))
        .then(({shapes}) => shapesToTexture(shapes.map(s => {
            if (s.hasData) {//map shapes has standard size, but I suspect it's specified in last 520 bytes of the mapShapesFile
                s.payload[0].width = TILE_WIDTH;
                s.payload[0].height = TILE_HEIGHT;
            }
            return s;
        })));
