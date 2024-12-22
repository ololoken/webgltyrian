import {
  BaseTexture,
  BufferResource,
  Container,
  FORMATS,
  MIPMAP_MODES,
  Rectangle,
  Sprite,
  TARGETS,
  TYPES,
  Texture,
} from 'pixi.js';
import { PaletteFilter } from './filters/PaletteFilter';
import { PaletteDecoder, TyShapeDecoder, TyShapeCompressedDecoder } from './Decoders';
import {
  TyPalettesStruct,
  TyPCXImage,
  TyPCXOffsetsStruct,
  TyShapesTableStruct,
  TyShapeTablesHeaderStruct,
  TyEpisodeMapsFileHeaderStruct,
  TyEpisodeItemsStruct,
  TyEpisodeItems,
  TyEpisodeMapStruct,
  TyStringsStruct,
  TyMapBackgroundShapesStruct,
  TyShape,
  TyEpisodeMap,
  TyCompressedShapesData,
  TyMusicHeaderStruct,
  TySong,
  TySongStruct,
  TySoundData,
} from './Structs';
import {
  FontSprite,
  MAP_TILE_HEIGHT,
  MAP_TILE_WIDTH,
  PALETTE_SIZE,
  PCM_RESAMPLE_RATE,
  PCX,
  PCX_PAL_INDEX,
  SpriteTableIndex,
  MAIN_HEIGHT, MAIN_WIDTH
} from './Const';

type ResourceInit = (dt: DataView) => void;

type TyEpisodeData = {
  episode: number, script: string, maps: TyEpisodeMap[], items: TyEpisodeItems
}

const resources = import.meta.glob('../data/*.*', { eager: true, as: 'url' });

export const cache : {
  pcxBaseTexture?: BaseTexture,
  palettes: PaletteFilter[],
  mainShapeBanks: TextureAtlas[],
  enemyShapeBanks: TextureAtlas[],
  explosionShapeBank?: TextureAtlas,
  episodes: TyEpisodeData[],
  songs: TySong[],
  sfx: Float32Array[],
  vfx: Float32Array[],
  txt: String[]
} = {mainShapeBanks: [], episodes: [], palettes: [], enemyShapeBanks: [], songs: [], sfx: [], vfx: [], txt: []}

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

const generateMainShapeBanks: ResourceInit = (dt) => TyShapeTablesHeaderStruct.unpack(dt).offsets
  .map((offset, idx, offsets) => {
    switch (true) {
      //misc sprites with defined W & H
      case idx < 7:// fonts, interface, option sprites
        return TyShapesTableStruct.unpack(dt, offset).shapes.map(TyShapeDecoder);
      //compressed sprites
      default:
        let shapes: TyShape[] = [];
        let compressed = TyCompressedShapesData(offset, idx+1 < offsets.length ? offsets[idx+1] : Number.MAX_SAFE_INTEGER)
            .unpack(dt, offset);
        for (let i = 0; i < compressed.offsets.length; i++) {
          shapes.push(TyShapeCompressedDecoder(compressed.data, compressed.offsets[i]));
        }
        return shapes;
    }
  })
  .forEach((shapes, idx) => {
    cache.mainShapeBanks[idx] = shapesToTexture(shapes);
  });

const generateSongs: ResourceInit = (dt) => TyMusicHeaderStruct.unpack(dt).offsets
  .forEach((offset, idx, offsets) => {
    cache.songs[idx] = TySongStruct.unpack(dt, offset)
  })

const generateSounds: (cacheIndex: 'sfx' | 'vfx') => ResourceInit = (cacheIndex) => (dt) =>
  TyMusicHeaderStruct.unpack(dt).offsets.forEach((offset, idx, offsets) =>
    cache[cacheIndex][idx] = Float32Array.from(TySoundData(offset, (idx+1 < offsets.length ? offsets[idx+1] : Number.MAX_SAFE_INTEGER)-offset)
      .unpack(dt, offset).sound
        .reduce((resampled, pcm, idx) => {
          resampled.push(...new Array(PCM_RESAMPLE_RATE).fill((pcm << 24 >> 24)/128));
          return resampled;
        }, <number[]>[]))
  )

export type TextureAtlas = {
  frames: Rectangle[],
  texture: BaseTexture<BufferResource>
}

