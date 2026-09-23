// Mobile navigation
const menu = document.getElementById('menu');
const mobile = document.getElementById('mobileMenu');

if (menu && mobile) {
  menu.addEventListener('click', () => {
    mobile.style.display = mobile.style.display === 'block' ? 'none' : 'block';
  });
  mobile.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobile.style.display = 'none';
    });
  });
}

// Plant Check Form
const form = document.getElementById('plantForm');
const result = document.getElementById('formResult');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = {
      power_kw: fd.get('power_kw') || form.querySelector('input[type="number"]')?.value,
      inverter: fd.get('inverter') || form.querySelector('select')?.value,
      panel_count: fd.get('panel_count'),
      year: fd.get('year'),
      problem: fd.get('problem'),
      phone: fd.get('phone')
    };

    try {
      const r = await fetch('/api/plant-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Request failed');
      
      if (result) {
        result.innerHTML = `<strong style="color: #2e7d32;">✓ Հարցումը ընդունված է</strong><br>Հայտի № ${data.id}: Մենք կկապվենք ձեզ հետ։`;
      } else {
        alert(`Հարցումը ընդունված է: Հայտի № ${data.id}`);
      }
      form.reset();
      const badge = document.getElementById('aiCheckBadge');
      if (badge) badge.style.display = 'none';
    } catch (err) {
      if (result) {
        result.innerHTML = `<strong style="color: #c62828;">Սխալ տեղի ունեցավ:</strong> ${err.message}`;
      } else {
        alert('Սխալ՝ ' + err.message);
      }
    }
  });
}

// Smooth-scroll
for (const a of document.querySelectorAll('a[href^="#"]')) {
  a.addEventListener('click', () => {
    if (mobile) mobile.style.display = 'none';
  });
}

// Reveal-on-scroll
const observer = new IntersectionObserver((es) => {
  es.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.08 });

document.querySelectorAll('section').forEach(s => observer.observe(s));

// --- 1. Live Solar Monitor Dynamic Simulation ---
const livePower = document.getElementById('liveCurrentPower');
const livePV1 = document.getElementById('livePV1');
const livePV2 = document.getElementById('livePV2');
const liveAC = document.getElementById('liveAC');
const liveTemp = document.getElementById('liveTemp');

if (livePower && livePV1 && livePV2 && liveAC && liveTemp) {
  setInterval(() => {
    const p1 = (4.15 + (Math.random() * 0.1 - 0.05)).toFixed(2);
    const p2 = (4.22 + (Math.random() * 0.1 - 0.05)).toFixed(2);
    const total = (parseFloat(p1) + parseFloat(p2)).toFixed(2);
    const ac = Math.floor(229 + Math.random() * 5);
    const temp = Math.floor(52 + Math.random() * 3);

    livePower.innerHTML = `${total} <em>kW</em>`;
    livePV1.textContent = `${p1} kW`;
    livePV2.textContent = `${p2} kW`;
    liveAC.textContent = `${ac} V`;
    liveTemp.textContent = `${temp}°C`;
  }, 3500);
}

// --- 2. Monitoring Demo Modal Logic ---
const btnOpenDemo = document.getElementById('btnOpenDemo');
const btnCloseDemo = document.getElementById('btnCloseDemo');
const demoModal = document.getElementById('demoModal');

if (btnOpenDemo && demoModal) {
  btnOpenDemo.addEventListener('click', () => {
    demoModal.style.display = 'flex';
  });
}

if (btnCloseDemo && demoModal) {
  btnCloseDemo.addEventListener('click', () => {
    demoModal.style.display = 'none';
  });
}

// --- 3. Dedicated House Voltage Regulation Form Logic ---
const houseVoltForm = document.getElementById('houseVoltForm');
const hvResult = document.getElementById('hvResult');

