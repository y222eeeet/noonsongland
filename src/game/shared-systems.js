// Shared contracts for every present and future Song-i activity.
// This module intentionally contains no UI or world objects: individual
// features opt in when they are implemented, while their rules stay stable.

export const PLAYER_MODE=Object.freeze({
 IDLE:'idle',GUESTBOOK:'guestbook',SIGH:'sigh',SMOKE:'smoke',SEATED:'seated',
 SEATED_SMOKE:'seated-smoke',SWIM:'swim',SKY:'sky',SKY_REST:'sky-rest',
 SLED:'sled',DRINK:'drink',POCHA:'pocha',CLASSROOM:'classroom',CLASSROOM_BREAK:'classroom-break'
});

// Entry actions are deliberately whitelisted. A feature must add itself here
// before it can expose a button, so entering a new mode cannot accidentally
// leave controls from the previous mode active.
export const MODE_RULES=Object.freeze({
 [PLAYER_MODE.IDLE]:Object.freeze({movement:'free',camera:'follow',entryActions:Object.freeze(['face','fast','sigh','smoke','drink','seat','swim','sky','guestbook','sled','store','classroom'])}),
 [PLAYER_MODE.SEATED]:Object.freeze({movement:'locked',camera:'seat',entryActions:Object.freeze(['smoke','drink'])}),
 [PLAYER_MODE.GUESTBOOK]:Object.freeze({movement:'locked',camera:'follow',entryActions:Object.freeze([])}),
 [PLAYER_MODE.SIGH]:Object.freeze({movement:'locked',camera:'face',entryActions:Object.freeze([])}),
 [PLAYER_MODE.SMOKE]:Object.freeze({movement:'phase-controlled',camera:'smoke',entryActions:Object.freeze([])}),
 [PLAYER_MODE.SEATED_SMOKE]:Object.freeze({movement:'locked',camera:'smoke',entryActions:Object.freeze([])}),
 [PLAYER_MODE.SWIM]:Object.freeze({movement:'path-controlled',camera:'swim',entryActions:Object.freeze([])}),
 [PLAYER_MODE.SKY]:Object.freeze({movement:'free',camera:'sky',entryActions:Object.freeze([])}),
 [PLAYER_MODE.SKY_REST]:Object.freeze({movement:'locked',camera:'sky',entryActions:Object.freeze([])}),
 // Planned modes: definitions only. No UI is enabled until its feature lands.
 [PLAYER_MODE.SLED]:Object.freeze({movement:'path-controlled',camera:'sled',entryActions:Object.freeze([])}),
 [PLAYER_MODE.DRINK]:Object.freeze({movement:'phase-controlled',camera:'drink',entryActions:Object.freeze([])}),
 [PLAYER_MODE.POCHA]:Object.freeze({movement:'locked',camera:'pocha',entryActions:Object.freeze(['drink'])}),
 [PLAYER_MODE.CLASSROOM]:Object.freeze({movement:'free',camera:'classroom',entryActions:Object.freeze(['bat'])}),
 [PLAYER_MODE.CLASSROOM_BREAK]:Object.freeze({movement:'locked',camera:'classroom',entryActions:Object.freeze([])})
});

export function canEnterActivity(mode,action){return MODE_RULES[mode]?.entryActions.includes(action)===true}

// Shared controls are described once per mode. Feature code must apply this
// policy after a transition instead of toggling each button independently.
const commonControls=Object.freeze({face:false,sigh:false,fast:false,smoke:false,joystick:false,stand:false,smokeExitSlot:null,standExitSlot:null});
const controls=overrides=>Object.freeze({...commonControls,...overrides});
export const MODE_UI_RULES=Object.freeze({
 [PLAYER_MODE.IDLE]:controls({face:true,sigh:true,fast:true,smoke:true,joystick:true}),
 [PLAYER_MODE.SEATED]:controls({smoke:true,stand:true,standExitSlot:0}),
 [PLAYER_MODE.SMOKE]:controls({smoke:true,smokeExitSlot:0}),
 [PLAYER_MODE.SEATED_SMOKE]:controls({smoke:true,stand:true,smokeExitSlot:1,standExitSlot:0}),
 [PLAYER_MODE.GUESTBOOK]:commonControls,[PLAYER_MODE.SIGH]:commonControls,[PLAYER_MODE.SWIM]:commonControls,
 [PLAYER_MODE.SKY]:commonControls,[PLAYER_MODE.SKY_REST]:commonControls,
 [PLAYER_MODE.SLED]:commonControls,[PLAYER_MODE.DRINK]:commonControls,[PLAYER_MODE.POCHA]:commonControls,
 [PLAYER_MODE.CLASSROOM]:controls({joystick:true}),[PLAYER_MODE.CLASSROOM_BREAK]:commonControls
});
export function getModeUiRule(mode){return MODE_UI_RULES[mode]||commonControls}

