/**
 * Holerite Oculto — calculadora de custo do funcionário CLT (interface).
 * Depende de tributos-2026.js (inss, ir).
 */

const fmt = v => v.toLocaleString('pt-BR',{style:'currency',currency:'BRL',minimumFractionDigits:2,maximumFractionDigits:2});
const fmt0 = v => v.toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0});
const pct = v => (v*100).toLocaleString('pt-BR',{maximumFractionDigits:1})+'%';
const num2 = v => v.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
// Aceita "5000", "5.000", "5.000,50", "5000,50" e "5000.50"
const parse = s => {
  s=String(s).replace(/[^\d,.]/g,'');
  if(s.includes(',')) s=s.replace(/\./g,'').replace(',','.');
  else if(/^\d{1,3}(\.\d{3})+$/.test(s)) s=s.replace(/\./g,'');
  const n=parseFloat(s); return isFinite(n)&&n>0?n:0;
};
const $ = id => document.getElementById(id);
const desktop = window.matchMedia('(min-width:900px)');

let deps=0, calMode='voce', last=null;
const calCells=[];

function calc(){
  const S=parse($('sal').value);
  const regime=$('regime').value, rat=parseFloat($('rat').value);
  const vr=parse($('vr').value), plano=parse($('plano').value), vt=parse($('vt').value);
  const consPct=parseFloat($('cons').value)/100, patr=parse($('patr').value);

  // Remuneração anual
  const ferias=S/3, decimo=S;
  const remAnual=12*S+decimo+ferias;

  // Encargos empresa
  const pPatronal = regime==='simples'?0:0.20;
  const pRat = regime==='simples'?0:rat;
  const pTerc = regime==='geral'?0.058:0;
  const patronal=remAnual*pPatronal, ratV=remAnual*pRat, terc=remAnual*pTerc;
  const fgts=remAnual*0.08;
  const multa=$('multa').checked?fgts*0.4:0;
  const vtEmp=Math.max(0,vt-0.06*S)*12;
  const benef=vr*12+plano*12+vtEmp;
  const custoLegal=remAnual+patronal+ratV+terc+fgts+multa+benef;

  // Custos indiretos (estimativas)
  const indOn=$('indOn').checked;
  const anos=Math.max(1,Math.min(30,parseInt($('anos').value)||1));
  const diasAviso=Math.min(90,30+3*anos);
  const avisoProv=indOn?(S*diasAviso/30)*1.08/anos:0; // aviso indenizado + FGTS, diluído pelos anos de casa
  const equip=indOn?parse($('equip').value)*12:0;
  const seguro=indOn?parse($('seguro').value)*12:0;
  const exames=indOn?parse($('exames').value):0;
  const treino=indOn?parse($('treino').value):0;
  const indireto=avisoProv+equip+seguro+exames+treino;
  const custo=custoLegal+indireto;

  // Funcionário
  const inssMes=inss(S), irMes=ir(S,deps,true);
  const feriasRend=S*4/3;
  const inssAno=11*inssMes+inss(feriasRend)+inss(decimo);
  const irAno=11*irMes+ir(feriasRend,deps,true)+ir(decimo,deps,false);
  const liqAno=remAnual-inssAno-irAno;
  const consumo=liqAno*consPct;
  const impPessoa=inssAno+irAno+consumo+patr;
  const encGov=patronal+ratV+terc;
  const govTotal=encGov+impPessoa;

  const diasVoce=remAnual>0?Math.round(impPessoa/remAnual*365):0;
  const diasTudo=custo>0?Math.round(govTotal/custo*365):0;
  const mult=S>0?custo/12/S:0;

  last={S,custo,custoLegal,remAnual,diasVoce,diasTudo,liqMes:S-inssMes-irMes,impPessoa,mult};

  // Hero
  const multTxt=mult.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+'×';
  $('custoMes').textContent=fmt(custo/12);
  $('stV').textContent=fmt(custo/12);
  $('stM').textContent=S>0?multTxt:'';
  $('heroLbl').textContent=indireto>0?'Custo real pra empresa manter você, por mês':'Custo pra empresa manter você, por mês (só o que a lei obriga)';
  $('minLine').innerHTML=indireto>0?`Só o que a lei obriga: <b>${fmt(custoLegal/12)}</b> · indiretos: <b>${fmt(indireto/12)}</b>`:'';
  $('custoAno').textContent=fmt0(custo);
  $('liqMes').textContent=fmt(S-inssMes-irMes);
  $('mult').textContent=multTxt+' o salário';
  $('mult').style.visibility=S>0?'':'hidden';
  $('govPct').textContent=custo>0?pct((encGov+inssAno+irAno)/custo):'—';
  $('heroLine').innerHTML=S>0?`Pra você receber <b>${fmt(S)}</b> de salário bruto, a empresa desembolsa <b>${fmt(custo/12-S)}</b> a mais por mês.`:'Digite um salário pra começar.';

  // Barra: destino do dinheiro da empresa
  const segs=[
    {t:'No seu bolso',d:'Salário, 13º e férias já sem INSS e IR',v:liqAno,c:'var(--green)'},
    {t:'FGTS',d:'Seu, mas fica preso na Caixa'+(multa?' (inclui multa provisionada)':''),v:fgts+multa,c:'var(--fgts)'},
    {t:'Benefícios',d:'VR/VA, plano, vale-transporte',v:benef,c:'var(--ben)'},
    {t:'Impostos do seu salário',d:'INSS + Imposto de Renda',v:inssAno+irAno,c:'var(--gov)'},
    {t:'Impostos da empresa',d:'INSS patronal, RAT e terceiros',v:encGov,c:'var(--emp)'},
    {t:'Custos indiretos',d:'Aviso prévio, equipamento, exames, seguro, treinamento',v:indireto,c:'var(--ind)'},
  ].filter(s=>s.v>0.5);
  $('bar').innerHTML=custo>0?segs.map(s=>{const p=s.v/custo;return `<div style="flex-basis:${p*100}%;background:${s.c}" title="${s.t}: ${fmt(s.v)}">${p>.09?pct(p):''}</div>`}).join(''):'';
  $('legend').innerHTML=custo>0?segs.map(s=>`<div class="leg"><span class="dot" style="background:${s.c}"></span><div><div class="row"><span class="t">${s.t}</span><span class="n">${pct(s.v/custo)}</span></div><div class="p">${fmt0(s.v)} por ano · ${s.d}</div></div></div>`).join(''):'';

  // Tabela empresa
  const r=(n,d,v,c)=>v>0.004?`<tr><td><span class="pill" style="background:${c}"></span>${n}${d?`<span class="d">${d}</span>`:''}</td><td>${fmt(v/12)}</td><td>${fmt0(v)}</td></tr>`:'';
  $('tabEmp').innerHTML=`<tr><th>Item</th><th>Por mês</th><th>No ano</th></tr>
   <tr class="sec"><td colspan="3">Remuneração</td></tr>
   ${r('Salários','12 meses',12*S,'var(--green)')}
   ${r('13º salário','',decimo,'var(--green)')}
   ${r('1/3 de férias','Adicional constitucional',ferias,'var(--green)')}
   <tr class="sec"><td colspan="3">Encargos</td></tr>
   ${r('INSS patronal (20%)','',patronal,'var(--emp)')}
   ${r(`RAT/SAT (${(pRat*100).toFixed(0)}%)`,'Seguro de acidente de trabalho',ratV,'var(--emp)')}
   ${r('Terceiros (5,8%)','Sistema S, salário-educação, Incra, Sebrae',terc,'var(--emp)')}
   ${r('FGTS (8%)','Depositado na conta do funcionário',fgts,'var(--fgts)')}
   ${r('Provisão multa FGTS (40%)','Caso de demissão sem justa causa',multa,'var(--fgts)')}
   ${benef>0?'<tr class="sec"><td colspan="3">Benefícios</td></tr>':''}
   ${r('Vale-refeição / alimentação','',vr*12,'var(--ben)')}
   ${r('Plano de saúde','',plano*12,'var(--ben)')}
   ${r('Vale-transporte','Parte que a empresa paga',vtEmp,'var(--ben)')}
   ${indireto>0?'<tr class="sec"><td colspan="3">Custos indiretos (estimativa)</td></tr>':''}
   ${r('Provisão de aviso prévio',`${diasAviso} dias + FGTS, diluído em ${anos} ano${anos>1?'s':''} de casa`,avisoProv,'var(--ind)')}
   ${r('Equipamento e software','Computador, celular, licenças',equip,'var(--ind)')}
   ${r('Seguro de vida','Muitas convenções coletivas exigem',seguro,'var(--ind)')}
   ${r('Exames ocupacionais','Admissional, periódico, demissional',exames,'var(--ind)')}
   ${r('Recrutamento e treinamento','',treino,'var(--ind)')}
   ${regime==='simples'?'<tr class="note"><td colspan="3">No Simples, a contribuição patronal já está dentro do imposto único (DAS) que a empresa paga sobre o faturamento.</td></tr>':''}
   <tr class="tot"><td>Custo total</td><td>${fmt(custo/12)}</td><td>${fmt0(custo)}</td></tr>`;

  // Pessoa
  $('impAno').textContent=fmt0(impPessoa);
  $('impPct').textContent=remAnual>0?`${pct(impPessoa/remAnual)} da sua renda bruta anual (${fmt0(remAnual)})`:'—';
  $('diasV').textContent=diasVoce+' dias';
  $('diasS').textContent=`Uns ${(diasVoce/30.4).toLocaleString('pt-BR',{maximumFractionDigits:1})} meses do seu ano`;
  const rp=(n,d,v)=>`<tr><td><span class="pill" style="background:var(--gov)"></span>${n}<span class="d">${d}</span></td><td>${fmt(v/12)}</td><td>${fmt0(v)}</td></tr>`;
  $('tabPes').innerHTML=`<tr><th>Imposto</th><th>Por mês</th><th>No ano</th></tr>
   ${rp('INSS','Desconto no holerite, com 13º e férias',inssAno)}
   ${rp('Imposto de Renda',irAno===0?'Isento pela regra de 2026':'Retido na fonte, com 13º e férias',irAno)}
   ${rp('Impostos no consumo',`Estimativa: ${pct(consPct)} do que você gasta`,consumo)}
   ${patr>0?rp('IPVA + IPTU','Impostos sobre patrimônio',patr):''}
   <tr class="tot"><td>Total</td><td>${fmt(impPessoa/12)}</td><td>${fmt0(impPessoa)}</td></tr>`;

  syncChips(S);
  drawCal();
}