if (houseVoltForm) {
  houseVoltForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const phase = document.getElementById('hvPhase').value;
    const problem = document.getElementById('hvProblem').value;
    const area = document.getElementById('hvArea').value || 'Չի նշվել';
    const solar = document.getElementById('hvHasSolar').value;
    const phone = document.getElementById('hvPhone').value.trim();

    const desc = `Տան լարման ստաբիլիզացիա: Ֆազ՝ ${phase}, Խնդիր՝ ${problem}, Մակերես՝ ${area}, Արևային՝ ${solar}`;

    try {
      const r = await fetch('/api/service-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem_type: `Տան Լարման Կարգավորում (${phase})`,
          description: desc,
          phone: phone,
          customer_name: 'Առանձնատան Տեր'
        })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Request failed');

      hvResult.innerHTML = `
        <div style="background:#132e44; padding:10px; border-radius:6px; border-left:4px solid #4ade80; color:#fff; margin-top:8px;">
          ✓ Հայտ № ${data.id} ընդունված է։ Մեր ինժեները կկապվի չափագրման և ստաբիլիզատորի ընտրության համար։
        </div>
      `;
      houseVoltForm.reset();
    } catch (err) {
      hvResult.innerHTML = `<span style="color:#ef4444;">Սխալ՝ ${err.message}</span>`;
    }
  });
}

// --- 4. Solar AI Button Action ---
const btnGetAiCheck = document.getElementById('btnGetAiCheck');
const plantProblemSelect = document.getElementById('plantProblemSelect');
const aiCheckBadge = document.getElementById('aiCheckBadge');

if (btnGetAiCheck) {
  btnGetAiCheck.addEventListener('click', () => {
    const checkSection = document.getElementById('check');
    if (checkSection) {
      checkSection.scrollIntoView({ behavior: 'smooth' });
    }
    if (plantProblemSelect) {
      plantProblemSelect.value = 'AI խորացված դիագնոստիկա';
    }
    if (aiCheckBadge) {
      aiCheckBadge.style.display = 'block';
    }
  });
}

// --- 5. O&M Packages Modal Logic ---
const pkgModal = document.getElementById('pkgModal');
const btnClosePkg = document.getElementById('btnClosePkg');
const selectedPkgTitle = document.getElementById('selectedPkgTitle');
const hiddenPkgName = document.getElementById('hiddenPkgName');
const pkgForm = document.getElementById('pkgForm');
const pkgResult = document.getElementById('pkgResult');

document.querySelectorAll('.pkg-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const pkg = btn.getAttribute('data-pkg');
    if (selectedPkgTitle) selectedPkgTitle.textContent = pkg;
    if (hiddenPkgName) hiddenPkgName.value = pkg;
    if (pkgResult) pkgResult.innerHTML = '';
    if (pkgModal) pkgModal.style.display = 'flex';
  });
});

if (btnClosePkg && pkgModal) {
  btnClosePkg.addEventListener('click', () => {
    pkgModal.style.display = 'none';
  });
}

if (pkgForm) {
  pkgForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pkg = hiddenPkgName.value;
    const power = document.getElementById('pkgPower').value;
    const phone = document.getElementById('pkgPhone').value;
    const address = document.getElementById('pkgAddress').value || 'Չի նշվել';

    try {
      const r = await fetch('/api/service-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem_type: `Փաթեթ՝ ${pkg}`,
          description: `Կայանի հզորություն՝ ${power} կՎտ, Հասցե՝ ${address}`,
          phone: phone,
          customer_name: 'Փաթեթի պատվիրատու',
          address: address
        })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Request failed');

      pkgResult.innerHTML = `<span style="color:#4ade80;">✓ Պատվերը գրանցվեց (Հայտ № ${data.id}): Ինժեները շուտով կկապվի ձեզ հետ։</span>`;
      setTimeout(() => {
        pkgModal.style.display = 'none';
        pkgForm.reset();
      }, 2500);
    } catch (err) {
      pkgResult.innerHTML = `<span style="color:#ef4444;">Սխալ՝ ${err.message}</span>`;
    }
  });
}

