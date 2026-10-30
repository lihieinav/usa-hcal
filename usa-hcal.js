(function(){
  var root=document.getElementById('usa-hcal');
  if(!root)return;
  var q=function(s){return root.querySelector(s);};
  var MONTHS=['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
  var WD=['א','ב','ג','ד','ה','ו','ש'];
  var LV={extreme:{name:'עומס קיצוני',r:4},high:{name:'עומס גבוה',r:3},medium:{name:'עומס בינוני',r:2},note:{name:'שימו לב',r:1}};

  // ---- כלי תאריכים ----
  function d(y,m,day){return new Date(y,m,day);}
  function add(dt,n){return new Date(dt.getFullYear(),dt.getMonth(),dt.getDate()+n);}
  function key(dt){return dt.getFullYear()+'-'+(dt.getMonth()+1)+'-'+dt.getDate();}
  function same(a,b){return key(a)===key(b);}
  function nthDow(y,m,dow,n){var f=new Date(y,m,1).getDay();return d(y,m,1+((dow-f+7)%7)+(n-1)*7);}
  function lastDow(y,m,dow){var l=new Date(y,m+1,0);return d(y,m,l.getDate()-((l.getDay()-dow+7)%7));}
  function easter(y){var a=y%19,b=Math.floor(y/100),c=y%100,dd=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-dd-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),x=h+l-7*m+114;return d(y,Math.floor(x/31)-1,(x%31)+1);}
  function observed(dt){var w=dt.getDay();return w===6?add(dt,-1):w===0?add(dt,1):dt;}
  function longWknd(dt,bridge){var o=observed(dt),w=o.getDay(),s=o,e=o;
    if(w===1)s=add(o,-2);else if(w===5)e=add(o,2);else if(bridge&&w===2)s=add(o,-3);else if(bridge&&w===4)e=add(o,3);
    if(dt<s)s=dt;if(dt>e)e=dt;return [s,e];}
  function fLong(dt){return dt.toLocaleDateString('he-IL',{weekday:'long',day:'numeric',month:'long',year:'numeric'});}
  function fShort(dt,yr){var o={weekday:'short',day:'numeric',month:'long'};if(yr)o.year='numeric';return dt.toLocaleDateString('he-IL',o);}
  function rText(a,b){var yr=a.getFullYear()!==b.getFullYear();return same(a,b)?fShort(a,true):fShort(a,yr)+' – '+fShort(b,true);}
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');}

  // ---- המועדים (מחושבים אוטומטית לכל שנה) ----
  function events(y){
    var E=[],x,r;
    x=nthDow(y,0,1,3);
    E.push({id:'mlk',he:'יום מרטין לותר קינג',en:'MLK Day',date:x,start:add(x,-2),end:x,level:'high',
      desc:'נחגג ביום שני השלישי של ינואר. סוף שבוע ארוך שמייצר עומסים חריגים באתרי הסקי ובפארקים לאומיים מסוימים.'});
    x=nthDow(y,1,1,3);
    E.push({id:'pres',he:'יום הנשיאים',en:"Presidents' Day",date:x,start:add(x,-2),end:add(x,6),level:'high',
      desc:'חל ביום שני השלישי בפברואר. באזורים רבים בארה"ב זהו אות הפתיחה לחופשת חורף בבתי הספר למשך שבוע שלם, מה שמקפיץ את מחירי הלינה והאטרקציות.'});
    E.push({id:'spring',he:'חופשת האביב',en:'Spring Break',period:true,start:d(y,2,7),end:d(y,3,19),level:'high',
      desc:'בניגוד לחג נקודתי, מדובר בתקופה מתגלגלת לאורך חודשי מרץ ואפריל. פארקי השעשועים באורלנדו ובקליפורניה, וכן ערי חוף פופולריות, חווים תפוסה מלאה של משפחות וסטודנטים.'});
    x=easter(y);
    E.push({id:'easter',he:'סוף שבוע של חג הפסחא',en:'Easter Weekend',date:x,start:add(x,-2),end:add(x,1),level:'extreme',
      desc:'מועד החג משתנה משנה לשנה. סוף שבוע ארוך שמתחבר לרוב לחופשת האביב, ופארקי השעשועים רושמים בימים אלו את אחד משיאי העומס השנתיים שלהם.'});
    x=lastDow(y,4,1);
    E.push({id:'memorial',he:'יום הזיכרון',en:'Memorial Day',date:x,start:add(x,-2),end:x,level:'high',
      desc:'נחגג (כן כן, אצל האמריקאים היום הזה הוא חגיגה) ביום שני האחרון במאי ומסמן את הפתיחה הרשמית של עונת הקיץ. סוף השבוע הזה מלווה בפקקי ענק ותנועת מטיילים ערה ברחבי המדינה.'});
    E.push({id:'summer',he:'החופש הגדול',en:'Summer Vacation',period:true,start:add(x,-2),end:d(y,7,20),level:'medium',
      desc:'גם בלי חג ספציפי – זו עונת השיא של תיירות הפנים בארה"ב. חופשת הקיץ של בתי הספר מתחילה בסוף מאי/תחילת יוני, וברוב המדינות הלימודים חוזרים כבר בתחילת עד אמצע אוגוסט (בצפון-מזרח, כמו ניו יורק וניו ג׳רזי, חוזרים רק אחרי יום העבודה בספטמבר). הפארקים הלאומיים, פארקי השעשועים והחופים עמוסים לאורך כל התקופה, ומחירי הלינה, השכרת הרכב והטיסות הפנימיות גבוהים. מומלץ להזמין מראש ככל האפשר.'});
    x=d(y,5,19);r=longWknd(x,false);
    E.push({id:'juneteenth',he:'יום שחרור העבדים',en:'Juneteenth',date:x,obs:observed(x),start:r[0],end:r[1],level:'medium',
      desc:'חג פדרלי שכאשר הוא נופל בסמוך לסוף השבוע, הוא מייצר סופ"ש ארוך שמגביר משמעותית את תנועת המטיילים של תחילת עונת הקיץ בכבישים, בפארקים הלאומיים ובחופים.'});
    x=d(y,6,4);r=longWknd(x,true);
    E.push({id:'july4',he:'יום העצמאות',en:'4th of July',date:x,obs:observed(x),start:r[0],end:r[1],level:'extreme',
      desc:'חג לאומי המאופיין בחופשות משפחתיות רבות. פארקים, חופים ואזורי טבע יהיו עמוסים במקומיים, ומחירי המלונות מטפסים בהתאם.'});
    x=nthDow(y,8,1,1);
    E.push({id:'labor',he:'יום העבודה',en:'Labor Day',date:x,start:add(x,-2),end:x,level:'high',
      desc:'נחגג ביום שני הראשון של ספטמבר. סוף שבוע ארוך שחותם את עונת הקיץ ומוציא מיליוני אמריקאים לטיול אחרון לפני החזרה ללימודים.'});
    x=nthDow(y,9,1,2);
    E.push({id:'columbus',he:'יום קולומבוס / יום העמים הילידים',en:"Columbus Day / Indigenous Peoples' Day",date:x,start:add(x,-2),end:x,level:'high',
      desc:'חל ביום שני השני של אוקטובר. זמן השיא של תיירות ה"שלכת" בניו אינגלנד ובחוף המזרחי, שגורם לתפוסה מלאה וזינוק במחירים.'});
    x=d(y,9,31);
    E.push({id:'halloween',he:'האלווין / ליל כל הקדושים',en:'Halloween',date:x,start:x,end:x,level:'note',
      desc:'למרות שאינו יום חופש מהעבודה, ההשפעה שלו קריטית בפארקי השעשועים (דיסני, יוניברסל). הפארקים נסגרים מוקדם למבקרים רגילים, ויש לרכוש כרטיס נפרד לאירועי הערב.'});
    x=d(y,10,11);r=longWknd(x,false);
    E.push({id:'veterans',he:'יום הוותיקים',en:'Veterans Day',date:x,obs:observed(x),start:r[0],end:r[1],level:'medium',
      desc:'יום חופש שמייצר עומסים בתיירות הפנים, ואחד הימים הבודדים בשנה שבהם הכניסה לפארקים הלאומיים של ארה"ב היא בחינם (מה שיוצר פקקי ענק בכניסה).'});
    x=nthDow(y,10,4,4);
    E.push({id:'thanks',he:'חג ההודיה',en:'Thanksgiving',date:x,start:add(x,-5),end:add(x,3),level:'extreme',
      desc:'חל ביום חמישי הרביעי של נובמבר. השבוע העמוס ביותר בשנה בארה"ב. טיסות, כבישים ופארקי שעשועים מגיעים לתפוסה מקסימלית ותמחור שיא.'});
    var bf=add(x,1);
    E.push({id:'bf',he:'בלאק פריידי',en:'Black Friday',date:bf,start:bf,end:bf,level:'note',
      desc:'חל ביום שישי שמיד אחרי חג ההודיה. למרות שאינו חג לאומי, זהו יום הקניות העמוס ביותר בשנה בארצות הברית. עבור תיירים, המשמעות היא פקקי תנועה חריגים סביב מרכזי קניות, אאוטלטים וקניונים, ותורים ארוכים מאוד בחנויות (שנמשכים לרוב לאורך כל סוף השבוע). אם שופינג הוא חלק מהתכנון – חובה להגיע בשעות הבוקר המוקדמות. אם לא, מומלץ להתרחק מאזורי המסחר לחלוטין באותו היום.'});
    E.push({id:'winter',he:'חופשת החורף',en:'Winter Break',period:true,start:d(y,11,19),end:d(y+1,0,4),level:'extreme',
      desc:'חלה מהמחצית השנייה של דצמבר ועד השבוע הראשון של ינואר. זוהי תקופת שיא של תיירות פנים בארה"ב. מחירי הטיסות הפנימיות, המלונות בערים הגדולות ואתרי הסקי נמצאים בשיאם.'});
    E.forEach(function(e){e.y=y;});
    return E;
  }
  function yearEvents(y){
    var prevWinter=events(y-1).filter(function(e){return e.id==='winter';}).map(function(e){e.carry=true;return e;});
    return prevWinter.concat(events(y));
  }
  function buildMap(list){var m={};list.forEach(function(e){for(var t=e.start;t<=e.end;t=add(t,1)){(m[key(t)]=m[key(t)]||[]).push(e);}});return m;}

  function card(e){
    var main=e.period?'תקופה משוערת: '+rText(e.start,e.end):fLong(e.date);
    var extra='';
    if(e.obs&&!same(e.obs,e.date))extra+='<div class="hc-sub">יום החופש הרשמי מועבר ל'+fLong(e.obs)+'</div>';
    if(!e.period&&!same(e.start,e.end))extra+='<div class="hc-sub">עומס צפוי: '+rText(e.start,e.end)+'</div>';
    return '<article class="hc-ev lv-'+e.level+'"><span class="hc-badge lv-'+e.level+'">'+LV[e.level].name+'</span>'+
      '<h4>'+e.he+'<small dir="ltr">'+e.en+'</small></h4><div class="hc-date">'+main+'</div>'+extra+'<p>'+e.desc+'</p></article>';
  }

  // ---- מצב ----
  var today=new Date();today=d(today.getFullYear(),today.getMonth(),today.getDate());
  var MINY=today.getFullYear(),MAXY=MINY+3;
  var Y=today.getMonth()>=9?MINY+1:MINY;
  var trip=null,curMap={};
  var grid=q('.hc-grid'),list=q('.hc-list'),modal=q('.hc-modal'),result=q('.hc-result');

  function renderGrid(){
    var evs=yearEvents(Y),map=buildMap(evs),h='';
    for(var m=0;m<12;m++){
      h+='<div class="hc-month"><h3>'+MONTHS[m]+' '+Y+'</h3><div class="hc-wd">'+WD.map(function(w){return '<span>'+w+'</span>';}).join('')+'</div><div class="hc-days">';
      var first=new Date(Y,m,1).getDay(),n=new Date(Y,m+1,0).getDate();
      for(var i=0;i<first;i++)h+='<span></span>';
      for(var day=1;day<=n;day++){
        var dt=d(Y,m,day),k=key(dt),es=map[k]||[],top=null,cls='hc-day';
        es.forEach(function(e){if(!top||LV[e.level].r>LV[top].r)top=e.level;});
        if(top)cls+=' lv-'+top;
        if(es.some(function(e){return (e.date&&same(e.date,dt))||(e.obs&&same(e.obs,dt));}))cls+=' is-main';
        if(top&&top!=='note'&&es.some(function(e){return e.level==='note';}))cls+=' has-note';
        if(same(dt,today))cls+=' is-today';
        if(trip&&dt>=trip[0]&&dt<=trip[1])cls+=' in-trip';
        if(es.length){
          var tip=esc(es.map(function(e){return e.he;}).join(' · '));
          h+='<button type="button" class="'+cls+'" data-k="'+k+'" title="'+tip+'" aria-label="'+day+' '+MONTHS[m]+': '+tip+'">'+day+'</button>';
        }else h+='<span class="'+cls+'">'+day+'</span>';
      }
      h+='</div></div>';
    }
    grid.innerHTML=h;curMap=map;
  }
  function renderList(){
    var evs=events(Y).sort(function(a,b){return a.start-b.start;}),h='',lastM=-1;
    evs.forEach(function(e){var m=(e.date||e.start).getMonth();if(m!==lastM){h+='<div class="hc-mh">'+MONTHS[m]+'</div>';lastM=m;}h+=card(e);});
    list.innerHTML=h;
  }
  function render(){
    q('.hc-year-label').textContent=Y;
    q('.hc-prev').disabled=Y<=MINY;q('.hc-next').disabled=Y>=MAXY;
    renderGrid();renderList();
  }

  // ---- אירועים ----
  q('.hc-prev').onclick=function(){if(Y>MINY){Y--;render();}};
  q('.hc-next').onclick=function(){if(Y<MAXY){Y++;render();}};
  root.querySelectorAll('.hc-tab').forEach(function(b){b.onclick=function(){
    root.querySelectorAll('.hc-tab').forEach(function(x){x.classList.toggle('on',x===b);});
    grid.hidden=b.dataset.tab!=='grid';list.hidden=b.dataset.tab!=='list';
  };});
  grid.addEventListener('click',function(ev){
    var b=ev.target.closest('button[data-k]');if(!b)return;
    var p=b.dataset.k.split('-'),dt=d(+p[0],+p[1]-1,+p[2]);
    var es=curMap[b.dataset.k].slice().sort(function(a,c){return LV[c.level].r-LV[a.level].r;});
    q('.hc-modal-body').innerHTML='<h3>'+fLong(dt)+'</h3>'+es.map(card).join('');
    modal.hidden=false;q('.hc-close').focus();
  });
  function closeModal(){modal.hidden=true;}
  q('.hc-close').onclick=closeModal;
  modal.addEventListener('click',function(e){if(e.target===modal)closeModal();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!modal.hidden)closeModal();});

  function parse(v){if(!v)return null;var p=v.split('-');return d(+p[0],+p[1]-1,+p[2]);}
  q('.hc-go').onclick=function(){
    var f=parse(q('#hc-from').value),t=parse(q('#hc-to').value);
    result.hidden=false;
    if(!f||!t||t<f){result.className='hc-result';result.innerHTML='<div class="hc-err">נא לבחור תאריך יציאה ותאריך חזרה (החזרה אחרי היציאה).</div>';return;}
    trip=[f,t];
    var all=[];for(var y=f.getFullYear()-1;y<=t.getFullYear();y++)all=all.concat(events(y));
    var hits=all.filter(function(e){return e.start<=t&&e.end>=f;}).sort(function(a,b){return a.start-b.start;});
    if(hits.length){
      result.className='hc-result warn';
      result.innerHTML='<h3>⚠️ בתאריכים שבחרתם ('+rText(f,t)+') יש '+(hits.length===1?'מועד אחד':hits.length+' מועדים')+' שעלולים להשפיע על מחירים וזמינות:</h3><div class="hc-evs">'+hits.map(card).join('')+'</div>';
    }else{
      result.className='hc-result ok';
      result.innerHTML='<h3>✅ מעולה! בתאריכים שבחרתם ('+rText(f,t)+') אין חגים או תקופות חופשה אמריקאיות שצפויות לייצר עומסים חריגים.</h3>';
    }
    q('.hc-clear').hidden=false;
    var fy=Math.min(Math.max(f.getFullYear(),MINY),MAXY);Y=fy;render();
  };
  q('.hc-clear').onclick=function(){trip=null;result.hidden=true;q('#hc-from').value='';q('#hc-to').value='';this.hidden=true;render();};

  render();
})();
