const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const toast=t=>{const e=$('#toast');e.textContent=t;e.classList.add('on');setTimeout(()=>e.classList.remove('on'),1800)};

const SUPABASE_URL="https://tqpdleuwxehpvyatyfun.supabase.co";
const SUPABASE_ANON_KEY="sb_publishable_kMUvvyf3amxgefhiBWT5NA_STVQSp-5";
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function go(p){
  $$('.page').forEach(s=>s.classList.toggle('on',s.id==='page-'+p));
  $$('.bottom button, #navDesk button').forEach(b=>b.classList.toggle('on',b.dataset.p===p));
  window.scrollTo(0,0);
}
$$('.bottom button, #navDesk button').forEach(b=>b.onclick=()=>go(b.dataset.p));

$('#aiFrame').src="https://nexus-sealyn-ai-deve-m9l5.bolt.host/";

function doLogin(){
  const u=$('#loginUser').value.trim();
  if(!u){toast('Isi username dulu');return}
  me.user=u.replace(/^@/,'');
  me.name=u;
  $('#avatar').src=`https://i.pravatar.cc/150?u=${me.user}`;
  saveEdit(true);
  go('profile');
  toast('Masuk sebagai @'+me.user);
}

const fixU=u=>u&&u.startsWith('/')?'https://www.tikwm.com'+u:u;
async function fetchV(){
  const u=$('#link').value.trim(),err=$('#err'),b=$('#fetchB');
  err.style.display='none';$('#res').classList.remove('on');
  if(!/tiktok\.com/i.test(u)){err.textContent='Linknya salah. Pakai format tiktok.com/@user/video/...';err.style.display='block';return}
  b.disabled=true;b.textContent='Loading...';
  try{
    const r=await fetch('https://www.tikwm.com/api/?url='+encodeURIComponent(u));
    const j=await r.json();
    if(j.code!==0||!j.data) throw 0;
    const d=j.data;
    $('#rv').src=fixU(d.play);
    $('#rt').textContent=d.title||'Tanpa judul';
    $('#rm').textContent='@'+(d.author?.unique_id||'-')+' • '+d.duration+' detik';
    $('#dmp4').href=fixU(d.play);
    $('#dmp3').href=fixU(d.music);
    $('#res').classList.add('on');
  }catch(e){err.textContent='Gagal ambil video. Coba link lain.';err.style.display='block'}
  b.disabled=false;b.textContent='Download';
}
$('#fetchB').onclick=fetchV;
$('#link').onkeydown=e=>e.key==='Enter'&&fetchV();

let me={name:"Charter User",user:"charter.y",bio:"Bandung. Suka ngulik preset & video. Admin Charter.Y"};
let suggestions=[
  {name:"Rizky Ramadhan",user:"rizky.rr",img:"https://i.pravatar.cc/100?img=12",followYou:true},
  {name:"Sinta Dewi",user:"sinta.dwi",img:"https://i.pravatar.cc/100?img=32",followYou:true},
  {name:"Dewa Putra",user:"dewa.putra",img:"https://i.pravatar.cc/100?img=15",followYou:false},
  {name:"Putri Ayu",user:"putri.ayu",img:"https://i.pravatar.cc/100?img=26",followYou:false},
];
let followingCache=[],followersCache=[];

function isFollowingLocal(u){return followingCache.includes(u)}
async function loadFollowData(){
  const {data:f} = await db.from('follows').select('following_username').eq('follower_username',me.user);
  followingCache=(f||[]).map(r=>r.following_username);
  const {data:fl} = await db.from('follows').select('follower_username').eq('following_username',me.user);
  followersCache=(fl||[]).map(r=>r.follower_username);
}
async function toggleFollow(u){
  if(isFollowingLocal(u)){
    await db.from('follows').delete().eq('follower_username',me.user).eq('following_username',u);
    followingCache=followingCache.filter(x=>x!==u);
    toast('Unfollow @'+u);
  }else{
    await db.from('follows').insert({follower_username:me.user,following_username:u});
    followingCache.push(u);
    toast('Follow @'+u);
  }
  renderProfile();
  if($('#followModal').classList.contains('open')) openFollow(followMode);
}
function renderProfile(){
  $('#pName').textContent=me.name;
  $('#pUser').textContent='@'+me.user;
  $('#pBio').textContent=me.bio;
  $('#sFollowing').textContent=followingCache.length||180;
  $('#sFollowers').textContent=followersCache.length? (followersCache.length+1200) : '1,2rb';
  const box=$('#people');box.innerHTML='';
  suggestions.forEach(p=>{
    const fol=isFollowingLocal(p.user);
    const isFb=p.followYou&&!fol;
    const div=document.createElement('div');div.className='person';
    div.innerHTML=`<img src="${p.img}"><div><b>${p.name}</b><span>@${p.user}${p.followYou?' • mengikuti kamu':''}</span></div>`;
    const btn=document.createElement('button');
    btn.className='btn-follow'+(fol?' following':isFb?' follback':'');
    btn.textContent=fol?'Mengikuti':isFb?'Follback':'Follow';
    btn.onclick=()=>toggleFollow(p.user);
    div.appendChild(btn);box.appendChild(div);
  });
}
let followMode='followers';
async function openFollow(mode){
  followMode=mode;
  $('#followTitle').textContent=mode==='followers'?'Pengikut':'Mengikuti';
  $('#followModal').classList.add('open');
  await loadFollowData();
  const box=$('#followList');box.innerHTML='';
  let list = mode==='followers'
    ? [...followersCache.map(u=>({name:u,user:u,img:`https://i.pravatar.cc/100?u=${u}`})), ...suggestions.filter(s=>s.followYou)]
    : followingCache.map(u=>({name:u,user:u,img:`https://i.pravatar.cc/100?u=${u}`}));
  if(!list.length) box.innerHTML='<p style="color:#888;font-size:13px;text-align:center;padding:20px">Belum ada</p>';
  list.forEach(p=>{
    const div=document.createElement('div');div.className='person';
    div.innerHTML=`<img src="${p.img}"><div><b>${p.name}</b><span>@${p.user}</span></div>`;
    const btn=document.createElement('button');btn.className='btn-follow'+(isFollowingLocal(p.user)?' following':'');
    btn.textContent=isFollowingLocal(p.user)?'Mengikuti':'Follow';
    btn.onclick=()=>toggleFollow(p.user);
    div.appendChild(btn);box.appendChild(div);
  });
}
function closeFollow(){$('#followModal').classList.remove('open')}
$('#followModal').addEventListener('click',e=>{if(e.target.id==='followModal')closeFollow()});

function openEdit(){$('#fName').value=me.name;$('#fUser').value=me.user;$('#fBio').value=me.bio;$('#editModal').classList.add('open')}
function closeEdit(){$('#editModal').classList.remove('open')}
$('#editBtn').onclick=openEdit;
async function saveEdit(silent){
  me.name=$('#fName').value.trim()||me.name;
  me.user=$('#fUser').value.trim().replace(/^@/,'')||me.user;
  me.bio=$('#fBio').value.trim();
  await db.from('profiles').upsert({username:me.user,name:me.name,bio:me.bio},{onConflict:'username'});
  $('#avatar').src=`https://i.pravatar.cc/150?u=${me.user}`;
  renderProfile();closeEdit();if(!silent)toast('Profil disimpan');
}
async function loadProfile(){
  const {data}=await db.from('profiles').select('*').eq('username',me.user).single();
  if(data){me.name=data.name;me.bio=data.bio;}
  await loadFollowData();renderProfile();
}
loadProfile();