// --- 6. Inverter Error Code Lookup Logic ---
const errorDatabase = {
  Solis: [
    { code: "OV-G-V01", name: "Grid Overvoltage", severity: "HIGH (Վթարային)", meaning: "Ցանցի AC լարումը գերազանցել է թույլատրելի առավելագույն շեմը (սովորաբար >253V կամ >260V):", causes: "Տեղական ցանցի գերբեռնվածություն, հարևանությամբ բազմաթիվ արևային կայանների միաժամանակյա աշխատանք, բարակ կամ երկար AC մալուխներ:", fix: "Ինվերտորի grid standard պարամետրերի կարգավորում, AC մալուխի հատույթի մեծացում կամ հզոր լարման ստաբիլիզատորի տեղադրում:" },
    { code: "ISO-PRO01 / ISO-PRO02", name: "Isolation Resistance Fault", severity: "CRITICAL (Անվտանգություն)", meaning: "DC գծի (պանելներից եկող մալուխների) իզոլյացիայի դիմադրությունը հողակցման նկատմամբ կրիտիկական ցածր է (< 100kΩ / 1MΩ):", causes: "Խոնավություն կամ ջուր MC4 կոնեկտորների մեջ, մալուխի մեկուսացման մեխանիկական վնասվածք, կրծողներ կամ մետաղական կոնստրուկցիային հպվող հաղորդալար:", fix: "DC գծի ստուգում մեգաօհմմետրով (Megger test), խոնավացած/այրված MC4 կոնեկտորների փոխարինում և հերմետիկացում:" },
    { code: "NO-GRID", name: "No AC Grid Detected", severity: "MEDIUM", meaning: "Ինվերտորը չի տեսնում արտաքին էլեկտրական ցանցը:", causes: "ՀԷՑ-ի կողմից հոսանքազրկում, AC ավտոմատի կամ ապահովիչի (fuse) անջատված վիճակ, AC ֆազերի կամ զրոյի խզում:", fix: "Ստուգել AC պաշտպանական վահանակի ավտոմատները և չափել AC լարումը մուտքի տերմինալների վրա:" },
    { code: "IGBT-OV-PRO", name: "Internal Inverter Overcurrent", severity: "CRITICAL (Սարքավորում)", meaning: "Ինվերտորի ներքին ուժային տրանզիստորների (IGBT) գերհոսանք կամ գերլարում:", causes: "Կայծակ, ցանցի կտրուկ իմպուլսային տատանումներ (surge) կամ ներքին տախտակի խափանում:", fix: "Պահանջվում է ինվերտորի ապամոնտաժում և լաբորատոր տեխնիկական սպասարկում/ռեմոնտ:" }
  ],
  Growatt: [
    { code: "Error 102 (Grid V. Outrange)", name: "AC Voltage Out of Range", severity: "HIGH (Վթարային)", meaning: "Ցանցի AC լարումը դուրս է եկել աշխատանքային դիապազոնից:", causes: "Ցանցի բարձր լարում պիկ ժամերին, անհավասարակշռված ֆազեր:", fix: "Լարման ստաբիլիզատորի ինտեգրում կամ ինվերտորի AC պարամետրերի վերածրագրավորում:" },
    { code: "PV Isolation Low", name: "PV Isolation Fault", severity: "CRITICAL", meaning: "Պանելների DC շղթայի իզոլյացիայի անկում (հաճախ անձրևից կամ ձնհալից հետո):", causes: "Վնասված մալուխ, ջուր լցված կոնեկտորներ, ոչ ճիշտ հողակցում:", fix: "Մանրակրկիտ string diagnostics տեղում՝ մեգաօհմմետրով:" },
    { code: "Error 203 (PV Over Voltage)", name: "PV String Overvoltage", severity: "CRITICAL (Պանելներ)", meaning: "String-ի Voc լարումը գերազանցել է ինվերտորի մաքսիմալ շեմը (օր. >550V կամ >1000V):", causes: "Ձմռան ցրտին Voc-ի բարձրացում սխալ նախագծման (ավել պանելների քանակի) պատճառով:", fix: "String-ի պանելների վերահաշվարկ և կոնֆիգուրացիայի փոփոխություն:" }
  ],
  Huawei: [
    { code: "Alarm ID 2001 (High Grid Voltage)", name: "Grid Overvoltage", severity: "HIGH", meaning: "Ցանցի լարումը գերազանցում է սահմանված շեմը:", causes: "Ցանցի տատանումներ, տրանսֆորմատորի բարձր լարում:", fix: "Grid code կարգավորում կամ ստաբիլիզացիոն լուծումներ:" },
    { code: "Alarm ID 2062 (Low Insulation Resistance)", name: "Insulation Resistance Low", severity: "CRITICAL", meaning: "DC կողմի իզոլյացիայի անկում:", causes: "Մալուխների վնասվածք, խոնավություն:", fix: "DC հատվածի ստուգում և մեկուսացում:" }
  ],
  Deye: [
    { code: "F13 / Grid Mode Fault", name: "Grid Mode Fault", severity: "HIGH", meaning: "Ցանցի պարամետրերի անհամապատասխանություն (լարում կամ հաճախականություն):", causes: "Ցանցի անկայունություն:", fix: "Grid setup-ի ստուգում և կարգավորում:" },
    { code: "F18 / AC OverCurrent", name: "Inverter Hardware Overcurrent", severity: "CRITICAL", meaning: "AC կողմի գերհոսանք:", causes: "Կարճ միացում կամ հզորության կտրուկ թռիչք:", fix: "Էլեկտրական վահանակի ստուգում և բեռնվածության վերլուծություն:" }
  ],
  Other: [
    { code: "General Inverter Fault", name: "Ընդհանուր վթարային ռեժիմ", severity: "WARNING", meaning: "Ինվերտորը գտնվում է սպասման կամ վթարային ռեժիմում:", causes: "Ցանց, պանելներ, գերտաքացում կամ ներքին խնդիր:", fix: "Տեղում ինժեներական ախտորոշում:" }
  ]
};

