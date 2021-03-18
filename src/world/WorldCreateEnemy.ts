import {EnemyCreate} from "./events/EnemyCreate";
import {World} from "./World";
import {TyEventType} from "./EventMappings";

export function createEnemy (this: World, e: EnemyCreate) {
    switch (e.e.type) {
        case TyEventType.ENEMY_CREATE_TOP_50: break;
        case TyEventType.ENEMY_CREATE_GROUND_25: break;
        case TyEventType.ENEMY_CREATE_GROUND_75: break;
        case TyEventType.ENEMY_CREATE_GROUND_4x4: break;
        case TyEventType.ENEMY_CREATE_GROUND_BOTTOM_25: break;
        case TyEventType.ENEMY_CREATE_GROUND_BOTTOM_75: break;
        case TyEventType.ENEMY_CREATE_SKY_BOTTOM_0: break;
        case TyEventType.ENEMY_CREATE_SKY_BOTTOM_50: break;
        case TyEventType.ENEMY_CREATE_ARCADE: break;
        case TyEventType.ENEMY_CREATE_0: break;
        case TyEventType.ENEMY_CREATE_1: break;
        case TyEventType.ENEMY_CREATE_2: break;
        case TyEventType.ENEMY_CREATE_3: break;
    }
}

/*
{
    "eventtime": 100,
    "eventtype": 15,
    "eventdat1": 10,
    "eventdat2": 10,
    "eventdat3": 2,
    "eventdat5": 0,
    "eventdat6": 0,
    "eventdat4": 1
  },
  {
    "eventtime": 132,
    "eventtype": 12,
    "eventdat1": 121,
    "eventdat2": 42,
    "eventdat3": 0,
    "eventdat5": 0,
    "eventdat6": 0,
    "eventdat4": 20
  },
void JE_createNewEventEnemy( JE_byte enemyTypeOfs, JE_word enemyOffset, Sint16 uniqueShapeTableI )
{
	int i;

	b = 0;

	for(i = enemyOffset; i < enemyOffset + 25; i++)
	{
		if (enemyAvail[i] == 1)
		{
			b = i + 1;
			break;
		}
	}

	if (b == 0)
	{
		return;
	}

	tempW = eventRec[eventLoc-1].eventdat + enemyTypeOfs;

	enemyAvail[b-1] = JE_makeEnemy(&enemy[b-1], tempW, uniqueShapeTableI);

	if (eventRec[eventLoc-1].eventdat2 != -99)
	{
		switch (enemyOffset)
		{
		case 0:
			enemy[b-1].ex = eventRec[eventLoc-1].eventdat2 - (mapX - 1) * 24;
			enemy[b-1].ey -= backMove2;
			break;
		case 25:
		case 75:
			enemy[b-1].ex = eventRec[eventLoc-1].eventdat2 - (mapX - 1) * 24 - 12;
			enemy[b-1].ey -= backMove;
			break;
		case 50:
			if (background3x1)
			{
				enemy[b-1].ex = eventRec[eventLoc-1].eventdat2 - (mapX - 1) * 24 - 12;
			} else {
				enemy[b-1].ex = eventRec[eventLoc-1].eventdat2 - mapX3 * 24 - 24 * 2 + 6;
			}
			enemy[b-1].ey -= backMove3;

			if (background3x1b)
			{
				enemy[b-1].ex -= 6;
			}
			break;
		}
		enemy[b-1].ey = -28;
		if (background3x1b && enemyOffset == 50)
		{
			enemy[b-1].ey += 4;
		}
	}

	if (smallEnemyAdjust && enemy[b-1].size == 0)
	{
		enemy[b-1].ex -= 10;
		enemy[b-1].ey -= 7;
	}

	enemy[b-1].ey += eventRec[eventLoc-1].eventdat5;
	enemy[b-1].eyc += eventRec[eventLoc-1].eventdat3;
	enemy[b-1].linknum = eventRec[eventLoc-1].eventdat4;
	enemy[b-1].fixedmovey = eventRec[eventLoc-1].eventdat6;
}
 */
