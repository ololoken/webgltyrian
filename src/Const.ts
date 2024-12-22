
export enum PCX {
  MISSION_SETUP = 0,
  SUB_SELECT = 1,
  HUD_ONE = 2,
  MENU_BG = 3,
  NAME_5 = 4,
  HUD_TWO = 5,
  DEAD_REPTILIAN = 6,
  HEAD_ON_SPIKE_1 = 7,
  HEAD_ON_SPIKE_2 = 8,
  INTRO_LOGO1 = 9,
  NOME_ = 10,
  INTRO_LOGO2 = 11,
  INTRO_LOGO2_ = 12,
}
export const PCX_PAL_INDEX = [0, 7, 5, 8, 10, 5, 18, 19, 19, 20, 21, 22, 5];
export const SHAPE_FILE_CODE = [
  '2', '4', '7', '8', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
  'O', 'P', 'Q', 'R', 'S', 'T', 'U', '5', '!', 'V', '0', '@', '3', '^', '5', '9'
];
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

export enum SFX_CODE {
  S_WEAPON_1         =  0,
  S_WEAPON_2         =  1,
  S_ENEMY_HIT        =  2,
  S_EXPLOSION_4      =  3,
  S_WEAPON_5         =  4,
  S_WEAPON_6         =  5,
  S_WEAPON_7         =  6,
  S_SELECT           =  7,
  S_EXPLOSION_8      =  8,
  S_EXPLOSION_9      =  9,
  S_WEAPON_10        = 10,
  S_EXPLOSION_11     = 11,
  S_EXPLOSION_12     = 12,
  S_WEAPON_13        = 13,
  S_WEAPON_14        = 14,
  S_WEAPON_15        = 15,
  S_SPRING           = 16,
  S_WARNING          = 17,
  S_ITEM             = 18,
  S_HULL_HIT         = 19,
  S_MACHINE_GUN      = 20,
  S_SOUL_OF_ZINGLON  = 21,
  S_EXPLOSION_22     = 22,
  S_CLINK            = 23,
  S_CLICK            = 24,
  S_WEAPON_25        = 25,
  S_WEAPON_26        = 26,
  S_SHIELD_HIT       = 27,
  S_CURSOR           = 28,
  S_POWERUP          = 29,
}

export enum VFX_CODE {
  V_CLEARED_PLATFORM = 0,  // "Cleared enemy platform."
  V_BOSS             = 1,  // "Large enemy approaching."
  V_ENEMIES          = 2,  // "Enemies ahead."
  V_GOOD_LUCK        = 3,  // "Good luck."
  V_LEVEL_END        = 4,  // "Level completed."
  V_DANGER           = 5,  // "Danger."
  V_SPIKES           = 6,  // "Warning: spikes ahead."
  V_DATA_CUBE        = 7,  // "Data acquired."
  V_ACCELERATE       = 8,  // "Unexplained speed increase."
}

export enum SpriteTableIndex {
  FONT_LARGE = 0,
  FONT_REGULAR = 1,
  FONT_SMALL = 2
}

export const ExplosionData = [
  {sprite: 144, ttl:  7},
  {sprite: 120, ttl: 12},
  {sprite: 190, ttl: 12},
  {sprite: 209, ttl: 12},
  {sprite: 152, ttl: 12},
  {sprite: 171, ttl: 12},
  {sprite: 133, ttl:  7},   /*White Smoke*/
  {sprite:   1, ttl: 12},
  {sprite:  20, ttl: 12},
  {sprite:  39, ttl: 12},
  {sprite:  58, ttl: 12},
  {sprite: 110, ttl:  3},
  {sprite:  76, ttl:  7},
  {sprite:  91, ttl:  3},
  /*15*/  {sprite: 227, ttl:  3},
  {sprite: 230, ttl:  3},
  {sprite: 233, ttl:  3},
  {sprite: 252, ttl:  3},
  {sprite: 246, ttl:  3},
  /*20*/  {sprite: 249, ttl:  3},
  {sprite: 265, ttl:  3},
  {sprite: 268, ttl:  3},
  {sprite: 271, ttl:  3},
  {sprite: 236, ttl:  3},
  /*25*/  {sprite: 239, ttl:  3},
  {sprite: 242, ttl:  3},
  {sprite: 261, ttl:  3},
  {sprite: 274, ttl:  3},
  {sprite: 277, ttl:  3},
  /*30*/  {sprite: 280, ttl:  3},
  {sprite: 299, ttl:  3},
  {sprite: 284, ttl:  3},
  {sprite: 287, ttl:  3},
  {sprite: 290, ttl:  3},
  /*35*/  {sprite: 293, ttl:  3},
  {sprite: 165, ttl:  8},   /*Coin Values*/
  {sprite: 184, ttl:  8},
  {sprite: 203, ttl:  8},
  {sprite: 222, ttl:  8},
  {sprite: 168, ttl:  8},
  {sprite: 187, ttl:  8},
  {sprite: 206, ttl:  8},
  {sprite: 225, ttl: 10},
  {sprite: 169, ttl: 10},
  {sprite: 188, ttl: 10},
  {sprite: 207, ttl: 20},
  {sprite: 226, ttl: 14},
  {sprite: 170, ttl: 14},
  {sprite: 189, ttl: 14},
  {sprite: 208, ttl: 14},
  {sprite: 246, ttl: 14},
  {sprite: 227, ttl: 14},
  {sprite: 265, ttl: 14}
];

export const PALETTE_SIZE = 256,
  MAP_TILES_MAX_INDEX = 600,
  MAP_TILE_WIDTH = 24, MAP_TILE_HEIGHT = 28,
  COMP_TILE_WIDTH = 12, COMP_TILE_HEIGHT = 14,
  BACK_TO_SHAPE_MAX_INDEX = 128,
  BACK_1_WIDTH = 14, BACK_1_HEIGHT = 300,
  BACK_2_WIDTH = 14, BACK_2_HEIGHT = 600,
  BACK_3_WIDTH = 15, BACK_3_HEIGHT = 600,
  SFX_CHANNELS = 8,
  PCM_RESAMPLE_RATE = 4, SAMPLE_RATE = 44100,
  PORT_CHANNEL = [0, 2, 4, 4, 2, 2, 5, 5, 1, 4, 1],
  PLAYER_CONTAINER_WIDTH = 260, PLAYER_CONTAINER_HEIGHT = 190;


export const MAIN_WIDTH = 320, MAIN_HEIGHT = 200,
  SCALE = 4;