const lookupBrand = document.getElementById('lookupBrand');
const lookupCommonCodes = document.getElementById('lookupCommonCodes');
const btnDiagnoseError = document.getElementById('btnDiagnoseError');
const errorResultPanel = document.getElementById('errorResultPanel');

const errResTitle = document.getElementById('errResTitle');
const errResSeverity = document.getElementById('errResSeverity');
const errResMeaning = document.getElementById('errResMeaning');
const errResCauses = document.getElementById('errResCauses');
const errResFix = document.getElementById('errResFix');
const btnCallForError = document.getElementById('btnCallForError');

function updateCodeDropdown() {
  if (!lookupBrand || !lookupCommonCodes) return;
  const brand = lookupBrand.value;
  const list = errorDatabase[brand] || errorDatabase['Other'];
  lookupCommonCodes.innerHTML = list.map((item, idx) => `
    <option value="${idx}">${item.code} — ${item.name}</option>
  `).join('');
}

if (lookupBrand) {
  lookupBrand.addEventListener('change', updateCodeDropdown);
  updateCodeDropdown();
}

let currentDiagnosedError = null;

if (btnDiagnoseError) {
  btnDiagnoseError.addEventListener('click', () => {
    const brand = lookupBrand.value;
    const list = errorDatabase[brand] || errorDatabase['Other'];
    const idx = parseInt(lookupCommonCodes.value, 10) || 0;
    const err = list[idx];
    currentDiagnosedError = { brand, ...err };

    errResTitle.textContent = `${brand}: ${err.code} (${err.name})`;
    errResSeverity.textContent = err.severity;
    errResSeverity.style.background = err.severity.includes('CRITICAL') ? '#ef4444' : '#f59e0b';
    errResSeverity.style.color = '#fff';

    errResMeaning.textContent = err.meaning;
    errResCauses.textContent = err.causes;
    errResFix.textContent = err.fix;

    errorResultPanel.style.display = 'block';
  });
}

if (btnCallForError) {
  btnCallForError.addEventListener('click', () => {
    const checkSection = document.getElementById('check');
    if (checkSection) checkSection.scrollIntoView({ behavior: 'smooth' });

    const plantProblemSelect = document.getElementById('plantProblemSelect');
    const plantInverterSelect = document.getElementById('plantInverterSelect');

    if (plantInverterSelect && currentDiagnosedError) {
      plantInverterSelect.value = currentDiagnosedError.brand;
    }
    if (plantProblemSelect && currentDiagnosedError) {
      plantProblemSelect.value = 'Inverter error';
    }
  });
}

