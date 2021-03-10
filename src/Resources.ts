import {l, la, Primitive, Struct} from "@ololoken/struct";
import {BaseTexture, Texture, Rectangle, FORMATS, TARGETS, TYPES, MIPMAP_MODES, Sprite, Container} from "pixi.js";
import {PaletteFilter} from "./filters/PaletteFilter";

const [UInt16, Int16, Byte, Char, UInt32, Int32] =
      [Primitive.UInt16LE(), Primitive.Int16LE(), Primitive.UInt8(), Primitive.Int8(), Primitive.UInt32LE(), Primitive.Int32LE()];

type ResourceInit = (dt: DataView) => void;
type Resource = {[code: string]: {path: string, data: DataView|null, init: ResourceInit}};

export const init = async () => Promise.all(Object.entries(files).map(([code, {path}]) =>
    fetch(`/assets/data/${path}`).then(r => r.arrayBuffer())
        .then(b => files[code].data = new DataView(b))
        .then(dt => files[code].init(dt))
));

type rgb = {r: number, g: number, b: number};
type palette = {colors: rgb[]};
const palettesStruct = new Struct<{palettes: palette[]}>()//palette.dat
    .array('palettes', new Struct<palette>()
        .array('colors', new Struct<rgb>()
            .single('r', Byte)
            .single('g', Byte)
            .single('b', Byte), l(256)), Struct.all);

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
export const PCX_PAL_INDEX = [0, 7, 5, 8, 10, 5, 18, 19, 19, 20, 21, 22, 5];
const pcxOffsetsStruct = new Struct<{imagesLength: number, offsets: number[]}>()//tyrian.pic
    .single('imagesLength', UInt16)
    .array('offsets', Int32, la('imagesLength'));

type TySpritePayload = {width: number, height: number, size: number, data: number[]}
type TySprite = {hasData: number, payload: TySpritePayload[]};
const spriteTablesHeaderStruct = new Struct<{tablesCount: number, offsets: number[]}>()
    .single('tablesCount', UInt16)
    .array('offsets', UInt32, la('tablesCount'))
const spriteStruct = new Struct<TySprite>()
    .single('hasData', Byte)
    .array('payload', new Struct<TySpritePayload>()
        .single('width', UInt16)
        .single('height', UInt16)
        .single('size', UInt16)
        .array('data', Byte, la('size')), ({hasData}) => hasData)
const spritesTableStruct = new Struct<{count: number, sprites: TySprite[]}>()
    .single('count', UInt16)
    .array('sprites', spriteStruct, la('count'));

type SpriteTable = {
    shots1: number[],
    shots2: number[],
    ship: number[],
    powerup: number[],
    coin: number[]
};
export enum SpriteTableIndex {
    FONT_LARGE = 0,
    FONT_REGULAR = 1,
    FONT_SMALL = 2
}
export const cache : {
        palette?: Texture, pcxBaseTexture?: BaseTexture,
        spriteTables: SpriteTable,
        sprites: {frames: Rectangle[], texture: BaseTexture}[]
    } = {
    sprites: [],
    spriteTables: {
        shots1: [],
        shots2: [],
        ship: [],
        powerup: [],
        coin: []
    },
}
const loadPalettes: ResourceInit = (dt) => {
    const paletteSize = 256;
    const table = palettesStruct.unpack(dt).palettes.reduce((table: number[][][], {colors}) => {
        // The VGA hardware palette used only 6 bits per component, so the values need to be rescaled to
        // 8 bits. The naive way to do this is to simply do (c << 2), padding it with 0's, however this
        // makes the maximum value 252 instead of the proper 255. A trick to fix this is to use the upper 2
        // bits of the original value instead. This ensures that the value goes to 255 as the original goes
        // to 63.
        // And I'm too lazy to move it to the PaletteShader
        // todo: move to PaletteShader
        table.push(colors.map(color => [((color.r << 2) | (color.r >> 4)),
                                        ((color.g << 2) | (color.g >> 4)),
                                        ((color.b << 2) | (color.b >> 4))]));
        return table;
    }, []);

    cache.palette = new Texture(BaseTexture.fromBuffer(Uint8Array.from(table.flat(2)), paletteSize, table.length, {
        width: paletteSize,
        height: table.length,
        format: FORMATS.RGB,
        type: TYPES.UNSIGNED_BYTE,
        target: TARGETS.TEXTURE_2D,
        mipmap: MIPMAP_MODES.OFF
    }))
}

