import {BaseTexture, Texture, Rectangle, FORMATS, TARGETS, TYPES, MIPMAP_MODES, Sprite, Container} from "pixi.js";
import {PaletteFilter} from "./filters/PaletteFilter";
import {
    CompressedShapesOffsets,
    PalettesStruct, PCXImage,
    PCXOffsetsStruct, ReadBytes,
    ShapesTableStruct,
    ShapeTablesHeaderStruct,
    EpisodeMapsFileHeaderStruct, ItemsStruct, TyItems, EpisodeMapStruct, LevelScriptStruct, MapShapesStruct, TyShape,
} from "./Structs";
import {PaletteDecoder, TyShapeDecoder, TyShapeW12Decoder} from "./Decoders";

type ResourceInit = (dt: DataView) => void;
type Resource = {[code: string]: {path: string, init: ResourceInit}};

export enum PCX {
    NAME_1 = 0,
    SELECT_EPISODE = 1,
    NAME_3 = 2,
    MENU_BG = 3,
    NAME_5 = 4,
    NAME_6 = 5,
    NAME_7 = 6,
    NAME_8 = 7,
    NAME_9 = 8,
    INTRO_LOGO1 = 9,
    NOME_ = 10,
    INTRO_LOGO2 = 11,
    INTRO_LOGO2_ = 12,
}
const PCX_PAL_INDEX = [0, 7, 5, 8, 10, 5, 18, 19, 19, 20, 21, 22, 5];
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
export const cache : {
        palette?: Texture, pcxBaseTexture?: BaseTexture,
        shapeTextures: {frames: Rectangle[], texture: BaseTexture}[],
        episodes: {}[]
    } = {shapeTextures: [], episodes: []}

const generatePaletteTexture: ResourceInit = (dt) => {
    const paletteSize = 256;
    const data = PaletteDecoder(PalettesStruct.unpack(dt).palettes);
    cache.palette = new Texture(BaseTexture.fromBuffer(Uint8Array.from(data), paletteSize, data.length/(paletteSize*3), {
        width: paletteSize/(paletteSize*3),
        height: data.length,
        format: FORMATS.RGB,
        type: TYPES.UNSIGNED_BYTE,
        target: TARGETS.TEXTURE_2D,
        mipmap: MIPMAP_MODES.OFF
    }))
}

const generatePCXTexture: ResourceInit = (dt) => {
    const offsets = [...PCXOffsetsStruct.unpack(dt).offsets, dt.byteLength];
    const count = offsets.length-1;
    const width = 320, height = 200;
    const imgSize = width*height;
    const imageBuffer: Uint8Array = new Uint8Array(imgSize*count).fill(0);
    for (let i = 0; i < count; i++) {
        const {img} = PCXImage(offsets[i], offsets[i+1]-offsets[i]).unpack(dt);
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
    cache.pcxBaseTexture = BaseTexture.fromBuffer(imageBuffer, width, count*height, {
        width: width,
        height: count*height,
        format: FORMATS.ALPHA,
        type: TYPES.UNSIGNED_BYTE,
        target: TARGETS.TEXTURE_2D
    })
}

const generateTexturesFromShapes: ResourceInit = (dt) => ShapeTablesHeaderStruct.unpack(dt).offsets
    .map((offset, idx, offsets) => {
        switch (true) {
            //misc sprites with W & H
            case idx < 7:// fonts, interface, option sprites
                return ShapesTableStruct.unpack(dt, offset).shapes.map(TyShapeDecoder);
            default:
                return CompressedShapesOffsets(offset).unpack(dt, offset).offsets
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

const shapesToTexture = (shapes: TyShape[], tSize = 512) => {
    const sortedBySize = shapes.map((sp, idx) => ({idx, sp}))
        .sort((a, b) => {
            if (a.sp.hasData && b.sp.hasData)
                return a.sp.payload[0].height*a.sp.payload[0].width-b.sp.payload[0].height*b.sp.payload[0].width
            else if (!a.sp.hasData)
                return 1;
            else if (!b.sp.hasData)
                return -1;
            return 0
        });

    let textureData = new Uint8Array(tSize*tSize);
    let rowHeight = 0, xOffset = 0, yOffset = 0;
    let frames: Rectangle[] = [];
    //create sprite sheet: copy shapes to texture and save frame information
    for (let i = 0; i < sortedBySize.length; i++) {
        if (!sortedBySize[i].sp.hasData) {continue}
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
    new Sprite(new Texture(cache.pcxBaseTexture!, new Rectangle(0, 200*pcx, 320, 200))),
    {filters: [new PaletteFilter(PCX_PAL_INDEX[pcx])]}
)

export const getSprite = (table: number, index: number, palette?: number) => Object.assign(
    new Sprite(new Texture(cache.shapeTextures[table].texture, cache.shapeTextures[table].frames[index])),
    {filters: palette && palette >= 0 ? [new PaletteFilter(palette)] : []});

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
        }, {container: Object.assign(new Container(), {filters: palette >= 0 ? [new PaletteFilter(palette)] : []}), x: 0}).container;


const basicResources: Resource = {
    pal: {path: 'palette.dat', init: generatePaletteTexture},
    pcx: {path: 'tyrian.pic', init: generatePCXTexture},
    shp: {path: 'tyrian.shp', init: generateTexturesFromShapes}
}

const getFileDataView = async (path: string) => fetch(`/assets/data/${path}`)
    .then(r => r.arrayBuffer())
    .then(b => new DataView(b));

export const initBasicResources = async () => Promise.all(Object.values(basicResources)
    .map((res) => getFileDataView(res.path).then(dt => res.init(dt))));

export const getEpisodeData = async (episode: number) => {
    if (episode in cache.episodes) return cache.episodes[episode];
    let levelData = await getFileDataView(`tyrian${episode}.lvl`);
    const mapsFileHeader = EpisodeMapsFileHeaderStruct.unpack(levelData);

    let items: TyItems;
    if (episode < 4) {
        items = await getFileDataView(`tyrian.hdt`).then(data => {
            let itemsOffset = data.getInt32(0, true);
            return ItemsStruct.unpack(data, itemsOffset);
        });
    }
    else {//episode 4 items data is stored in level file
        items = ItemsStruct.unpack(levelData, [...mapsFileHeader.offsets].pop());
    }

    let maps = mapsFileHeader.offsets.filter((offset, idx) => 0 === idx%2 && idx < mapsFileHeader.length-2)
        .map(offset => EpisodeMapStruct.unpack(levelData, offset));

    let script = await getFileDataView(`levels${episode}.dat`).then(scriptData =>
        LevelScriptStruct.unpack(scriptData).strings.map(s => s.data).join('\n'));
    return cache.episodes[episode] = {episode, script, maps, items}
}

export const generateTexturesFromMapShapes = async (mapShapesFile: number) =>
    getFileDataView(`shapes${String.fromCharCode(mapShapesFile).toLowerCase()}.dat`)
        .then(shapesData => MapShapesStruct.unpack(shapesData))
        .then(({shapes}) => shapesToTexture(shapes.map(s => {
            if (s.hasData) {//map shapes has standard size, but I suspect it's specified in last 520 bytes of the mapShapesFile
                s.payload[0].width = 24;
                s.payload[0].height = 28;
            }
            return s;
        })));
