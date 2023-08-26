import {BackSpeedSet} from "./events/BackSpeedSet";
import {BackDelay} from "./events/BackDelay";
import {EnemiesLoadShapes} from "./events/EnemiesLoadShapes";
import {EnemyCreate} from "./events/EnemyCreate";
import {StarsSwitch} from "./events/StarsSwitch";
import {LevelEnd} from "./events/LevelEnd";
import {EnemiesRandomSwitch} from "./events/EnemiesRandomSwitch";
import {ShowMessage} from "./events/ShowMessage";
import {EnemiesGlobalMove} from "./events/EnemiesGlobalMove";
import {BackOverSwitch} from "./events/BackOverSwitch";
import {EnemiesGlobalAnimate} from "./events/EnemiesGlobalAnimate";
import {EnemiesGlobalDamage} from "./events/EnemiesGlobalDamage";
import {EnemySmallAdjustPos} from "./events/EnemySmallAdjustPos";
import {EnemiesOverSwitch} from "./events/EnemiesOverSwitch";
import {EnemiesFireOverride} from "./events/EnemiesFireOverride";
import {EnemySpawn} from "./events/EnemySpawn";
import {LevelEnemiesFrequency} from "./events/LevelEnemiesFrequency";
import {EventsJump} from "./events/EventsJump";
import {EnemiesGlobalLinkNum} from "./events/EnemiesGlobalLinkNum";
import {EnemiesContinualDamage} from "./events/EnemiesContinualDamage";
import {EnemiesReset} from "./events/EnemiesReset";
import {LevelFilters} from "./events/LevelFilters";
import {LevelDifficulty} from "./events/LevelDifficulty";
import {EventsForcedForward} from "./events/EventsForcedForward";
import {EnemySpecialAssign} from "./events/EnemySpecialAssign";
import {BackJump} from "./events/BackJump";
import {EnemyBossLinkNum} from "./events/EnemyBossLinkNum";
import {BackWrap} from "./events/BackWrap";
import {EventBase} from "./EventBase";
import {Back2NotTransparent} from "./events/Back2NotTransparent";
import {StarsSpeedSet} from "./events/StarsSpeedSet";
import {Back3EnemyOffset} from "./events/Back3EnemyOffset";
import {PlayerImprevious} from "./events/PlayerImprevious";
import {RandomExplosionsSwitch} from "./events/RandomExplosionsSwitch";
import {GalagaShotFreqInc} from "./events/GalagaShotFreqInc";
import {PlayerSpecialWeaponSet} from "./events/PlayerSpecialWeaponSet";
import {EnemiesMoveOverride} from "./events/EnemiesMoveOverride";
import {LevelSmoothies} from "./events/LevelSmoothies";
import {PlaySound} from "./events/PlaySound";
import {TyEventType} from "../Structs";
import {EnemyCreateArcade} from "./events/EnemyCreateArcade";

class Unsupported extends EventBase {
    key: EventKey = 'Unsupported'
}

