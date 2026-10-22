const tracks = [
  {id:1,title:"Aurora",artist:"Luna Vale",genre:"Indie pop",mood:"indie",duration:"3:24",art:"aurora",symbol:"✳"},
  {id:2,title:"Golden Hour",artist:"Mateo Sol",genre:"Pop",mood:"pop",duration:"2:58",art:"sunset",symbol:"☼"},
  {id:3,title:"Blue Escape",artist:"Nora Waves",genre:"Chill",mood:"chill",duration:"4:02",art:"ocean",symbol:"≈"},
  {id:4,title:"Neon Heart",artist:"Club Cinema",genre:"Electronic",mood:"electronic",duration:"3:16",art:"neon",symbol:"◉"},
  {id:5,title:"Soft Focus",artist:"Mila June",genre:"Chill",mood:"chill",duration:"3:41",art:"dream",symbol:"☾"},
  {id:6,title:"Velvet Groove",artist:"The Sundaze",genre:"Indie pop",mood:"indie",duration:"3:09",art:"groove",symbol:"◌"},
  {id:7,title:"Wildflower",artist:"Eden Park",genre:"Indie",mood:"indie",duration:"3:52",art:"forest",symbol:"✿"},
  {id:8,title:"Pulse Theory",artist:"Kairo",genre:"Electronic",mood:"electronic",duration:"2:47",art:"pulse",symbol:"⌁"}
];
const $ = id => document.getElementById(id);
let filteredTracks = [...tracks], currentTrack = null, playing = false, liked = new Set(), activeFilter = "", progressTimer = null, seconds = 0, durationSeconds = 0, isShuffle = false, repeat = false;
let playlists = [];
function parseDuration(value){const [m,s]=value.split(":").map(Number);return m*60+s}
function toast(message){const el=$("toast");el.textContent=message;el.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove("show"),2400)}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function renderTracks(){
  const q=$("searchInput").value.trim().toLowerCase();
  filteredTracks=tracks.filter(t=>(!activeFilter||t.mood===activeFilter)&&[t.title,t.artist,t.genre].some(v=>v.toLowerCase().includes(q)));
  $("trackGrid").innerHTML=filteredTracks.map(t=>`<article class="track-card">
    <div class="track-art art-${t.art}"><span class="art-symbol ${t.symbol.length>1?'symbol-small':''}">${t.symbol}</span><button class="track-play" data-play="${t.id}" aria-label="Reproducir ${escapeHTML(t.title)}">▶</button></div>
    <div class="track-topline"><h3 title="${escapeHTML(t.title)}">${escapeHTML(t.title)}</h3><span class="track-tag">${escapeHTML(t.genre)}</span></div>
    <div class="track-artist">${escapeHTML(t.artist)}</div><div class="track-bottom"><span class="track-duration">${t.duration}</span><button class="track-like ${liked.has(t.id)?'liked':''}" data-like="${t.id}" aria-label="Me gusta">${liked.has(t.id)?'♥':'♡'}</button></div>
  </article>`).join("");
  $("noResults").classList.toggle("hidden",filteredTracks.length>0);
}
function setCurrent(t){
  currentTrack=t;seconds=0;durationSeconds=parseDuration(t.duration);
  $("currentTitle").textContent=t.title;$("currentArtist").textContent=t.artist;
  $("currentCover").className=`mini-cover art-${t.art}`;$("currentCover").textContent=t.symbol;
  $("duration").textContent=t.duration;$("currentTime").textContent="0:00";$("progress").value=0;
  $("likeCurrent").classList.toggle("liked",liked.has(t.id));$("likeCurrent").textContent=liked.has(t.id)?"♥":"♡";
}
function formatTime(s){return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,"0")}`}
function stopTimer(){if(progressTimer){clearInterval(progressTimer);progressTimer=null}}
function startTimer(){stopTimer();progressTimer=setInterval(()=>{if(!playing)return;if(seconds<durationSeconds){seconds++;$("progress").value=durationSeconds?seconds/durationSeconds*100:0;$("currentTime").textContent=formatTime(seconds)}else if(repeat){seconds=0;$("progress").value=0;$("currentTime").textContent="0:00"}else{playing=false;$("playPause").textContent="▶";stopTimer()}},1000)}
function playTrack(id){const t=tracks.find(x=>x.id===Number(id));if(!t)return;setCurrent(t);playing=true;$("playPause").textContent="Ⅱ";startTimer();toast(`Reproduciendo: ${t.title}`)}
function togglePlay(){if(!currentTrack){playTrack((filteredTracks[0]||tracks[0]).id);return}playing=!playing;$("playPause").textContent=playing?"Ⅱ":"▶";if(playing)startTimer();else stopTimer()}
function nextTrack(direction=1){if(!currentTrack){playTrack(tracks[0].id);return}let pool=filteredTracks.length?filteredTracks:tracks;let idx=pool.findIndex(t=>t.id===currentTrack.id);if(isShuffle)idx=Math.floor(Math.random()*pool.length);else idx=(idx+direction+pool.length)%pool.length;playTrack(pool[idx].id)}
$("trackGrid").addEventListener("click",e=>{const play=e.target.closest("[data-play]");const like=e.target.closest("[data-like]");if(play)playTrack(play.dataset.play);if(like){const id=Number(like.dataset.like);liked.has(id)?liked.delete(id):liked.add(id);renderTracks();if(currentTrack?.id===id){$("likeCurrent").classList.toggle("liked",liked.has(id));$("likeCurrent").textContent=liked.has(id)?"♥":"♡"}toast(liked.has(id)?"Añadida a Me gusta":"Quitada de Me gusta")}});
$("searchInput").addEventListener("input",renderTracks);
document.querySelectorAll("[data-filter]").forEach(btn=>btn.addEventListener("click",()=>{activeFilter=activeFilter===btn.dataset.filter?"":btn.dataset.filter;document.querySelectorAll("[data-filter]").forEach(b=>b.classList.toggle("selected",b===btn&&!!activeFilter));renderTracks();document.querySelector("#novedades").scrollIntoView({behavior:"smooth"});toast(activeFilter?`Mood: ${btn.querySelector("strong").textContent}`:"Mostrando todos los estilos")}));
$("showAll").addEventListener("click",()=>{activeFilter="";$("searchInput").value="";document.querySelectorAll("[data-filter]").forEach(b=>b.classList.remove("selected"));renderTracks();toast("Mostrando todo el catálogo")});
$("heroPlay").addEventListener("click",()=>{document.querySelector("#explorar").scrollIntoView({behavior:"smooth"});if(!currentTrack)playTrack(tracks[0].id)});
$("playPause").addEventListener("click",togglePlay);$("nextTrack").addEventListener("click",()=>nextTrack(1));$("prevTrack").addEventListener("click",()=>{if(seconds>3){seconds=0;$("progress").value=0;$("currentTime").textContent="0:00"}else nextTrack(-1)});
$("shuffleBtn").addEventListener("click",()=>{isShuffle=!isShuffle;$("shuffleBtn").classList.toggle("active",isShuffle);toast(isShuffle?"Modo aleatorio activado":"Modo aleatorio desactivado")});
$("repeatBtn").addEventListener("click",()=>{repeat=!repeat;$("repeatBtn").classList.toggle("active",repeat);toast(repeat?"Repetición activada":"Repetición desactivada")});
$("progress").addEventListener("input",()=>{if(!currentTrack)return;seconds=Math.round(Number($("progress").value)/100*durationSeconds);$("currentTime").textContent=formatTime(seconds)});
$("volume").addEventListener("input",()=>{if(Number($("volume").value)===0)toast("Volumen al mínimo");});
$("likeCurrent").addEventListener("click",()=>{if(!currentTrack){toast("Primero elige una canción");return}liked.has(currentTrack.id)?liked.delete(currentTrack.id):liked.add(currentTrack.id);$("likeCurrent").classList.toggle("liked",liked.has(currentTrack.id));$("likeCurrent").textContent=liked.has(currentTrack.id)?"♥":"♡";renderTracks();toast(liked.has(currentTrack.id)?"Añadida a Me gusta":"Quitada de Me gusta")});
$("queueBtn").addEventListener("click",()=>toast(currentTrack?`Sonando: ${currentTrack.title} · ${filteredTracks.length} canciones en la lista`:"Elige una canción para empezar"));
document.querySelectorAll("[data-playlist]").forEach(b=>b.addEventListener("click",()=>{const idx=Math.floor(Math.random()*tracks.length);playTrack(tracks[idx].id);toast(`Mix “${b.dataset.playlist}” iniciado`) }));
const dialog=$("playlistDialog");
$("createPlaylist").addEventListener("click",()=>dialog.showModal());
$("playlistForm").addEventListener("submit",e=>{e.preventDefault();const name=$("playlistName").value.trim();if(!name)return;playlists.push({name,description:$("playlistDescription").value.trim()});const link=document.createElement("a");link.href="#playlists";link.className="playlist-shortcut";link.innerHTML=`<span class="playlist-dot violet"></span>${escapeHTML(name)}`;$("playlistList").appendChild(link);dialog.close();$("playlistForm").reset();toast(`Playlist “${name}” creada`)});
$("mobileMenu").addEventListener("click",()=>$("sidebar").classList.toggle("open"));
document.querySelectorAll(".nav-link").forEach(link=>link.addEventListener("click",()=>{document.querySelectorAll(".nav-link").forEach(a=>a.classList.remove("active"));link.classList.add("active");$("sidebar").classList.remove("open")}));
$("backBtn").addEventListener("click",()=>history.back());$("forwardBtn").addEventListener("click",()=>history.forward());
document.addEventListener("keydown",e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();$("searchInput").focus()}if(e.code==="Space"&&!["INPUT","TEXTAREA"].includes(document.activeElement.tagName)&&!dialog.open){e.preventDefault();togglePlay()}if(e.key==="Escape")$("sidebar").classList.remove("open")});
$("year").textContent=new Date().getFullYear();
renderTracks();