// --- 7. Knowledge Base Detailed Articles Logic ---
const kbArticles = {
  inverters: {
    category: "INVERTER ENGINEERING",
    title: "Ինչպես հասկանալ Inverter Alarm-ները և վթարային ռեժիմները",
    content: `
      <p>Ինվերտորը արևային կայանի «ուղեղն» է։ Ժամանակակից ցանցային ինվերտորները (Solis, Growatt, Huawei, Deye) ունեն ինքնապաշտպանության խիստ ալգորիթմներ։ Երբ սարքը անջատվում է, պատճառը 90% դեպքերում ոչ թե ինվերտորի խափանումն է, այլ արտաքին գործոնները՝</p>
      <ul>
        <li><b>Grid Voltage Faults (Ցանցի գերլարում/անկում)՝</b> Ինվերտորը անջատվում է, երբ ցանցի լարումը գերազանցում է նորման։ Օրինակ՝ ամռան կեսօրին տեղական ենթակայանի գերբեռնվածության պատճառով լարումը հասնում է 255-265V:</li>
        <li><b>Isolation Resistance Low (Իզոլյացիայի անկում)՝</b> Հաճախ առաջանում է անձրևից հետո։ Եթե տանիքում MC4 կոնեկտորը ճիշտ սեղմված (crimped) չէ կամ մալուխը քսվում է մետաղական կոնստրուկցիային, խոնավությունն անցնում է և դիմադրությունը նվազում է 100 kΩ-ից ցածր։</li>
        <li><b>Over-Temperature (Գերտաքացում)՝</b> Ինվերտորի հետնամասի հովացման ռադիատորները փոշոտվում են կամ սարքը տեղադրված է արևի ուղիղ ճառագայթների տակ առանց հովանոցի։ +55°C-ից բարձր դեպքում ինվերտորը սկսում է «derating» (արհեստականորեն իջեցնել հզորությունը)։</li>
      </ul>
      <p><b>Ինժեներական խորհուրդ.</b> Երբեք մի անտեսեք պարբերական alarm-ները։ Անընդհատ անջատվող և միացող ինվերտորի ուժային կոնդենսատորներն ու ռելեները մաշվում են 3 անգամ ավելի արագ։</p>
    `
  },
  pvdesign: {
    category: "PV STRING SIZING",
    title: "Voc / Vmp և String-երի ճիշտ ինժեներական հաշվարկ",
    content: `
      <p>Արևային համակարգերի նախագծման ամենատարածված սխալը ձմռան ցրտին պանելների պարապ ընթացքի լարման (Voc) բարձրացումը հաշվի չառնելն է։</p>
      <ul>
        <li><b>Max DC Voltage Limit՝</b> Եթե ինվերտորի առավելագույն մուտքային շեմը 1000V է, իսկ string-ի հաշվարկը արվել է միայն սենյակային (+25°C) ջերմաստիճանով, ձմռան սառնամանիքին Voc-ը կարող է հատել 1050V-ը՝ անդառնալիորեն այրելով ինվերտորի մուտքային MPPT տախտակը։</li>
        <li><b>MPPT Voltage Range՝</b> Ամռան պիկ շոգին էլ լարումը չպետք է իջնի ինվերտորի MPPT-ի նվազագույն աշխատանքային շեմից, այլապես արտադրողականությունը կտրուկ կընկնի։</li>
      </ul>
    `
  },
  grid: {
    category: "HOUSE & GRID VOLTAGE",
    title: "Ինչու է տան լարումը տատանվում և ինչպես պաշտպանել առանձնատունը",
    content: `
      <p>Սեփական տներում լարման խնդիրները լինում են երկու հիմնական տեսակի՝</p>
      <ul>
        <li><b>Ցածր լարում (160V – 190V)՝</b> Հատկապես ձմռանը կամ երեկոյան ժամերին, երբ ողջ գյուղը կամ թաղամասը միացնում է ջեռուցիչներ և բեռներ։ Ցածր լարումից այրվում են սառնարանների և օդորակիչների կոմպրեսորները, ջրի պոմպերը և գազի կաթսաների էլեկտրոնային պլատաները։</li>
        <li><b>Բարձր լարում (250V – 275V)՝</b> Ցերեկային ժամերին, երբ արևային կայանները մեծ հոսանք են մղում ցանց։ Բարձր լարումից ինվերտորներն անջատվում են, իսկ տան լուսավորությունն ու տեխնիկան շարքից դուրս են գալիս։</li>
      </ul>
      <p><b>Լուծումը՝</b> Տան գլխավոր մուտքի վրա տեղադրվում է համապատասխան հզորության ավտոմատ լարման ստաբիլիզատոր (1 ֆազ կամ 3 ֆազ), որը մուտքային 140V-280V տատանումները վերածում է ֆիքսված, մաքուր 220V/380V-ի։</p>
    `
  },
  battery: {
    category: "ENERGY STORAGE SYSTEMS",
    title: "Hybrid համակարգերի և մարտկոցների ինժեներական հիմունքները",
    content: `
      <p>Հիբրիդային կայանները (On-Grid + Battery Storage) ապահովում են լիարժեք էներգետիկ անկախություն ցանցի հաճախակի հոսանքազրկումների դեպքում։</p>
      <ul>
        <li><b>LiFePO4 տեխնոլոգիա՝</b> 6000+ ցիկլ, խորը պարպում (մինչև 90% DOD) և անվտանգություն։</li>
        <li><b>UPS Անցում (10-20 ms)՝</b> Լույսերը չեն թարթում, համակարգիչները և կաթսաները չեն անջատվում։</li>
      </ul>
    `
  }
};