/* ---------- calendário: 12 mini-meses com os dias de 2026 ---------- */
(function buildCal(){
  const meses=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  let h='';
  for(let m=0;m<12;m++){
    const first=new Date(2026,m,1).getDay(); // 0 = domingo
    const total=new Date(2026,m+1,0).getDate();
    h+=`<div class="mon"><div class="mn">${meses[m]}</div><div class="dd">${'<s></s>'.repeat(first)}${'<i></i>'.repeat(total)}</div></div>`;
  }
  $('cal').innerHTML=h;
  calCells.push(...$('cal').querySelectorAll('i'));
})();

function drawCal(){
  if(!last)return;
  const n=Math.max(0,Math.min(365,calMode==='voce'?last.diasVoce:last.diasTudo));
  calCells.forEach((c,i)=>{c.classList.toggle('tax',i<n);c.classList.toggle('free',last.S>0&&i===n);});
  const d=new Date(2026,0,1);d.setDate(d.getDate()+n);
  const dataStr=d.toLocaleDateString('pt-BR',{day:'numeric',month:'long'});
  $('freedom').innerHTML = last.S<=0?'Digite um salário pra ver seu calendário.': calMode==='voce'
    ? `Você trabalha <b>${n} dias</b> por ano só pra pagar seus impostos. Seu salário só começa a ser "seu" em <b>${dataStr}</b>.`
    : `Somando o que a empresa recolhe por você, o governo fica com o equivalente a <b>${n} dias</b> de todo o custo do seu trabalho. "Liberdade" só em <b>${dataStr}</b>.`;
}