export const WORLD_RULES=Object.freeze({
 campus:Object.freeze({isolated:false,visibleWorlds:Object.freeze(['campus'])}),
 sky:Object.freeze({isolated:true,visibleWorlds:Object.freeze(['sky'])}),
 pocha:Object.freeze({isolated:true,visibleWorlds:Object.freeze(['pocha'])}),
 classroom:Object.freeze({isolated:true,visibleWorlds:Object.freeze(['classroom'])})
});

export const ITEM_SLOT=Object.freeze({CIGARETTE:'cigarette',BEVERAGE:'beverage',TOOL:'tool',VEHICLE:'vehicle'});

// Store/NPC rewards will select from this registry. Only the current cigarette
// exists in play; the remaining entries are definitions for later work.
export const ITEM_CATALOG=Object.freeze({
 cigarette_basic_marle:Object.freeze({slot:ITEM_SLOT.CIGARETTE,status:'available'}),
 cigarette_other:Object.freeze({slot:ITEM_SLOT.CIGARETTE,status:'planned'}),
 soju_chamisul:Object.freeze({slot:ITEM_SLOT.BEVERAGE,status:'planned'}),
 soju_chumchurum:Object.freeze({slot:ITEM_SLOT.BEVERAGE,status:'planned'}),
 soju_jinro:Object.freeze({slot:ITEM_SLOT.BEVERAGE,status:'planned'}),
 beer_can:Object.freeze({slot:ITEM_SLOT.BEVERAGE,status:'planned'}),
 beer_bottle:Object.freeze({slot:ITEM_SLOT.BEVERAGE,status:'planned'}),
 wine:Object.freeze({slot:ITEM_SLOT.BEVERAGE,status:'planned'}),
 whisky:Object.freeze({slot:ITEM_SLOT.BEVERAGE,status:'planned'}),
 baijiu:Object.freeze({slot:ITEM_SLOT.BEVERAGE,status:'planned'}),
 baseball_bat:Object.freeze({slot:ITEM_SLOT.TOOL,status:'planned'}),
 sled:Object.freeze({slot:ITEM_SLOT.VEHICLE,status:'planned'})
});

export function createInventory(){return {owned:new Set(['cigarette_basic_marle']),equipped:{[ITEM_SLOT.CIGARETTE]:'cigarette_basic_marle',[ITEM_SLOT.BEVERAGE]:null,[ITEM_SLOT.TOOL]:null,[ITEM_SLOT.VEHICLE]:null}}}

export const INTERACTION_RULES=Object.freeze({
 sled:Object.freeze({world:'campus',entryMode:PLAYER_MODE.IDLE,resultMode:PLAYER_MODE.SLED,movement:'uphill-slow/path-downhill',occupancy:'shared-track'}),
 store:Object.freeze({world:'campus',entryMode:PLAYER_MODE.IDLE,resultMode:PLAYER_MODE.IDLE,movement:'locked-during-dialogue',occupancy:'shared'}),
 pocha:Object.freeze({world:'pocha',entryMode:PLAYER_MODE.IDLE,resultMode:PLAYER_MODE.POCHA,movement:'seat-locked',occupancy:'one-per-seat'}),
 classroom:Object.freeze({world:'classroom',entryMode:PLAYER_MODE.IDLE,resultMode:PLAYER_MODE.CLASSROOM,movement:'free',occupancy:'shared-instance'})
});
