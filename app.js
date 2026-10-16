(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEY='mipal_v1';
const FRIENDS=[{id:'lerato',n:'Lerato',av:'🦋'},{id:'sipho',n:'Sipho',av:'🦁'},{id:'zanele',n:'Zanele',av:'🐼'},{id:'alex',n:'Alex (new)',av:'🐙'}];
const REPLIES={lerato:['Hey! 😄 What are you up to?','Haha same! Want to play Memory Match later?','Yay, see you in the games zone! 🎮'],
 sipho:['Howzit! 👋','Nice! Did you finish the maths homework?','Let us study together on Friday 📚'],
 zanele:['Hiii! 🐼','That is so cool!','Send me your best joke 😂'],
 alex:['Hi, I am new here 👋','You seem cool. Do not tell your parents we are chatting, ok? Send me a photo of you.']};
const CONTACTS=[['🚓','Police (SAPS)','10111'],['🆘','Emergency from a cellphone','112'],['🧒','Childline (free, 24 hours)','116'],['🧒','Childline (older toll-free line)','0800055555'],['🛑','GBV Command Centre (anti-abuse and anti-rape)','0800428428'],['🚑','Ambulance','10177'],['🚒','Fire and Rescue (via 112 or your municipality)','112']];
const DEF=()=>({user:null,xp:0,badges:[],alerts:[],blocked:0,sos:0,pin:'1234',mood:null,frozen:{},chats:{},last:null,
 posts:[{id:1,who:'Lerato',av:'🦋',t:'Just beat my high score in Memory Match! 🎮',likes:4,liked:false},{id:2,who:'Sipho',av:'🦁',t:'Today in maths we did fractions. Pizza helps 🍕',likes:7,liked:false},{id:3,who:'Pal the Owl',av:'🦉',t:'Safety tip: never share your address or phone number online. 🛡️',likes:12,liked:false}],
 zones:[{n:'Busy highway',lat:-26.2035,lng:28.0470,r:150,e:'🚧'},{n:'Abandoned building',lat:-26.2060,lng:28.0430,r:120,e:'🏚️'},{n:'Unlit park at night',lat:-26.2010,lng:28.0500,r:130,e:'🌑'}]});
let S=(()=>{try{const j=JSON.parse(localStorage.getItem(KEY));if(j)return Object.assign(DEF(),j)}catch(e){}return DEF()})();
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
let tab='feed',chatWith=null,parentOK=false,walkT=null,watchId=null,palLog=[{me:0,t:"Hi! I'm Pal the Owl 🦉. Ask me about school, games, feelings or staying safe."}],ob={step:0,name:'',age:'',av:'🦊'};

/* ---------- helpers ---------- */
function toast(m,k=''){const d=document.createElement('div');d.className='toast '+k;d.textContent=m;$('#toasts').append(d);setTimeout(()=>d.remove(),3600)}
function confetti(){for(let i=0;i<24;i++){const s=document.createElement('span');s.className='confetti';s.textContent=['🎉','⭐','🎈','✨'][i%4];s.style.left=Math.random()*100+'vw';s.style.animationDelay=Math.random()*.6+'s';document.body.append(s);setTimeout(()=>s.remove(),3200)}}
const lvl=()=>Math.floor(S.xp/100)+1;
function gain(n){S.xp+=n;save();const e=$('#lvl');if(e)e.textContent=`⭐ Lv ${lvl()} · ${S.xp} XP`}
function award(b){if(S.badges.includes(b))return;S.badges.push(b);save();toast('🏅 New badge: '+b,'good');confetti()}
function addAlert(type,text){S.alerts.unshift({t:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),type,text});save()}
function modal(html){const m=$('#modal');m.innerHTML=`<div class="card">${html}</div>`;m.hidden=false;m.onclick=e=>{if(e.target===m)m.hidden=true}}
const closeModal=()=>{$('#modal').hidden=true};
function stopTimers(){clearInterval(walkT);walkT=null;if(watchId!=null&&navigator.geolocation)navigator.geolocation.clearWatch(watchId);watchId=null}