const preloadPCX: ResourceInit = (dt) => {
    const offsets = [...pcxOffsetsStruct.unpack(dt).offsets, dt.byteLength];
    const count = offsets.length-1;
    const width = 320, height = 200;
    const imgSize = width*height;
    const images: Uint8Array = new Uint8Array(imgSize*count).fill(0);
    for (let i = 0; i < count; i++) {
        const {img}: {img: number[]} = new Struct<{img: number[]}>()
            .goto(() => offsets[i])
            .array('img', Byte, l(offsets[i+1]-offsets[i])).unpack(files.pcx.data!);
        for (let offset = 0, dPtr = 0, sPtr = 0; offset < imgSize;) {
            if ((img[sPtr] & 0xC0) == 0xC0) {
                for (let y = 0; y < (img[sPtr] & 0x3F); y++) {
                    images[i*imgSize+dPtr+y] = img[sPtr+1];
                }
                offset += (img[sPtr] & 0x3F);
                dPtr += (img[sPtr] & 0x3F);
                sPtr += 2;
            }
            else {
                offset++;
                images[i*imgSize+dPtr++] = img[sPtr++];
            }
        }
    }
    cache.pcxBaseTexture = BaseTexture.fromBuffer(images, width, count*height, {
        width: width,
        height: count*height,
        format: FORMATS.ALPHA,
        type: TYPES.UNSIGNED_BYTE,
        target: TARGETS.TEXTURE_2D
    })
}

const initSpritesTable: ResourceInit = (dt) => {
    const unpackedSprites: TySprite[][] = []
    spriteTablesHeaderStruct.unpack(dt).offsets.forEach((offset, idx, offsets) => {
        switch (true) {
            case idx < 7:// fonts, interface, option sprites
                unpackedSprites[idx] = spritesTableStruct.unpack(dt, offset).sprites;
                unpackedSprites[idx].forEach(tySprite => {
                    if (!tySprite.hasData) return;
                    let l = tySprite.payload[0].width*tySprite.payload[0].height;
                    let t = new Array(l).fill(0);//empty transparent sprite
                    for (let ptr = 0, i = 0; i < l;) {
                        switch (tySprite.payload[0].data[ptr]) {
                            case 0xFF: //transparent pixels; next value tells length
                                ptr++;
                                i += tySprite.payload[0].data[ptr];
                                break;
                            case 0xFE: //next row
                                i += (tySprite.payload[0].width-(i%tySprite.payload[0].width))
                                break;
                            case 0xFD: //one transparent
                                i++;
                                break;
                            default:
                                t[i] = tySprite.payload[0].data[ptr];
                                i++;
                                break;
                        }
                        ptr++;
                    }
                    tySprite.payload[0].data = t;
                })
                break;
            case idx == 7://who knows?
                break;
            //todo: unpack and generate textures as well
            case idx == 8:// player shot sprites
                cache.spriteTables.shots1 = new Struct<{shots1: number[]}>()
                    .array('shots1', Byte, l(offsets[idx+1]-offset))
                    .unpack(dt, offset).shots1;
                break;
            case idx == 9:// player ship sprites
                cache.spriteTables.ship = new Struct<{ship: number[]}>()
                    .array('ship', Byte, l(offsets[idx+1]-offset))
                    .unpack(dt, offset).ship;
                break;
            case idx == 10:// power-up sprites
                cache.spriteTables.powerup = new Struct<{powerup: number[]}>()
                    .array('powerup', Byte, l(offsets[idx+1]-offset))
                    .unpack(dt, offset).powerup;
                break;
            case idx == 11:// coins, datacubes, etc sprites
                cache.spriteTables.coin = new Struct<{coin: number[]}>()
                    .array('coin', Byte, l(offsets[idx+1]-offset))
                    .unpack(dt, offset).coin;
                break;
            case idx == 12:// more player shot sprites
                cache.spriteTables.shots2 = new Struct<{shots2: number[]}>()
                    .array('shots2', Byte, l(dt.byteLength-offset))
                    .unpack(dt, offset).shots2;
                break;
        }
    });
    const tSize = 512;
    unpackedSprites.forEach((sprites, idx) => {
        //size ascending sort: naive way to reduce required texture size, but it works.
        const sortedBySize = sprites.map((sp, idx) => ({idx, sp}))
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
        console.log(xOffset+yOffset*tSize, tSize*tSize)

        cache.sprites[idx] = {
            texture: BaseTexture.fromBuffer(textureData, tSize, tSize, {
                width: tSize,
                height: tSize,
                format: FORMATS.ALPHA,
                type: TYPES.UNSIGNED_BYTE,
                target: TARGETS.TEXTURE_2D
            }),
            frames
        }
    })
}

const files: Resource = {
    pal: {path: 'palette.dat', data: null, init: loadPalettes},
    pcx: {path: 'tyrian.pic', data: null, init: preloadPCX},
    shp: {path: 'tyrian.shp', data: null, init: initSpritesTable}
}

export const FontSprite: number[] = [
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

export const pcxSprite = (pcx: PCX): Sprite => Object.assign(
    new Sprite(new Texture(cache.pcxBaseTexture!, new Rectangle(0, 200*pcx, 320, 200))),
    {filters: [new PaletteFilter(PCX_PAL_INDEX[pcx])]}
)

export const getSprite = (table: number, index: number, palette?: number) => Object.assign(
    new Sprite(new Texture(cache.sprites[table].texture, cache.sprites[table].frames[index])),
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