export const TyEventKindMap = {
    [TyEventType.UNSUPPORTED]: Unsupported,
    [TyEventType.STAR_FIELD_SPEED]: StarsSpeedSet,
    [TyEventType.BACK_SPEED_SET]: BackSpeedSet,
    [TyEventType.BACK_DELAY]: BackDelay,
    [TyEventType.BACK_DELAY_TYPE]: BackDelay,
    [TyEventType.ENEMIES_LOAD_SHAPES]: EnemiesLoadShapes,
    [TyEventType.ENEMY_CREATE_GROUND_25]: EnemyCreate,
    [TyEventType.ENEMY_CREATE_TOP_50]: EnemyCreate,
    [TyEventType.ENEMY_CREATE_GROUND_75]: EnemyCreate,
    [TyEventType.STARS_OFF]: StarsSwitch,
    [TyEventType.STARS_ON]: StarsSwitch,
    [TyEventType.LEVEL_END]: LevelEnd,
    [TyEventType.ENEMY_CREATE_4x4]: EnemyCreate,
    [TyEventType.ENEMIES_RANDOM_OFF]: EnemiesRandomSwitch,
    [TyEventType.ENEMIES_RANDOM_ON]: EnemiesRandomSwitch,
    [TyEventType.ENEMY_CREATE_SKY_0]: EnemyCreate,
    [TyEventType.SHOW_MESSAGE]: ShowMessage,
    [TyEventType.ENEMY_CREATE_GROUND_BOTTOM_25]: EnemyCreate,
    [TyEventType.ENEMY_CREATE_SKY_BOTTOM_0]: EnemyCreate,
    [TyEventType.ENEMIES_GLOBAL_MOVE_0]: EnemiesGlobalMove,
    [TyEventType.ENEMIES_GLOBAL_MOVE_1]: EnemiesGlobalMove,
    [TyEventType.BACK_3_OVER_1]: BackOverSwitch,
    [TyEventType.BACK_3_OVER_OFF]: BackOverSwitch,
    [TyEventType.ENEMY_CREATE_TOP_BOTTOM_50_1]: EnemyCreate,
    [TyEventType.ENEMY_CREATE_TOP_BOTTOM_50_2]: EnemyCreate,
    [TyEventType.ENEMIES_GLOBAL_ANIMATE]: EnemiesGlobalAnimate,
    [TyEventType.ENEMIES_GLOBAL_DAMAGE]: EnemiesGlobalDamage,
    [TyEventType.ENEMY_SMALL_ADJUST_POS]: EnemySmallAdjustPos,
    [TyEventType.ENEMIES_GLOBAL_MOVE_2]: EnemiesGlobalMove,
    [TyEventType.ENEMIES_TOP_OVER_ON]: EnemiesOverSwitch,
    [TyEventType.ENEMIES_TOP_OVER_OFF]: EnemiesOverSwitch,
    [TyEventType.BACK_SPEED_SET_2]: BackSpeedSet,
    [TyEventType.ENEMIES_FIRE_OVERRIDE]: EnemiesFireOverride,
    [TyEventType.ENEMY_SPAWN]: EnemySpawn,
    [TyEventType.LEVEL_READY_TO_END]: LevelEnd,
    [TyEventType.LEVEL_ENEMIES_FREQUENCY]: LevelEnemiesFrequency,
    [TyEventType.EVENTS_JUMP]: EventsJump,
    [TyEventType.ENEMIES_GLOBAL_LINK_NUM]: EnemiesGlobalLinkNum,
    [TyEventType.ENEMIES_CONTINUAL_DAMAGE]: EnemiesContinualDamage,
    [TyEventType.ENEMIES_RESET]: EnemiesReset,
    [TyEventType.BACK_3_OVER_2]: BackOverSwitch,
    [TyEventType.BACK_2_OVER]: BackOverSwitch,
    [TyEventType.LEVEL_FILTERS]: LevelFilters,
    [TyEventType.ENEMY_CREATE_ARCADE]: EnemyCreateArcade,
    [TyEventType.LEVEL_DIFFICULTY]: LevelDifficulty,
    [TyEventType.ENEMIES_GLOBAL_DAMAGE_]: EnemiesGlobalDamage,
    [TyEventType.BACK_2_NOT_TRANSPARENT]: Back2NotTransparent,
    [TyEventType.ENEMY_CREATE_0]: EnemyCreate,
    [TyEventType.ENEMY_CREATE_1]: EnemyCreate,
    [TyEventType.ENEMY_CREATE_2]: EnemyCreate,
    [TyEventType.ENEMY_CREATE_3]: EnemyCreate,
    [TyEventType.EVENTS_FORCED_FORWARD]: EventsForcedForward,
    [TyEventType.EVENTS_JUMP_WITH_RETURN]: EventsJump,
    [TyEventType.ENEMIES_GLOBAL_MOVE_3]: EnemiesGlobalMove,
    [TyEventType.ENEMY_CREATE_GROUND_BOTTOM_75]: EnemyCreate,
    [TyEventType.EVENTS_JUMP_SUPER_ENEMY]: EventsJump,
    [TyEventType.ENEMY_SPECIAL_ASSIGN]: EnemySpecialAssign,
    [TyEventType.EVENTS_JUMP_GLOBAL_FLAG]: EventsJump,
    [TyEventType.SOUND_EFFECT]: PlaySound,
    [TyEventType.EVENTS_JUMP_SINGLE_PLAYER]: EventsJump,
    [TyEventType.LEVEL_SMOOTHIES]: LevelSmoothies,
    [TyEventType.BACK_3_X1]: Back3EnemyOffset,
    [TyEventType.EVENTS_JUMP_DIFFICULTY]: EventsJump,
    [TyEventType.EVENTS_JUMP_TIMER]: EventsJump,
    [TyEventType.RANDOM_EXPLOSIONS_SWITCH]: RandomExplosionsSwitch,
    [TyEventType.IMPREVIOUS_TICKS]: PlayerImprevious,
    [TyEventType.EVENTS_JUMP_OPTIONAL]: EventsJump,
    [TyEventType.EVENTS_JUMP_SECRET]: EventsJump,
    [TyEventType.BACK_3_X1B]: Back3EnemyOffset,
    [TyEventType.ENEMIES_SKY_OVER_SWITCH]: EnemiesOverSwitch,
    [TyEventType.ENEMIES_GLOBAL_MOVE_4]: EnemiesGlobalMove,
    [TyEventType.ENEMIES_MOVE_OVERRIDE]: EnemiesMoveOverride,
    [TyEventType.EVENTS_JUMP_RETURN]: EventsJump,
    [TyEventType.BACKGROUND_JUMP]: BackJump,
    [TyEventType.GALAGA_SHOT_FREQUENCY_INC]: GalagaShotFreqInc,
    [TyEventType.BOSS_BAR_LINK_NUM_SET]: EnemyBossLinkNum,
    [TyEventType.EVENTS_JUMP_MULTIPLAYER]: EventsJump,
    [TyEventType.BACKGROUND_WRAP]: BackWrap,
    [TyEventType.PLAYER_SPECIAL_WEAPON_SET]: PlayerSpecialWeaponSet,
}