/* ---------- campos de dinheiro ---------- */
function maskMoney(el){
  el.addEventListener('blur',()=>{const v=parse(el.value);el.value=v?num2(v):'0';});
  el.addEventListener('focus',()=>setTimeout(()=>el.select(),0));
  el.addEventListener('input',calc);
}
['sal','vr','plano','vt','patr','equip','seguro','exames','treino'].forEach(id=>maskMoney($(id)));

// "Enter"/"OK" do teclado do celular fecha o teclado
document.querySelectorAll('input[inputmode]').forEach(el=>el.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();el.blur();}}));

/* ---------- valores rápidos ---------- */
const chips=[...document.querySelectorAll('#chips button')];
function syncChips(S){chips.forEach(b=>b.classList.toggle('on',Math.abs(parseFloat(b.dataset.v)-S)<0.005));}
chips.forEach(b=>b.addEventListener('click',()=>{$('sal').value=num2(parseFloat(b.dataset.v));calc();}));
$('chips').querySelector('[data-v="1621"]').title='Salário mínimo 2026: R$ 1.621,00';

/* ---------- demais controles ---------- */
$('anos').addEventListener('input',calc);
$('indOn').addEventListener('change',()=>{$('indFields').style.opacity=$('indOn').checked?1:.4;$('indFields').inert=!$('indOn').checked;updBadges();calc();});
['regime','rat','multa'].forEach(id=>$(id).addEventListener('change',()=>{updRegime();calc();}));
$('cons').addEventListener('input',()=>{$('consV').textContent=$('cons').value+'%';calc();});
['vr','plano','vt'].forEach(id=>$(id).addEventListener('input',updBadges));
document.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>{deps=Math.max(0,Math.min(10,deps+parseInt(b.dataset.step)));$('deps').textContent=deps;calc();}));
document.querySelectorAll('#seg button').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('#seg button').forEach(x=>{x.classList.remove('on');x.setAttribute('aria-selected','false');});
  b.classList.add('on');b.setAttribute('aria-selected','true');calMode=b.dataset.mode;drawCal();
}));

