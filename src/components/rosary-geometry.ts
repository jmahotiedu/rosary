export interface Point { readonly x:number; readonly y:number; }
export interface BeadGeometry extends Point { readonly stepId:string; readonly radius:number; readonly hitRadius:number; readonly large:boolean; readonly decade?:number; readonly number?:number; }
export const VIEWBOX={width:390,height:720} as const;
export function createRosaryGeometry():readonly BeadGeometry[]{
 const beads:BeadGeometry[]=[]; const cx=195,cy=225,rx=132,ry=160;
 for(let i=0;i<55;i++){const a=Math.PI/2-i*2*Math.PI/55; const decade=Math.floor(i/11)+1; const pos=i%11; beads.push({x:cx+rx*Math.cos(a),y:cy+ry*Math.sin(a),radius:pos===0?11:6.5,hitRadius:22,large:pos===0,stepId:pos===0?`decade-${decade}-our-father`:`decade-${decade}-hail-${pos}`,decade,number:pos||undefined});}
 beads.push({x:195,y:442,radius:13,hitRadius:22,large:true,stepId:"opening-glory"});
 [488,522,556].forEach((y,i)=>beads.push({x:195,y,radius:7,hitRadius:22,large:false,stepId:`opening-hail-${i+1}`,number:i+1}));
 beads.push({x:195,y:598,radius:11,hitRadius:22,large:true,stepId:"opening-our-father"});
 beads.push({x:195,y:680,radius:15,hitRadius:28,large:true,stepId:"crucifix"});
 return beads;
}