const EventTypeMap = {
    Unsupported: Unsupported,
    Back2NotTransparent: Back2NotTransparent,
    Back3EnemyOffset: Back3EnemyOffset,
    BackDelay: BackDelay,
    BackJump: BackJump,
    BackOverSwitch: BackOverSwitch,
    BackSpeedSet: BackSpeedSet,
    BackWrap: BackWrap,
    EnemiesContinualDamage: EnemiesContinualDamage,
    EnemiesFireOverride: EnemiesFireOverride,
    EnemiesGlobalAnimate: EnemiesGlobalAnimate,
    EnemiesGlobalDamage: EnemiesGlobalDamage,
    EnemiesGlobalLinkNum: EnemiesGlobalLinkNum,
    EnemiesGlobalMove: EnemiesGlobalMove,
    EnemiesLoadShapes: EnemiesLoadShapes,
    EnemiesMoveOverride: EnemiesMoveOverride,
    EnemiesOverSwitch: EnemiesOverSwitch,
    EnemiesReset: EnemiesReset,
    EnemiesRandomSwitch: EnemiesRandomSwitch,
    EnemyCreate: EnemyCreate,
    EnemyBossLinkNum: EnemyBossLinkNum,
    EnemySmallAdjustPos: EnemySmallAdjustPos,
    EnemySpawn: EnemySpawn,
    EnemySpecialAssign: EnemySpecialAssign,
    EventsForcedForward: EventsForcedForward,
    EventsJump: EventsJump,
    GalagaShotFreqInc: GalagaShotFreqInc,
    LevelDifficulty: LevelDifficulty,
    LevelEnd: LevelEnd,
    LevelEnemiesFrequency: LevelEnemiesFrequency,
    LevelFilters: LevelFilters,
    LevelSmoothies: LevelSmoothies,
    PlaySound: PlaySound,
    PlayerImprevious: PlayerImprevious,
    PlayerSpecialWeaponSet: PlayerSpecialWeaponSet,
    RandomExplosionsSwitch: RandomExplosionsSwitch,
    ShowMessage: ShowMessage,
    StarsSwitch: StarsSwitch,
    StarsSpeedSet: StarsSpeedSet,
    EnemyCreateArcade: EnemyCreateArcade
}

export type EventKey = keyof typeof EventTypeMap;
export type CreatedEvent<T extends EventKey> = T extends keyof typeof EventTypeMap ? InstanceType<typeof EventTypeMap[T]> : Unsupported;
