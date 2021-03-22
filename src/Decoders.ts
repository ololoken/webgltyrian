import {ItemsFormatter, StringFormatter} from "@ololoken/struct";
import {COMP_TILE_HEIGHT, COMP_TILE_WIDTH, TyPalette, TyShape} from "./Structs";

export const PascalDecryptFormatter = (key: number[]) : ItemsFormatter<number, string> => (data) => {
    for (let i = data.length-1, l = key.length; i >= 0; --i) {
        data[i] ^= key[i%l];
        data[i] ^= data[i-1];
    }
    return StringFormatter({encoding: 'ascii'})(data);
}

export const PaletteDecoder = (pals: TyPalette[]) => pals.reduce((table: number[][][], {colors}) => {
    // The VGA hardware palette used only 6 bits per component, so the values need to be rescaled to
    // 8 bits. The naive way to do this is to simply do (c << 2), padding it with 0's, however this
    // makes the maximum value 252 instead of the proper 255. A trick to fix this is to use the upper 2
    // bits of the original value instead. This ensures that the value goes to 255 as the original goes
    // to 63.
    // And I'm too lazy to move it to the PaletteShader
    // todo: move to PaletteShader
    table.push(colors.map(color => [((color.r << 2) | (color.r >> 4)),
                                    ((color.g << 2) | (color.g >> 4)),
                                    ((color.b << 2) | (color.b >> 4)),
                                    255]));
    return table;
}, []).flat(2);

export const TyShapeDecoder: (tyShape: TyShape) => TyShape = tyShape => {
    //unpack shape data
    if (tyShape.hasData) {
        let [pl] = tyShape.payload;
        let l = pl.width * pl.height;
        let t = new Array(l).fill(0);//empty transparent sprite
        for (let ptr = 0, i = 0; i < l;) {
            switch (pl.data[ptr]) {
                case 0xFF: //transparent pixels; next value tells length
                    ptr++;
                    i += pl.data[ptr];
                    break;
                case 0xFE: //next row
                    i += (pl.width - (i % pl.width))
                    break;
                case 0xFD: //one transparent
                    i++;
                    break;
                default:
                    t[i] = pl.data[ptr];
                    i++;
                    break;
            }
            ptr++;
        }
        pl.data = t;
    }
    return tyShape;
}
//todo: fixme
export const TyShapeCompressedDecoder: (compressed: number[]) => TyShape = compressed => {
    let unpacked: number[] = [],
        width = COMP_TILE_WIDTH, height = COMP_TILE_HEIGHT;
    for (let ptr = 0; compressed[ptr] != 0x0F && ptr < width*height; ++ptr) {
        let transparentCount = (compressed[ptr] & 0x0F);
        for (let i = 0; i < transparentCount; i++) unpacked.push(0);//set transparent pixels
        let dataCount = (compressed[ptr] & 0xF0) >> 4;
        for (let i = 0; i < dataCount; i++) unpacked.push(compressed[++ptr]);//copy N pixels with value following current position
    }

    if (unpacked.length == width*height) {
        console.log(compressed);
    }

    let data = new Array(width*height).fill(0);
    for (let i = 0, l = unpacked.length; i < l; i++) {
        data[i] = unpacked[i];
    }

    return {hasData: unpacked.length, payload: [{width, height, size: 0, data}]};
}