const kbModal = document.getElementById('kbModal');
const btnCloseKb = document.getElementById('btnCloseKb');
const kbCategory = document.getElementById('kbCategory');
const kbTitle = document.getElementById('kbTitle');
const kbBody = document.getElementById('kbBody');
const btnKbCheckAction = document.getElementById('btnKbCheckAction');

document.querySelectorAll('.kb-card').forEach(card => {
  card.addEventListener('click', () => {
    const topicKey = card.getAttribute('data-topic');
    const article = kbArticles[topicKey];
    if (!article) return;

    if (kbCategory) kbCategory.textContent = article.category;
    if (kbTitle) kbTitle.textContent = article.title;
    if (kbBody) kbBody.innerHTML = article.content;

    if (kbModal) kbModal.style.display = 'flex';
  });
});

if (btnCloseKb && kbModal) {
  btnCloseKb.addEventListener('click', () => {
    kbModal.style.display = 'none';
  });
}

if (btnKbCheckAction && kbModal) {
  btnKbCheckAction.addEventListener('click', () => {
    kbModal.style.display = 'none';
  });
}

// --- 8. Client Portal Modal & Dashboard Logic ---
const portalModal = document.getElementById('portalModal');
const btnOpenPortal = document.getElementById('btnOpenPortal');
const mobileBtnOpenPortal = document.getElementById('mobileBtnOpenPortal');
const btnPreviewOpenPortal = document.getElementById('btnPreviewOpenPortal');
const btnClosePortal = document.getElementById('btnClosePortal');

const portalLoginArea = document.getElementById('portalLoginArea');
const portalUserDashboard = document.getElementById('portalUserDashboard');
const portalDemoDashboard = document.getElementById('portalDemoDashboard');

const portalAuthForm = document.getElementById('portalAuthForm');
const portalPhoneInput = document.getElementById('portalPhoneInput');
const portalAuthMessage = document.getElementById('portalAuthMessage');

const btnOpenDemoDashboard = document.getElementById('btnOpenDemoDashboard');
const btnBackToLogin = document.getElementById('btnBackToLogin');
const btnPortalLogout = document.getElementById('btnPortalLogout');

const dashCustomerTitle = document.getElementById('dashCustomerTitle');
const dashCustomerPhone = document.getElementById('dashCustomerPhone');
const dashRequestsContainer = document.getElementById('dashRequestsContainer');

function showPortalModal() {
  if (!portalModal) return;
  portalModal.style.display = 'flex';
  portalLoginArea.style.display = 'block';
  portalUserDashboard.style.display = 'none';
  portalDemoDashboard.style.display = 'none';
  if (portalAuthMessage) portalAuthMessage.innerHTML = '';
}

if (btnOpenPortal) btnOpenPortal.addEventListener('click', showPortalModal);
if (mobileBtnOpenPortal) mobileBtnOpenPortal.addEventListener('click', showPortalModal);
if (btnPreviewOpenPortal) btnPreviewOpenPortal.addEventListener('click', showPortalModal);