const shapesToTexture = (shapes: TyShape[], tSize = 512): TextureAtlas => {
  const sortedBySize = shapes.map((sp, idx) => ({idx, sp}))
    .filter(({idx, sp}) => !!sp)//skip empty data in case of "wide" indexes
    .sort((a, b) => {
      const aD = a.sp.hasData ? a.sp.payload[0].height * a.sp.payload[0].width : 0,
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

  const texture = BaseTexture.fromBuffer(textureData, tSize, tSize, {
    width: tSize,
    height: tSize,
    format: FORMATS.ALPHA,
    type: TYPES.UNSIGNED_BYTE,
    target: TARGETS.TEXTURE_2D
  });

  return {frames, texture}
}

export const pcxSprite = (pcx: PCX): Sprite => Object.assign(
  new Sprite(new Texture(cache.pcxBaseTexture!, new Rectangle(0, MAIN_HEIGHT*pcx, MAIN_WIDTH, MAIN_HEIGHT))),
  { filters: [cache.palettes[PCX_PAL_INDEX[pcx]]] }
)

export const getSprite = (table: number, index: number, palette?: number) => Object.assign(
  new Sprite(new Texture(cache.mainShapeBanks[table].texture, cache.mainShapeBanks[table].frames[index])),
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

const getTextData: ResourceInit = (dt: DataView) => {
  let itemsOffset = dt.getInt32(0, true);
  cache.txt = TyStringsStruct.unpack(new DataView(dt.buffer, 4, itemsOffset-4))
    .strings.map(s => s.data);
}

const getFileDataView = async (path: string) => fetch(resources[`../data/${path}`])
  .then(r => r.arrayBuffer())
  .then(b => new DataView(b));
console.log(resources, resources[`../data/palette.dat`])
export const initBasicResources = () => Promise.all([
  {path: 'palette.dat', init: generatePalettes},
  {path: 'tyrian.pic', init: generatePCXTexture},
  {path: 'tyrian.shp', init: generateMainShapeBanks},
  {path: 'music.mus', init: generateSongs},
  {path: 'tyrian.hdt', init: getTextData},
  {path: 'tyrian.snd', init: generateSounds('sfx')},
  {path: 'voices.snd', init: generateSounds('vfx')}
].map((res) => getFileDataView(res.path)
  .then(dt => res.init(dt))))

export const getEpisodeData = async (episode: number): Promise<TyEpisodeData> => {
  if (episode in cache.episodes) return cache.episodes[episode];
  const levelData = await getFileDataView(`tyrian${episode}.lvl`);
  const mapsFileHeader = TyEpisodeMapsFileHeaderStruct.unpack(levelData);

  const items = episode >= 4
    //episode 4 items data is stored in level file
    ? TyEpisodeItemsStruct.unpack(levelData, [...mapsFileHeader.offsets].pop())
    : await getFileDataView(`tyrian.hdt`)
        .then(data => TyEpisodeItemsStruct.unpack(data, data.getInt32(0, true)));

  const maps = mapsFileHeader.offsets.filter((offset, idx) => 0 === idx%2 && idx < mapsFileHeader.length-2)
    .map(offset => TyEpisodeMapStruct.unpack(levelData, offset));

  const script = await getFileDataView(`levels${episode}.dat`).then(scriptData =>
    TyStringsStruct.unpack(scriptData).strings.map(s => s.data).join('\n'));
  return cache.episodes[episode] = {episode, script, maps, items}
}

export const generateBackgroundTexturesAtlas = async (shapesFile: number): Promise<TextureAtlas> =>
  getFileDataView(`shapes${String.fromCharCode(shapesFile).toLowerCase()}.dat`)
    .then(shapesData => TyMapBackgroundShapesStruct.unpack(shapesData))
    .then(({shapes}) => shapesToTexture(shapes.map(s => {
      if (s.hasData) //map shapes has standard size, but I suspect it's specified in last 520 bytes of the mapShapesFile
        Object.assign(s.payload[0], {
          width: MAP_TILE_WIDTH,
          height: MAP_TILE_HEIGHT
        })
      return s;
    })));

export const generateEnemyShapeBankTextureAtlas = async (code: string): Promise<TextureAtlas> =>
  getFileDataView(`newsh${code}.shp`)
    .then(shapesData => {
      let shapes: TyShape[] = [];
      let compressed = TyCompressedShapesData(0, Number.MAX_SAFE_INTEGER).unpack(shapesData);
      for (let i = 0; i < compressed.offsets.length; i++) {
        shapes.push(TyShapeCompressedDecoder(compressed.data, compressed.offsets[i]));
      }
      return shapes;
    }).then(shapes => shapesToTexture(shapes))