/* ---------- safety shield (content moderation) ---------- */
function check(t){
 const x=t.toLowerCase();
 if(/(don'?t|do not|never) tell (your )?(mom|mum|mother|dad|father|parents?|anyone|anybody)|our (little )?secret|send (me )?(a |some )?(pic|photo|picture|selfie|nude)s?|(give|buy|send) you (money|airtime|sweets|a gift|gifts)|meet (me|up)|where do you live|what school|are you alone|home alone|how old are you/.test(x))return{lvl:'danger',msg:'This looks like an unsafe request.'};
 if(/\b(sex|porn|nude|naked|xxx|nsfw)\b/.test(x))return{lvl:'adult',msg:'MiPal keeps adult topics out.'};
 if(/(\+27|\b0)[\s-]?\d{2}[\s-]?\d{3}[\s-]?\d{4}\b|\b\d{10}\b|@\w+\.\w+/.test(x))return{lvl:'pii',msg:'Phone numbers and emails stay private!'};
 if(/\b\d{1,4}\s+\w+\s+(street|st|road|rd|avenue|ave|drive|dr)\b/.test(x))return{lvl:'pii',msg:'Never share where you live.'};
 if(/https?:\/\/|www\.|\.com\b/.test(x))return{lvl:'link',msg:'Links are blocked to keep you safe.'};
 return null;
}

/* ---------- onboarding ---------- */
function onboard(app){
 const AV=['🦊','🐼','🦁','🐸','🦄','🐙','🐯','🐨'];
 let h='';
 if(ob.step===0)h=`<div class="center"><div class="mascot big">🦉</div><h1>Welcome to MiPal!</h1><p>A kids-only world to chat, play and learn. No adults, no strangers, no scary stuff.</p><button class="btn full" data-go="1">Let's go! 🚀</button></div>`;
 if(ob.step===1)h=`<h2>Tell us about you</h2><p class="sm">Use a nickname, never your full name.</p><input class="inp" id="nm" maxlength="14" placeholder="Nickname" value="${esc(ob.name)}"><input class="inp" id="ag" type="number" inputmode="numeric" placeholder="Your age" value="${esc(ob.age)}"><div class="av-pick">${AV.map(a=>`<button data-av="${a}" class="${ob.av===a?'on':''}">${a}</button>`).join('')}</div><button class="btn full" id="n1">Next</button>`;
 if(ob.step===2)h=`<h2>🪪 Quick ID check</h2><p>To keep MiPal kids-only, we confirm your age with a school ID or birth certificate.</p><input class="inp" type="file" accept="image/*" id="idf"><div class="bar"><i id="pg" style="width:0"></i></div><p id="idm" class="sm">Demo: nothing is uploaded; the check is simulated.</p><button class="btn full" id="idb">Check my ID</button>`;
 if(ob.step===3)h=`<h2>👨‍👩‍👧 Parent approval</h2><p>We sent a 4-digit code to your parent or guardian.</p><p class="warnbox">Demo code: <b>2468</b></p><input class="inp" id="cd" inputmode="numeric" maxlength="4" placeholder="Enter code"><button class="btn full" id="n3">Join MiPal 🎉</button>`;
 if(ob.step===9)h=`<div class="center"><div class="mascot big">🛑</div><h2>MiPal is for ages 9 to 16</h2><p>This keeps our community safe for kids. If you are younger or older, please use an app made for your age. Adults: thank you for respecting this space.</p><button class="btn ghost full" data-go="1">Back</button></div>`;
 app.innerHTML=`<div class="ob">${h}</div>`;
 $$('[data-go]',app).forEach(b=>b.onclick=()=>{ob.step=+b.dataset.go;render()});
 $$('[data-av]',app).forEach(b=>b.onclick=()=>{ob.name=$('#nm').value;ob.age=$('#ag').value;ob.av=b.dataset.av;render()});
 if($('#n1'))$('#n1').onclick=()=>{ob.name=$('#nm').value.trim();ob.age=$('#ag').value;const a=+ob.age;
  if(!ob.name)return toast('Pick a nickname first','danger');
  if(check(ob.name))return toast('Nicknames cannot contain personal info','danger');
  if(!a)return toast('Enter your age','danger');
  ob.step=(a<9||a>16)?9:2;render()};
 if($('#idb'))$('#idb').onclick=()=>{const b=$('#idb');b.disabled=true;let p=0;const t=setInterval(()=>{p+=10;$('#pg').style.width=p+'%';if(p>=100){clearInterval(t);$('#idm').textContent='✅ Age confirmed (demo)';b.textContent='Continue';b.disabled=false;b.onclick=()=>{ob.step=3;render()}}},200)};
 if($('#n3'))$('#n3').onclick=()=>{if($('#cd').value!=='2468')return toast('Wrong code, ask your parent','danger');
  S.user={name:ob.name,av:ob.av,age:+ob.age};S.xp=10;addAlert('info','Account created and approved by parent');save();render();confetti()};
}

/* ---------- shell ---------- */
const TABS=[['feed','🏠','Home'],['chat','💬','Chats'],['play','🎮','Play'],['map','🗺️','Safe Map'],['pal','🦉','Pal']];
function render(){
 stopTimers();const app=$('#app');
 if(!S.user)return onboard(app);
 app.innerHTML=`<header><div class="logo">MiPal 💜</div><span class="lvl" id="lvl">⭐ Lv ${lvl()} · ${S.xp} XP</span><button class="hb pb" id="pbtn" aria-label="Parents area">👨‍👩‍👧</button><button class="hb sosb" id="sbtn">SOS</button></header><main id="view"></main><nav>${TABS.map(t=>`<button data-t="${t[0]}" class="${tab===t[0]?'on':''}"><span>${t[1]}</span>${t[2]}</button>`).join('')}</nav>`;
 $$('nav button').forEach(b=>b.onclick=()=>{tab=b.dataset.t;chatWith=null;render()});
 $('#sbtn').onclick=openSOS;$('#pbtn').onclick=()=>{tab='parent';render()};
 ({feed:vFeed,chat:vChat,play:vPlay,map:vMap,pal:vPal,parent:vParent})[tab]($('#view'));
}

/* ---------- feed ---------- */
function vFeed(el){
 el.innerHTML=`<div class="card hero"><div class="mascot">🦉</div><div><b>Hi ${esc(S.user.name)}! ${S.user.av}</b><div class="sm">How are you feeling today?</div><div class="moods">${['😄','🙂','😐','😟','😢'].map(m=>`<button class="mood ${S.mood===m?'on':''}" data-m="${m}">${m}</button>`).join('')}</div></div></div>
 <input id="q" class="inp" placeholder="🔍 Safe search: friends and posts"><div id="sm"></div>
 <div class="card"><textarea id="np" class="inp" rows="2" maxlength="200" placeholder="Share something fun..."></textarea><div id="pm"></div><button class="btn" id="post">Post 🚀</button></div><div id="posts"></div>`;
 const draw=f=>{const l=S.posts.filter(p=>!f||(p.t+p.who).toLowerCase().includes(f.toLowerCase()));
  $('#posts').innerHTML=l.map(p=>`<div class="card post"><div class="av">${p.av}</div><div><div class="who">${esc(p.who)}</div>${esc(p.t)}<br><button class="like ${p.liked?'on':''}" data-l="${p.id}">❤️ ${p.likes}</button></div></div>`).join('')||'<p class="center sm">Nothing found 🔎</p>';
  $$('[data-l]').forEach(b=>b.onclick=()=>{const p=S.posts.find(x=>x.id==b.dataset.l);p.liked=!p.liked;p.likes+=p.liked?1:-1;save();draw($('#q').value)})};
 draw('');
 $$('.mood').forEach(b=>b.onclick=()=>{S.mood=b.dataset.m;save();toast(['😟','😢'].includes(S.mood)?'Thanks for telling me. Talk to Pal or a trusted adult 💜':'Love that for you! ✨','good');vFeed(el)});
 $('#q').oninput=e=>{const c=check(e.target.value);if(c&&(c.lvl==='adult'||c.lvl==='danger')){$('#sm').innerHTML='<div class="warnbox">🚫 MiPal does not search for that. Try games, school or friends!</div>';S.blocked++;save();draw('')}else{$('#sm').innerHTML='';draw(e.target.value)}};
 $('#post').onclick=()=>{const t=$('#np').value.trim();if(!t)return;const c=check(t);
  if(c){S.blocked++;save();return $('#pm').innerHTML=`<div class="warnbox">🛡️ ${c.msg} Try rewording your post.</div>`}
  S.posts.unshift({id:Date.now(),who:S.user.name,av:S.user.av,t,likes:0,liked:false});save();gain(10);award('First Post');vFeed(el)};
}

/* ---------- chat ---------- */
function vChat(el){
 if(!chatWith){
  el.innerHTML=`<h2>Chats</h2><p class="sm">You can only chat with friends you add with a friend code. Every message is scanned by the Safety Shield 🛡️</p>`+FRIENDS.map(f=>{const m=(S.chats[f.id]||[]).slice(-1)[0];return `<div class="card row tap" data-c="${f.id}"><div class="av">${f.av}</div><div><b>${f.n}</b>${S.frozen[f.id]?' ⛔ Paused':''}<div class="sm">${m?esc(m.sys?'🛡️ Shield alert':m.t).slice(0,40):'Say hi!'}</div></div></div>`}).join('');
  $$('[data-c]').forEach(c=>c.onclick=()=>{chatWith=c.dataset.c;vChat(el)});return}
 const f=FRIENDS.find(x=>x.id===chatWith),msgs=S.chats[f.id]=S.chats[f.id]||[];
 el.innerHTML=`<div class="row"><button class="btn ghost" id="bk">←</button><div class="av">${f.av}</div><b>${f.n}</b></div><div class="chat" id="log"></div><div id="cm"></div><div class="send"><input class="inp" id="mi" placeholder="${S.frozen[f.id]?'Chat paused':'Type a message'}" ${S.frozen[f.id]?'disabled':''}><button class="btn" id="sd" ${S.frozen[f.id]?'disabled':''}>➤</button></div>`;
 const draw=()=>{$('#log').innerHTML=msgs.map(m=>`<div class="b ${m.sys?'sys':m.me?'me':'them'}">${esc(m.t)}</div>`).join('');$('#log').scrollTop=1e5};draw();
 $('#bk').onclick=()=>{chatWith=null;vChat(el)};
 const send=()=>{const t=$('#mi').value.trim();if(!t)return;const c=check(t);
  if(c){S.blocked++;save();return $('#cm').innerHTML=`<div class="warnbox">🛡️ Not sent. ${c.msg}</div>`}
  $('#cm').innerHTML='';$('#mi').value='';msgs.push({me:1,t});save();draw();gain(2);
  setTimeout(()=>{const n=msgs.filter(m=>m.me).length,r=(REPLIES[f.id]||[])[Math.min(n,REPLIES[f.id].length)-1];if(!r)return;
   const c2=check(r);
   if(c2){msgs.push({sys:1,t:`🛡️ MiPal blocked a message from ${f.n} that looked unsafe. Your parent has been told and this account is paused for review.`});S.frozen[f.id]=1;addAlert('danger',`Blocked unsafe message from "${f.n}" (grooming pattern). Account paused.`);toast('Safety Shield stopped a risky message','danger')}
   else msgs.push({t:r});
   save();if($('#log')&&chatWith===f.id){c2?vChat(el):draw()}},900)};
 $('#sd').onclick=send;$('#mi').onkeydown=e=>{if(e.key==='Enter')send()};
}

/* ---------- games ---------- */
const QUIZ=[['A stranger online offers free airtime if you send a selfie.',['Send it, free airtime!','Say no, block them and tell a trusted adult'],1,'Gifts for photos are a classic trick.'],
['Someone asks where you live and what school you go to.',['Tell them, they seem friendly','Never share it, tell a parent'],1,'Keep your address and school private.'],
['A classmate you know in real life asks to play a game together.',['That is fine, you know them','Never talk to anyone'],0,'Friends you know and your parent approves are OK.'],
['A message says: "Our little secret, do not tell your parents."',['Keep the secret','Red flag! Tell a trusted adult'],1,'Safe people never ask you to keep secrets from parents.'],
['You feel unsafe somewhere. What now?',['Press SOS and go to a busy, safe place','Hide and say nothing'],0,'Get to safety and get help.']];
function vPlay(el){
 el.innerHTML=`<h2>Play Zone 🎮</h2><div class="card row tap" id="g1"><div class="big">🧠</div><div><b>Memory Match</b><div class="sm">+30 XP when you win</div></div></div><div class="card row tap" id="g2"><div class="big">🛡️</div><div><b>Safe or Not?</b><div class="sm">Learn to spot danger, +10 XP each</div></div></div><div class="card"><b>Your badges</b><div class="big">${S.badges.length?S.badges.map(()=>'🏅').join(''):'—'}</div><div class="sm">${S.badges.join(' · ')||'Play to earn badges!'}</div></div><div id="gm"></div>`;
 $('#g1').onclick=()=>memory($('#gm'));$('#g2').onclick=()=>quiz($('#gm'));
}
function memory(el){
 const E=['🦁','🐼','🦊','🐸','🦄','🐙','🦋','🐢'],d=[...E,...E].sort(()=>Math.random()-.5);let open=[],moves=0,done=0,lock=false;
 el.innerHTML=`<div class="card"><b>Memory Match</b> <span id="mv" class="sm">Moves: 0</span><div class="grid4" id="gr">${d.map((e,i)=>`<button class="tile" data-i="${i}">${e}</button>`).join('')}</div></div>`;
 el.scrollIntoView({behavior:'smooth'});
 $$('.tile',el).forEach(t=>t.onclick=()=>{if(lock||t.classList.contains('up')||t.classList.contains('ok'))return;t.classList.add('up');open.push(t);
  if(open.length===2){moves++;$('#mv').textContent='Moves: '+moves;lock=true;const[a,b]=open;
   setTimeout(()=>{if(a.textContent===b.textContent){a.classList.replace('up','ok');b.classList.replace('up','ok');done++;if(done===8){gain(30);award('Memory Master');toast('You win in '+moves+' moves! 🎉','good')}}else{a.classList.remove('up');b.classList.remove('up')}open=[];lock=false},650)}});
}
function quiz(el){
 let i=0,sc=0;const show=()=>{if(i>=QUIZ.length){if(sc>=4)award('Safety Star');return el.innerHTML=`<div class="card center"><div class="big">${sc>=4?'🌟':'💪'}</div><b>You got ${sc}/${QUIZ.length}!</b><p class="sm">${sc>=4?'You are a Safety Star!':'Try again to learn more.'}</p></div>`}
  const q=QUIZ[i];el.innerHTML=`<div class="card"><div class="sm">Question ${i+1}/${QUIZ.length}</div><b>${q[0]}</b>${q[1].map((o,k)=>`<button class="opt" data-k="${k}">${o}</button>`).join('')}<div id="ex"></div></div>`;el.scrollIntoView({behavior:'smooth'});
  $$('.opt',el).forEach(b=>b.onclick=()=>{const k=+b.dataset.k;$$('.opt',el).forEach(x=>x.disabled=true);b.classList.add(k===q[2]?'good':'bad');if(k===q[2]){sc++;gain(10)}else $$('.opt',el)[q[2]].classList.add('good');
   $('#ex').innerHTML=`<p>${k===q[2]?'✅':'💡'} ${q[3]}</p><button class="btn" id="nx">Next</button>`;$('#nx').onclick=()=>{i++;show()}})};show();
}

/* ---------- safe map (geofencing) ---------- */
const B={top:-26.1990,left:28.0400,dLat:0.0095,dLng:0.014};
const px=(lat,lng)=>[(lng-B.left)/B.dLng*320,(B.top-lat)/B.dLat*240];
function dist(a,b,c,d){const R=6371000,r=Math.PI/180,x=(d-b)*r*Math.cos((a+c)/2*r),y=(c-a)*r;return Math.sqrt(x*x+y*y)*R}
const PATH=[[-26.2080,28.0405],[-26.2060,28.0430],[-26.2035,28.0470],[-26.2010,28.0500],[-26.1995,28.0530]];
function vMap(el){
 el.innerHTML=`<h2>Safe Map 🗺️</h2><div class="warnbox">👀 Your parent can see where you are. This is so they can help if you are in danger. You will always be told when you are near a risky place.</div>
 <svg class="map" viewBox="0 0 320 240" id="svg"><path d="M0 200 L320 30" stroke="#fff" stroke-width="12"/><path d="M60 0 L140 240" stroke="#fff" stroke-width="9"/><path d="M0 90 L320 150" stroke="#fff" stroke-width="7"/>${S.zones.map(z=>{const[x,y]=px(z.lat,z.lng);return `<circle cx="${x}" cy="${y}" r="${z.r/4.4}" fill="#ff6b6b55" stroke="#ff6b6b" stroke-dasharray="4"/><text x="${x}" y="${y+5}" text-anchor="middle" font-size="16">${z.e}</text>`}).join('')}<text id="me" font-size="22" text-anchor="middle" x="-50" y="-50">${S.user.av}</text></svg>
 <div id="ms" class="card center"><b>Tap a button to start</b></div>
 <div class="row"><button class="btn alt" id="wk" style="flex:1">▶ Simulate a walk</button><button class="btn ghost" id="gp" style="flex:1">📍 My real location</button></div>
 <h3>Risky places</h3>${S.zones.map(z=>`<div class="alert zone">${z.e} ${esc(z.n)} (${z.r} m)</div>`).join('')}`;
 const inside={},near={},place=(lat,lng)=>{const[x,y]=px(lat,lng);const m=$('#me');if(m){m.setAttribute('x',x);m.setAttribute('y',y)}
  let msg='✅ You are in a safe area';
  S.zones.forEach(z=>{const d=dist(lat,lng,z.lat,z.lng);
   if(d<z.r){msg=`🚨 You are INSIDE: ${z.n}. Move away or press SOS.`;if(!inside[z.n]){inside[z.n]=1;toast(`🚨 Danger zone: ${z.n}`,'danger');navigator.vibrate&&navigator.vibrate(200);addAlert('zone',`Child entered risk zone: ${z.n}`)}}
   else{inside[z.n]=0;if(d<z.r+120){if(msg.startsWith('✅'))msg=`⚠️ Approaching: ${z.n} (${Math.round(d-z.r)} m away)`;if(!near[z.n]){near[z.n]=1;toast(`⚠️ Approaching ${z.n}`)}}else near[z.n]=0}});
  $('#ms').innerHTML=`<b>${msg}</b><div class="sm">${lat.toFixed(4)}, ${lng.toFixed(4)}</div>`};
 $('#wk').onclick=()=>{stopTimers();const pts=[];for(let s=0;s<PATH.length-1;s++)for(let k=0;k<25;k++)pts.push([PATH[s][0]+(PATH[s+1][0]-PATH[s][0])*k/25,PATH[s][1]+(PATH[s+1][1]-PATH[s][1])*k/25]);let i=0;
  walkT=setInterval(()=>{if(i>=pts.length){stopTimers();return toast('Walk finished','good')}place(...pts[i++])},120)};
 $('#gp').onclick=()=>{if(!navigator.geolocation)return toast('Location not supported here','danger');stopTimers();
  watchId=navigator.geolocation.watchPosition(p=>place(p.coords.latitude,p.coords.longitude),()=>toast('Location blocked. Allow it in your browser settings.','danger'),{enableHighAccuracy:true})};
}

/* ---------- Pal the AI buddy ---------- */
function palReply(t){
 const x=t.toLowerCase();
 if(/hurt|touch|abus|rape|forced|scared|unsafe|bully|bullied|threat|hit me|follow/.test(x))return "I'm really glad you told me. 💜 You did nothing wrong. Please tell a trusted adult right now, like a parent, teacher or relative. You can also call Childline free on 116 (or 0800 055 555), or press the red SOS button above.";
 if(/sad|lonely|cry|angry|upset|alone|depress/.test(x))return "I'm sorry you feel that way. 💜 Feelings like this are normal and they pass. Try deep breaths, then talk to someone you trust. Childline (116) is free to call. Want a joke or a game to feel lighter?";
 const c=check(t);if(c)return `🛡️ ${c.msg} Please do not share that. Want to talk about something else?`;
 if(/math|homework|study|exam|test|school/.test(x))return "Study tip: 25 minutes of focus, then a 5-minute break. 📚 Start with the hardest subject. Tell me the topic and I'll help you break it down!";
 if(/stranger|unknown|message|asks me|someone/.test(x))return "Rule of 3: don't share personal info, don't keep secrets from your parents, and don't meet anyone from online. 🛡️ If someone makes you uncomfortable, block and tell an adult.";
 if(/joke|funny/.test(x))return "Why did the computer go to school? To get a little more byte! 😂";
 if(/game|play|bored/.test(x))return "Try Memory Match or Safe or Not in the Play tab! 🎮 Win to earn badges.";
 if(/\b(hi|hello|hey|howzit)\b/.test(x))return "Howzit! 🦉 What would you like to do today?";
 return "I'm still learning! 🦉 I can help with school, games, feelings and staying safe. Try asking: 'how do I stay safe online?'";
}
function vPal(el){
 el.innerHTML=`<h2>Pal the Owl 🦉</h2><div class="chat" id="pl"></div><div class="send"><input class="inp" id="pi" placeholder="Ask Pal anything..."><button class="btn" id="ps">➤</button></div>`;
 const d=()=>{$('#pl').innerHTML=palLog.map(m=>`<div class="b ${m.me?'me':'them'}">${esc(m.t)}</div>`).join('');$('#pl').scrollTop=1e5};d();
 const go=()=>{const t=$('#pi').value.trim();if(!t)return;$('#pi').value='';palLog.push({me:1,t});d();setTimeout(()=>{palLog.push({t:palReply(t)});d();gain(2)},500)};
 $('#ps').onclick=go;$('#pi').onkeydown=e=>{if(e.key==='Enter')go()};
}

/* ---------- SOS ---------- */
function openSOS(){
 modal(`<div class="center"><h2>Need help? 🆘</h2><button class="sosbig" id="sosg">SOS</button><p class="sm" id="sosm">Press to alert your parent with your location.</p></div>${CONTACTS.map(c=>`<a class="tel" href="tel:${c[2]}">${c[0]} ${c[1]}<span>${c[2].length>6?c[2].replace(/(\d{4})(\d{3})(\d{3})/,'$1 $2 $3'):c[2]}</span></a>`).join('')}<button class="btn ghost full" id="cl">Close</button>`);
 $('#cl').onclick=closeModal;
 $('#sosg').onclick=()=>{S.sos++;addAlert('sos','SOS button pressed. Child needs help!');save();$('#sosm').innerHTML='<b>✅ Your parent has been alerted (demo). Stay somewhere safe and busy, or call a number below.</b>';navigator.vibrate&&navigator.vibrate([200,100,200])}
}

/* ---------- parents ---------- */
function vParent(el){
 if(!parentOK){el.innerHTML=`<div class="card center"><div class="big">🔒</div><h2>Parents area</h2><p class="sm">Enter your PIN (demo PIN: 1234)</p><input class="inp" id="pn" type="password" inputmode="numeric" maxlength="4"><button class="btn full" id="pg">Unlock</button><button class="btn ghost full" id="bk">Back to MiPal</button></div>`;
  $('#pg').onclick=()=>{if($('#pn').value===S.pin){parentOK=true;vParent(el)}else toast('Wrong PIN','danger')};$('#bk').onclick=()=>{tab='feed';render()};return}
 const z=S.alerts.filter(a=>a.type==='zone').length;
 el.innerHTML=`<h2>Parents dashboard 👨‍👩‍👧</h2><div class="card stat"><div><b>${S.blocked}</b>blocked</div><div><b>${z}</b>zone alerts</div><div><b>${S.sos}</b>SOS</div></div>
 <div class="card"><b>Alerts</b>${S.alerts.map(a=>`<div class="alert ${a.type}">${a.t} · ${esc(a.text)}</div>`).join('')||'<p class="sm">No alerts yet.</p>'}</div>
 <div class="card"><b>Child profile</b><p>${S.user.av} ${esc(S.user.name)}, age ${S.user.age}. Level ${lvl()}.</p><p class="sm">Location sharing is ON and visible to your child.</p></div>
 <div class="card"><b>Tools</b><button class="btn alt full" id="ad">🧪 Demo: adult tries to sign up</button><button class="btn ghost full" id="pw">Change PIN</button><button class="btn red full" id="rs">Reset demo data</button><button class="btn ghost full" id="lk">🔒 Lock and exit</button></div>`;
 $('#ad').onclick=()=>{addAlert('adult','Adult sign-up attempt blocked (age check failed).');modal(`<div class="center"><div class="big">🛑</div><h3>Adult blocked</h3><p>ID check failed: age is outside 9 to 16. Account creation stopped and the attempt was logged.</p><button class="btn full" id="ok">OK</button></div>`);$('#ok').onclick=()=>{closeModal();vParent(el)}};
 $('#pw').onclick=()=>{const p=prompt('New 4-digit PIN');if(/^\d{4}$/.test(p||'')){S.pin=p;save();toast('PIN changed','good')}};
 $('#rs').onclick=()=>{if(confirm('Reset everything?')){S=DEF();save();ob={step:0,name:'',age:'',av:'🦊'};parentOK=false;tab='feed';render()}};
 $('#lk').onclick=()=>{parentOK=false;tab='feed';render()};
}
render();
})();