if (btnClosePortal && portalModal) {
  btnClosePortal.addEventListener('click', () => {
    portalModal.style.display = 'none';
  });
}

if (btnOpenDemoDashboard) {
  btnOpenDemoDashboard.addEventListener('click', () => {
    portalLoginArea.style.display = 'none';
    portalDemoDashboard.style.display = 'block';
  });
}

if (btnBackToLogin) {
  btnBackToLogin.addEventListener('click', () => {
    portalDemoDashboard.style.display = 'none';
    portalLoginArea.style.display = 'block';
  });
}

if (btnPortalLogout) {
  btnPortalLogout.addEventListener('click', () => {
    portalUserDashboard.style.display = 'none';
    portalLoginArea.style.display = 'block';
  });
}

if (portalAuthForm) {
  portalAuthForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const phone = portalPhoneInput.value.trim();
    if (!phone) return;

    portalAuthMessage.innerHTML = '<span style="color:#38bdf8;">Ստուգվում է տվյալների բազայում...</span>';

    try {
      const res = await fetch('/api/client/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');

      if (!data.found) {
        portalAuthMessage.innerHTML = `
          <div style="background:#132e44; padding:10px; border-radius:6px; color:#f59e0b; border-left:4px solid #f59e0b;">
            ⚠️ Այս հեռախոսահամարով ակտիվ սպասարկում չի գտնվել։<br>
            <small style="color:#cbd5e1;">Կարող եք լրացնել հարցում կամ դիտել Demo Կաբինետը։</small>
          </div>
        `;
        return;
      }

      dashCustomerTitle.textContent = 'Ձեր Պատվերները և Կայանները';
      dashCustomerPhone.textContent = `Հեռախոս՝ ${phone}`;

      let html = '';
      if (data.requests && data.requests.length > 0) {
        html += '<h4 style="color:#4ade80; margin:10px 0 6px 0; font-size:13px;">Սպասարկման Հայտեր (Service Requests)</h4>';
        html += data.requests.map(r => {
          let badgeClass = 'portal-badge-new';
          if (r.status === 'IN_PROGRESS') badgeClass = 'portal-badge-in-progress';
          if (r.status === 'DONE') badgeClass = 'portal-badge-done';

          return `
            <div style="background:#0a1926; border:1px solid #1a3f5c; padding:10px; border-radius:6px; margin-bottom:8px; font-size:12px;">
              <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <b>#${r.id} — ${r.problem_type || 'Սպասարկում'}</b>
                <span class="${badgeClass}">${r.status}</span>
              </div>
              <div style="color:#8fa0b5;">${r.description || ''}</div>
              ${r.notes ? `<div style="margin-top:6px; color:#38bdf8; background:#132e44; padding:5px 8px; border-radius:4px;"><b>Ինժեների նշում:</b> ${r.notes}</div>` : ''}
            </div>
          `;
        }).join('');
      }

      if (data.checks && data.checks.length > 0) {
        html += '<h4 style="color:#38bdf8; margin:12px 0 6px 0; font-size:13px;">Կայանի Տվյալներ (Plant Checks)</h4>';
        html += data.checks.map(c => `
          <div style="background:#0a1926; border:1px solid #1a3f5c; padding:8px 12px; border-radius:6px; margin-bottom:6px; font-size:12px; display:flex; justify-content:space-between;">
            <span>⚡ ${c.power_kw} կՎտ • Ինվերտոր՝ ${c.inverter}</span>
            <span style="color:#8fa0b5;">${c.created_at ? c.created_at.slice(0,10) : ''}</span>
          </div>
        `).join('');
      }

      dashRequestsContainer.innerHTML = html;
      portalLoginArea.style.display = 'none';
      portalUserDashboard.style.display = 'block';

    } catch (err) {
      portalAuthMessage.innerHTML = `<span style="color:#ef4444;">Սխալ՝ ${err.message}</span>`;
    }
  });
}

window.addEventListener('click', (e) => {
  if (e.target === demoModal) demoModal.style.display = 'none';
  if (e.target === pkgModal) pkgModal.style.display = 'none';
  if (e.target === kbModal) kbModal.style.display = 'none';
  if (e.target === portalModal) portalModal.style.display = 'none';
});