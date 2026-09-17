import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
const source=await readFile(new URL('../app/game.ts',import.meta.url),'utf8');
const faults=[
 ['duplicate hand index','new Set(indices).size!==indices.length||',''],
 ['slime no longer erases footprints','for(let p=1;p<g.pos;p++)g.footprints[p]=false','for(let p=1;p<1;p++)g.footprints[p]=false'],
 ['sword obtained with two companions','g.pos!==6||g.sword||g.captured.length<3','g.pos!==6||g.sword||g.captured.length<2'],
 ['companions score without primary reward','total:primary+(primary>0?g.captured.length:0)','total:primary+g.captured.length'],
 ['walk succeeds without enough light','if(g.light<cost){spend(g,cost);finishTurn(g);return g}','if(g.light<0){spend(g,cost);finishTurn(g);return g}'],
 ['stale tap runs twice','if(action.turn!==undefined&&action.turn!==state.turn)return state;',''],
];
const dir=await mkdtemp(join(tmpdir(),'solo-mutations-'));
try{for(const [name,from,to] of faults){if(source.split(from).length!==2)throw new Error(`MUTATION_MATCH ${name}`);const file=join(dir,'game.ts');await writeFile(file,source.replace(from,to));const run=spawnSync(process.execPath,['--experimental-strip-types','--test',resolve('tests/game.test.mjs')],{env:{...process.env,GAME_MODULE:file},encoding:'utf8'});if(run.status===0)throw new Error(`SURVIVED ${name}`);if(run.error)throw run.error;if(!run.stdout.includes('✖')&&!run.stdout.includes('not ok'))throw new Error(`Not a test assertion: ${run.stderr}`);console.log(`CAUGHT ${name}`)}}finally{await rm(dir,{recursive:true,force:true})}
