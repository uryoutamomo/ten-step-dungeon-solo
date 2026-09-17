export type Sigil = 'sword' | 'shield' | 'magic';
export type Phase = 'ready' | 'explore' | 'battle' | 'treasure' | 'won' | 'lost';
export type RoomKind = 'entrance' | 'corridor' | 'monster' | 'slime' | 'spring' | 'sword' | 'boss' | 'ambush';
export type Enemy = { id:string; name:string; quick:Sigil[]; combo:Sigil[][]; alternate?:Sigil; boss?:boolean };
export const SIGILS:Sigil[]=['sword','shield','magic'];
export const LABELS:Record<Sigil,string>={sword:'剣',shield:'盾',magic:'魔法'};
export const SYMBOLS:Record<Sigil,string>={sword:'⚔',shield:'◈',magic:'✦'};
export const ENEMIES:Enemy[]=[
 {id:'monk',name:'魔法坊主',quick:[],combo:[['shield']]},
 {id:'berserker',name:'暴坊主',quick:[],combo:[['sword']]},
 {id:'baby-dragon',name:'童ラゴン',quick:[],combo:[['magic']]},
 {id:'muscle',name:'モジャ筋',quick:[],combo:[['magic']],alternate:'sword'},
 {id:'mantis',name:'カマ拳ポー',quick:['shield','sword'],combo:[['sword'],['shield']]},
 {id:'fire',name:'水嫌い',quick:['shield','shield'],combo:[['sword'],['shield']]},
 {id:'grey',name:'グレグレイ',quick:['magic','sword'],combo:[['shield'],['sword']]},
 {id:'tail',name:'お尻口',quick:['shield','sword'],combo:[['magic'],['magic']]},
 {id:'starfish',name:'闇ヒトデ',quick:['magic','shield'],combo:[['sword'],['sword','shield']]},
 {id:'face-demon',name:'顔取り魔童',quick:['magic','sword'],combo:[['sword'],['magic','shield']]},
 {id:'knight',name:'首騎士',quick:['magic','sword'],combo:[['sword'],['sword','sword']]},
 {id:'spider',name:'土グモ爺い',quick:['shield','magic'],combo:[['shield'],['magic']]},
 {id:'strange-head',name:'変頭',quick:['shield','sword'],combo:[['magic'],['sword'],['shield']]},
 {id:'mandrake',name:'マンドラゴラ',quick:['shield','shield'],combo:[['shield'],['shield'],['shield']]},
 {id:'robot',name:'暴ロボ',quick:['magic','sword'],combo:[['magic'],['shield'],['sword']]},
 {id:'brain',name:'超脳脳',quick:['magic','magic'],combo:[['magic'],['magic'],['magic']]},
 {id:'alien',name:'誤タコ',quick:['sword','sword'],combo:[['magic'],['shield'],['magic']]},
 {id:'mimic',name:'ミミック',quick:['shield','sword'],combo:[['shield'],['sword']]},
 {id:'dragon',name:'変なドラゴン',quick:[],combo:[['shield','shield'],['sword','magic'],['sword','sword']],boss:true},
 {id:'demon-king',name:'足腰の弱った魔王',quick:[],combo:[['shield','sword'],['magic','shield']],boss:true},
 {id:'witch',name:'majo',quick:[],combo:[['magic','magic'],['magic','magic'],['magic','magic']],boss:true},
 {id:'tiny-boss',name:'こびと',quick:[],combo:[['shield','magic'],['shield','magic'],['sword','sword']],boss:true},
];
export const SAVE_KEY='ten-step-dungeon-solo:journey:v1';
export const BEST_KEY='ten-step-dungeon-solo:best:v1';
export const MAX_LIGHT=36;
export type Room={kind:RoomKind;enemy:string|null;cleared:boolean};
export type Battle={enemy:string;step:number;ambush:boolean};
export type Game={version:1;seed:number;rng:number;phase:Phase;turn:number;pos:number;farthest:number;light:number;returning:boolean;hand:Sigil[];deck:Sigil[];rooms:Room[];choices:Room[];footprints:boolean[];battle:Battle|null;captured:string[];sword:boolean;boss:boolean;treasure:'gold'|'boots'|null;ten:boolean;slimes:number;title:string;message:string;art:string;log:string[]};
export type Action=({type:'start'}|{type:'advance';choice:number}|{type:'play';indices:number[]}|{type:'exchange';index:number}|{type:'return'}|{type:'walk'}|{type:'fly'}|{type:'rescue'}|{type:'legend'}|{type:'treasure';kind:'gold'|'boots'}) & {turn?:number};
function random(g:Game){g.rng=(Math.imul(g.rng,1664525)+1013904223)>>>0;return g.rng/4294967296}
function draw(g:Game):Sigil {if(!g.deck.length){g.deck=Array.from({length:36},(_,i)=>SIGILS[i%3]);for(let i=g.deck.length-1;i>0;i--){const j=Math.floor(random(g)*(i+1));[g.deck[i],g.deck[j]]=[g.deck[j],g.deck[i]]}}return g.deck.pop()!}
function room(kind:RoomKind,enemy:string|null=null):Room{return {kind,enemy,cleared:false}}
function scene(g:Game,title:string,message:string,art='corridor'){g.title=title;g.message=message;g.art=art;g.log=[title+' '+message,...g.log].slice(0,30)}
function nextChoices(g:Game){const next=g.pos+1;if(next===6)return [room('sword')];if(next===10){const bosses=ENEMIES.filter(e=>e.boss);return [room('boss',bosses[Math.floor(random(g)*bosses.length)].id)]}const group=next<=3?ENEMIES.slice(0,4):next<=7?ENEMIES.slice(4,12):ENEMIES.slice(12,18);const enemy=group[Math.floor(random(g)*group.length)];const roll=random(g);const quiet:RoomKind=roll<.18?'slime':roll<.35?'spring':roll<.46?'ambush':'corridor';return [room('monster',enemy.id),room(quiet,quiet==='ambush'?ENEMIES[Math.floor(random(g)*3)].id:null)]}
export function createGame(seed=20260917):Game{const g:Game={version:1,seed:seed>>>0,rng:seed>>>0,phase:'ready',turn:0,pos:0,farthest:0,light:MAX_LIGHT,returning:false,hand:[],deck:[],rooms:[{kind:'entrance',enemy:null,cleared:true}],choices:[],footprints:Array(11).fill(false),battle:null,captured:[],sword:false,boss:false,treasure:null,ten:false,slimes:0,title:'さあ、小さな大冒険へ。',message:'剣・盾・魔法を使って道を切り開こう。灯りが尽きる前に、入口へ帰れば生還。',art:'corridor',log:[]};g.footprints[0]=true;g.hand=['sword','shield','magic',draw(g)];return g}
export function enemyOf(g:Game){return ENEMIES.find(e=>e.id===g.battle?.enemy)??null}
function same(a:Sigil[],b:Sigil[]){return a.length===b.length&&[...a].sort().join() === [...b].sort().join()}
export function playKind(g:Game,indices:number[]):'quick'|'step'|null{if(g.phase!=='battle'||!g.battle||indices.length<1||new Set(indices).size!==indices.length||indices.some(i=>!Number.isInteger(i)||i<0||i>=g.hand.length))return null;const e=enemyOf(g)!;const cards=indices.map(i=>g.hand[i]);if(!g.battle.ambush&&e.quick.length&&same(cards,e.quick))return 'quick';if(same(cards,e.combo[g.battle.step])||(g.battle.step===0&&e.alternate&&same(cards,[e.alternate])))return 'step';return null}
export function suggestedPlay(g:Game):number[]{for(let n=1;n<16;n++){const ids=[0,1,2,3].filter(i=>(n&(1<<i))!==0);if(playKind(g,ids)==='quick')return ids}for(let n=1;n<16;n++){const ids=[0,1,2,3].filter(i=>(n&(1<<i))!==0);if(playKind(g,ids))return ids}return []}
export function selectionAfterTap(g:Game,current:number[],index:number):number[]{
 if(!Number.isInteger(index)||index<0||index>=g.hand.length)return current;
 if(current.includes(index))return current.filter(i=>i!==index);
 const candidate=[...current,index];
 if(playKind(g,candidate))return candidate;
 for(let n=1;n<16;n++){
  const playable=[0,1,2,3].filter(i=>(n&(1<<i))!==0);
  if(playKind(g,playable)&&candidate.every(i=>playable.includes(i)))return candidate;
 }
 return [index];
}
export function scoreDetails(g:Game){const primary=(g.treasure==='gold'?5:g.treasure==='boots'?1:0)+(g.boss?3:0)+(g.ten?2:0);return {gold:g.treasure==='gold'?5:0,boots:g.treasure==='boots'?1:0,boss:g.boss?3:0,ten:g.ten?2:0,monsters:primary>0?g.captured.length:0,total:primary+(primary>0?g.captured.length:0)}}
export function returnCost(g:Game){if(g.treasure==='boots')return Math.ceil(g.pos/3);let n=0;for(let p=g.pos-1;p>=0;p--)n+=g.footprints[p]?1:2;return n}
function finishTurn(g:Game){if(g.pos===0&&g.returning){g.phase='won';scene(g,'おかえり、冒険者。',`無事に生還！ 持ち帰った褒章は${scoreDetails(g).total}個。今日の冒険を、ポケットに。`,g.treasure==='gold'?'gold':g.ten?'ten-steps':'corridor');return}if(g.light<=0){g.light=0;g.phase='lost';g.battle=null;scene(g,'灯りが、消えてしまった。','冒険はここまで。お宝は迷宮に置いてきた。次は帰り道の灯りも残しておこう。','slime')}}
function spend(g:Game,n=1){g.turn++;g.light=Math.max(0,g.light-n)}
function victory(g:Game){const e=enemyOf(g)!;const ambush=g.battle!.ambush;g.rooms[g.pos].cleared=true;g.battle=null;if(e.boss){g.boss=true;g.phase='treasure';scene(g,'宝箱は、もう目の前。','ラスボスを倒した！ 持てる宝はひとつ。褒章5個の金銀財宝か、安全に帰れる羽の靴か。','chest')}else{if(!ambush)g.captured.push(e.id);g.phase='explore';scene(g,ambush?'まちぶせを突破！':`${e.name}を仲間にした！`,ambush?'足止めを切り抜けた。さあ、先へ。':'仲間は帰還時の褒章に。通常の敵1体と相殺して、道を開けることもできる。',ambush?'ambush':e.id)}}
function enter(g:Game,r:Room){g.rooms.push(r);g.pos++;g.farthest=g.pos;g.footprints[g.pos]=true;g.phase='explore';if(g.pos===10)g.ten=true;
 if(r.kind==='monster'||r.kind==='boss'||r.kind==='ambush'){g.battle={enemy:r.enemy!,step:0,ambush:r.kind==='ambush'};g.phase='battle';const e=enemyOf(g)!;scene(g,r.kind==='ambush'?'まちぶせだ！':`${e.name}が、あらわれた。`,r.kind==='ambush'?'指定のカードを1枚出せば、道が開く。':'必要なカードをタップして選ぼう。一撃で倒すか、1ターンずつコンボをつなぐか。',r.kind==='ambush'?'ambush':e.id)}
 else{r.cleared=true;if(r.kind==='slime'){for(let p=1;p<g.pos;p++)g.footprints[p]=false;g.slimes++;scene(g,'あ。踏んじゃった。','スライムが、ここまでの足跡を消した！ 消えた道は帰りに灯りを2使う。足元に気をつけて。','slime')}
 else if(r.kind==='spring'){g.light=Math.min(MAX_LIGHT,g.light+6);scene(g,'ひと休み、していこう。','松明に油を足した。灯りが6回復！ ひんやりした空気が、背中を押してくれる。','corridor')}
 else if(r.kind==='sword'){scene(g,'6歩目、伝説の剣。',g.captured.length>=3?'仲間が3体そろった！ 剣を引き抜けば、ラスボスを一撃で倒せる。':'剣を抜くには仲間が3体必要。足りなくても、帰り道でまた挑戦できる。','legendary-sword')}
 else scene(g,'静かな石の通路。','足跡をひとつ残した。もう少し奥へ、それとも引き返す？','corridor')}
 g.choices=g.pos<10?nextChoices(g):[];
}
export function transition(state:Game,action:Action):Game{
 if(action.turn!==undefined&&action.turn!==state.turn)return state;
 if(action.type==='start'){if(state.phase!=='ready')return state;const g=structuredClone(state);g.phase='explore';g.choices=nextChoices(g);return g}
 if(['ready','won','lost'].includes(state.phase))return state;
 const g=structuredClone(state);
 if(action.type==='advance'){
  if(g.phase!=='explore'||g.returning||!Number.isInteger(action.choice)||!g.choices[action.choice]||g.pos>=10)return state;
  if(g.light<1)return state;spend(g);enter(g,g.choices[action.choice]);finishTurn(g);return g;
 }
 if(action.type==='play'){const kind=playKind(g,action.indices);if(!kind)return state;spend(g);for(const i of action.indices)g.hand[i]=draw(g);const e=enemyOf(g)!;if(kind==='quick'||g.battle!.step+1>=e.combo.length)victory(g);else{g.battle!.step++;scene(g,'コンボがつながった！',`次は「${e.combo[g.battle!.step].map(c=>LABELS[c]).join('＋')}」。交換しても、コンボは消えない。`,g.art)}finishTurn(g);return g}
 if(action.type==='exchange'){if(g.phase!=='battle'||!Number.isInteger(action.index)||action.index<0||action.index>=4)return state;spend(g);const old=g.hand[action.index];g.hand[action.index]=draw(g);scene(g,'手札を1枚、交換した。',`${LABELS[old]} → ${LABELS[g.hand[action.index]]}。必要なカードをそろえよう。`,g.art);finishTurn(g);return g}
 if(action.type==='rescue'){if(g.phase!=='battle'||enemyOf(g)?.boss||g.battle?.ambush||!g.captured.length)return state;spend(g);g.captured.pop();g.rooms[g.pos].cleared=true;g.battle=null;g.phase='explore';scene(g,'仲間が道を開けてくれた。','仲間1体と敵1体が迷宮へ帰っていった。獲得数は1つ減るけれど、灯りを節約できた。','monster-door');finishTurn(g);return g}
 if(action.type==='legend'){if(g.phase==='battle'&&enemyOf(g)?.boss&&g.sword){spend(g);victory(g);finishTurn(g);return g}if(g.phase!=='explore'||g.pos!==6||g.sword||g.captured.length<3)return state;spend(g);g.sword=true;scene(g,'すぽん。伝説になった！','伝説の剣を手に入れた。ラスボス戦で使えば、一撃で倒せる。仲間は減らない。','legendary-sword');finishTurn(g);return g}
 if(action.type==='treasure'){if(g.phase!=='treasure'||!['gold','boots'].includes(action.kind))return state;g.treasure=action.kind;g.returning=true;g.phase='explore';g.turn++;scene(g,action.kind==='gold'?'金銀財宝を手に入れた！':'羽の靴を手に入れた！',action.kind==='gold'?'褒章5個分のお宝。足跡をたどって、入口まで持ち帰ろう。':'1回の行動で3歩戻れる。途中のスライムも飛び越えて、安全に帰ろう。',action.kind);return g}
 if(action.type==='return'){if(g.returning||g.pos===0||!['explore','battle'].includes(g.phase))return state;g.returning=true;g.battle=null;g.phase='explore';g.turn++;scene(g,'帰るのも、立派な冒険。','ここからは入口へ。帰り道では戦闘は起きない。残りの灯りに気をつけよう。',g.art);return g}
 if(action.type==='walk'||action.type==='fly'){if(g.phase!=='explore'||!g.returning||g.pos===0)return state;if(action.type==='fly'&&g.treasure!=='boots')return state;const next=Math.max(0,g.pos-(action.type==='fly'?3:1)),cost=action.type==='fly'?1:g.footprints[next]?1:2;if(g.light<cost){spend(g,cost);finishTurn(g);return g}spend(g,cost);g.footprints[g.pos]=false;g.pos=next;const r=g.rooms[next];scene(g,next===6&&!g.sword?'伝説の剣の部屋に戻った。':`入口まで、あと${next}歩。`,cost===2?'足跡が消えた道を探して、灯りを2使った。':'足跡をたどって、一歩ずつ帰ろう。',r.kind==='sword'?'legendary-sword':'corridor');finishTurn(g);return g}
 return state;
}
export function restoreGame(raw:string|null):Game|null{
 if(!raw||raw.length>30000)return null;try{const g=JSON.parse(raw) as Game;
 if(!g||g.version!==1||!['ready','explore','battle','treasure','won','lost'].includes(g.phase))return null;
 for(const k of ['seed','rng','turn','pos','farthest','light','slimes'] as const)if(!Number.isInteger(g[k])||g[k]<0)return null;
 if(g.seed>0xffffffff||g.rng>0xffffffff||g.turn>10000||g.pos>10||g.farthest>10||g.pos>g.farthest||g.light>MAX_LIGHT)return null;
 if(!Array.isArray(g.hand)||g.hand.length!==4||g.hand.some(s=>!SIGILS.includes(s))||!Array.isArray(g.deck)||g.deck.length>36||g.deck.some(s=>!SIGILS.includes(s)))return null;
 if(!Array.isArray(g.rooms)||g.rooms.length!==g.farthest+1||!Array.isArray(g.choices)||g.choices.length>2)return null;
 const validRoom=(r:Room)=>{if(!r||!['entrance','corridor','monster','slime','spring','sword','boss','ambush'].includes(r.kind)||typeof r.cleared!=='boolean')return false;const e=ENEMIES.find(e=>e.id===r.enemy);if(['monster','boss','ambush'].includes(r.kind))return !!e&&(r.kind==='boss'?!!e.boss:!e.boss)&&(r.kind!=='ambush'||e.combo.length===1);return r.enemy===null};
 if(!g.rooms.every(validRoom)||!g.choices.every(validRoom)||g.rooms[0].kind!=='entrance')return null;
 if(!Array.isArray(g.footprints)||g.footprints.length!==11||g.footprints.some(f=>typeof f!=='boolean'))return null;
 if(!Array.isArray(g.captured)||g.captured.length>9||g.captured.some(id=>!ENEMIES.some(e=>e.id===id&&!e.boss)))return null;
 if(['sword','boss','ten','returning'].some(k=>typeof g[k as keyof Game]!=='boolean')||![null,'gold','boots'].includes(g.treasure))return null;
 if(['title','message','art'].some(k=>typeof g[k as keyof Game]!=='string')||!Array.isArray(g.log)||g.log.length>30||g.log.some(s=>typeof s!=='string'||s.length>500))return null;
 const allowedArts=new Set(['corridor','slime','ambush','legendary-sword','monster-door','chest','gold','boots','ten-steps',...ENEMIES.map(e=>e.id)]);if(!allowedArts.has(g.art))return null;
 if(g.phase==='battle'){const e=enemyOf(g);if(!g.battle||!e||!Number.isInteger(g.battle.step)||g.battle.step<0||g.battle.step>=e.combo.length||typeof g.battle.ambush!=='boolean'||g.rooms[g.pos].enemy!==e.id||g.rooms[g.pos].cleared||g.returning)return null}else if(g.battle!==null)return null;
 if(g.phase==='won'&&(!g.returning||g.pos!==0))return null;
 if(g.returning&&(!['explore','won','lost'].includes(g.phase)||g.pos===0&&g.phase!=='won'))return null;
 if(!g.returning&&g.pos!==g.farthest)return null;
 if(g.phase==='ready'&&(g.pos!==0||g.turn!==0||g.returning||g.boss||g.sword||g.captured.length))return null;
 if(g.phase==='explore'&&!g.returning&&g.pos===10)return null;
 if(g.rooms.some((r,i)=>i===6?r.kind!=='sword':i===10?r.kind!=='boss':i>0&&['entrance','sword','boss'].includes(r.kind)))return null;
 if(g.boss&&(!g.rooms[10]?.cleared||g.rooms[10]?.kind!=='boss'))return null;
 if(g.treasure&&!g.returning)return null;
 for(const id of new Set(g.captured))if(g.captured.filter(x=>x===id).length>g.rooms.filter(r=>r.kind==='monster'&&r.enemy===id&&r.cleared).length)return null;
 if(g.phase==='lost'&&g.light!==0)return null;
 if(!['won','lost'].includes(g.phase)&&g.light<=0)return null;
 if(g.phase==='treasure'&&(!g.boss||g.pos!==10||g.treasure!==null))return null;
 if(g.ten!==(g.farthest===10)||g.boss&&g.farthest!==10||g.treasure&&!g.boss)return null;
 if(g.phase==='explore'&&!g.returning&&g.pos<10&&g.choices.length<1)return null;
 return g;
 }catch{return null}
}