function updRegime(){
  const r=$('regime').value;
  $('ratField').style.display=r==='simples'?'none':'';
  $('regimeHint').textContent={geral:'Empresa paga INSS patronal de 20% + RAT + terceiros.',simples:'Patronal já vem no DAS; a empresa recolhe à parte só o FGTS.',simples4:'Anexo IV paga INSS patronal de 20% + RAT por fora (sem terceiros).'}[r];
}

// Etiquetas nos títulos das seções recolhidas ("opcional", "ligado"...)
function updBadges(){
  const sums=document.querySelectorAll('.sub-d summary small');
  const temBen=['vr','plano','vt'].some(id=>parse($(id).value)>0);
  sums[0].textContent=temBen?'preenchido':'opcional';
  sums[1].textContent=$('indOn').checked?'ligado':'desligado';
}

/* ---------- "Ajustar o cálculo": aberto no computador, fechado no celular ---------- */
function syncAdv(){ $('adv').open=desktop.matches; }
syncAdv();
desktop.addEventListener?desktop.addEventListener('change',syncAdv):desktop.addListener(syncAdv);

/* ---------- compartilhar ---------- */
$('shareBtn').addEventListener('click',async()=>{
  if(!last||!last.S)return;
  const url=location.href.split('#')[0];
  const t=`Meu salário bruto é ${fmt(last.S)}, mas eu custo ${fmt(last.custo/12)} por mês pra empresa (${last.mult.toLocaleString('pt-BR',{maximumFractionDigits:2})}× o salário).\n`+
          `Pago ${fmt0(last.impPessoa)} de imposto no ano e trabalho ${last.diasVoce} dias só pro governo.\n`+
          `Faça a sua conta:`;
  const txt=$('shareTxt'), orig='Compartilhar resultado';
  if(navigator.share){
    try{await navigator.share({title:'Holerite Oculto',text:t,url});return;}
    catch(e){if(e.name==='AbortError')return;}
  }
  try{await navigator.clipboard.writeText(t+' '+url);txt.textContent='Copiado ✓';}
  catch(e){txt.textContent='Não deu pra copiar';}
  setTimeout(()=>txt.textContent=orig,2000);
});

/* ---------- barra fixa do celular ---------- */
// Aparece quando o resultado sai da tela; some enquanto o teclado está aberto.
let heroVisivel=true, digitando=false;
const updSticky=()=>$('sticky').classList.toggle('hide',heroVisivel||digitando||!last||!last.S);
try{new IntersectionObserver(es=>{heroVisivel=es[0].isIntersecting;updSticky();}).observe($('hero'));}catch(e){heroVisivel=false;}
document.addEventListener('focusin',e=>{if(e.target.matches('input[inputmode],input[type=number],select')){digitando=true;updSticky();}});
document.addEventListener('focusout',()=>{digitando=false;setTimeout(updSticky,150);});
$('stGo').addEventListener('click',e=>{e.preventDefault();$('hero').scrollIntoView({behavior:'smooth',block:'start'});});

updRegime();updBadges();calc();updSticky();
