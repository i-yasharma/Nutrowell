let currentStep = 0;
const selections = { activity:[], instType:[], mealBreaks:[], dietType:[], cuisine:[], goal:[], allergies:[], dislikes:[], diseases:[] };

function goStep(n) {
  document.getElementById('step-'+currentStep).classList.remove('active');
  document.querySelectorAll('.step-tab').forEach((t,i)=>{
    t.classList.remove('active','done');
    if(i<n) t.classList.add('done');
    if(i===n) t.classList.add('active');
  });
  currentStep = n;
  document.getElementById('step-'+n).classList.add('active');
  if(n===4) buildSummary();
  window.scrollTo({top:0,behavior:'smooth'});
}

function initTags(containerId, key, multi=true, colorClass='') {
  const el = document.getElementById(containerId);
  if(!el) return;
  el.querySelectorAll('.tag').forEach(t=>{
    t.addEventListener('click',()=>{
      const v = t.dataset.val;
      if(!multi) {
        el.querySelectorAll('.tag').forEach(x=>x.classList.remove('selected'));
        selections[key]=[];
      }
      if(t.classList.contains('selected')){
        t.classList.remove('selected');
        selections[key]=selections[key].filter(x=>x!==v);
      } else {
        t.classList.add('selected');
        if(!selections[key].includes(v)) selections[key].push(v);
        if(v==='none') { el.querySelectorAll('.tag:not([data-val="none"])').forEach(x=>{x.classList.remove('selected');});selections[key]=['none']; }
        else { const noneTag=el.querySelector('[data-val="none"]'); if(noneTag){noneTag.classList.remove('selected');} selections[key]=selections[key].filter(x=>x!=='none'); }
      }
      if(key==='allergies') {
        const warn = document.getElementById('allergy-warn');
        if(warn) warn.style.display = (selections.allergies.length>0 && !selections.allergies.includes('none')) ? 'flex' : 'none';
      }
    });
  });
}

function initMealBreaks() {
  document.querySelectorAll('#meal-breaks .meal-time-card').forEach(c=>{
    c.addEventListener('click',()=>{
      const v = c.dataset.val;
      c.classList.toggle('selected');
      if(c.classList.contains('selected')) { if(!selections.mealBreaks.includes(v)) selections.mealBreaks.push(v); }
      else { selections.mealBreaks = selections.mealBreaks.filter(x=>x!==v); }
    });
  });
}

function buildSummary() {
  const fields = [
    ['Age', document.getElementById('age')?.value],
    ['Gender', document.getElementById('gender')?.value],
    ['Height/Weight', `${document.getElementById('height')?.value||'?'}cm / ${document.getElementById('weight')?.value||'?'}kg`],
    ['Activity', selections.activity.join(', ')||'—'],
    ['Institution', selections.instType.join(', ')||'—'],
    ['Class hours', `${document.getElementById('class-start')?.value||'?'} – ${document.getElementById('class-end')?.value||'?'}`],
    ['Travel', document.getElementById('travel')?.value||'—'],
    ['Budget', document.getElementById('budget')?.value ? `₹${document.getElementById('budget').value}/month` : '—'],
    ['Meals/day', selections.mealBreaks.length ? selections.mealBreaks.join(', ') : '—'],
    ['Sleep', `${document.getElementById('wakeup')?.value||'?'} – ${document.getElementById('bedtime')?.value||'?'}`],
    ['Diet type', selections.dietType.join(', ')||'—'],
    ['Cuisines', selections.cuisine.join(', ')||'—'],
    ['Goal', selections.goal.join(', ')||'—'],
    ['Water target', `${document.getElementById('water')?.value||2.5}L/day`],
    ['Allergies', selections.allergies.join(', ')||'—'],
    ['Dislikes', selections.dislikes.join(', ')||'—'],
    ['Conditions', selections.diseases.join(', ')||'—'],
  ];
  const html = fields.map(([k,v])=>`<div style="display:flex;gap:8px;padding:4px 0;border-bottom:0.5px solid var(--border)"><span style="min-width:110px;font-weight:500;color:var(--text-muted)">${k}</span><span style="color:var(--text)">${v||'—'}</span></div>`).join('');
  document.getElementById('summary-content').innerHTML = html;
}

document.getElementById('water').addEventListener('input', function(){ document.getElementById('water-val').textContent = this.value; });

initTags('activity','activity',false);
initTags('inst-type','instType',false);
initTags('diet-type','dietType',false);
initTags('cuisine','cuisine',true);
initTags('goal','goal',false);
initTags('allergies','allergies',true,'danger');
initTags('dislikes','dislikes',true);
initTags('diseases','diseases',true);
initMealBreaks();

async function generatePlan() {
  const btn = document.getElementById('gen-btn');
  btn.disabled = true; btn.textContent = '⌛ Generating…';
  document.getElementById('result-area').classList.add('active');
  document.getElementById('loading-card').style.display = 'block';
  document.getElementById('result-content').innerHTML = '';
  document.getElementById('result-area').scrollIntoView({behavior:'smooth'});

  const profile = {
    age: document.getElementById('age').value,
    gender: document.getElementById('gender').value,
    height: document.getElementById('height').value,
    weight: document.getElementById('weight').value,
    activity: selections.activity[0] || 'moderate',
    institution: selections.instType[0] || 'college',
    classHours: `${document.getElementById('class-start').value} to ${document.getElementById('class-end').value}`,
    travel: document.getElementById('travel').value,
    budget: document.getElementById('budget').value,
    mealBreaks: selections.mealBreaks,
    sleep: `${document.getElementById('wakeup').value} to ${document.getElementById('bedtime').value}`,
    dietType: selections.dietType[0] || 'vegetarian',
    cuisines: selections.cuisine,
    goal: selections.goal[0] || 'maintain',
    water: document.getElementById('water').value,
    allergies: selections.allergies,
    dislikes: selections.dislikes,
    diseases: selections.diseases,
    extraNotes: document.getElementById('extra-notes').value,
    dislikeCustom: document.getElementById('dislike-custom').value,
  };

  const prompt = `You are an expert Indian student nutritionist and meal planner. Create a highly personalised, practical, and affordable 7-day meal plan for this student.

STUDENT PROFILE:
- Age: ${profile.age} | Gender: ${profile.gender} | Height: ${profile.height}cm | Weight: ${profile.weight}kg
- Activity level: ${profile.activity}
- Institution: ${profile.institution} | Class hours: ${profile.classHours}
- Travel time one way: ${profile.travel}
- Monthly food budget: ₹${profile.budget}
- Meal breaks available: ${profile.mealBreaks.join(', ')}
- Sleep: ${profile.sleep}
- Diet type: ${profile.dietType}
- Cuisine preferences: ${profile.cuisines.join(', ')||'mixed Indian'}
- Primary goal: ${profile.goal}
- Daily water target: ${profile.water}L
- Food allergies: ${profile.allergies.join(', ')||'none'}
- Food dislikes: ${profile.dislikes.join(', ')} ${profile.dislikeCustom}
- Health conditions: ${profile.diseases.join(', ')||'none'}
- Extra notes: ${profile.extraNotes || 'none'}

Respond ONLY with a JSON object (no markdown, no extra text) in this exact structure:
{
  "calories": 2100,
  "protein": 75,
  "carbs": 280,
  "fat": 65,
  "budgetBreakdown": {"daily": 67, "weekly": 467},
  "weekPlan": [
    {
      "day": "Monday",
      "meals": [
        {"type": "Breakfast", "name": "Poha with peanuts + chai", "calories": 320, "cost": 25},
        {"type": "Mid-morning", "name": "Banana + handful almonds", "calories": 180, "cost": 12},
        {"type": "Lunch", "name": "Dal chawal + sabzi + pickle", "calories": 580, "cost": 45},
        {"type": "Evening snack", "name": "Buttermilk + roasted chana", "calories": 160, "cost": 15},
        {"type": "Dinner", "name": "Roti + paneer bhurji + salad", "calories": 520, "cost": 50}
      ]
    }
  ],
  "tips": [
    "Buy fruits in bulk from your local sabzi mandi on weekends to save 30%",
    "Cook dal in large batches and refrigerate — it lasts 3 days",
    "Keep roasted chana and peanuts as your go-to pocket snacks"
  ],
  "hydrationSchedule": ["Wake up: 1 glass warm water", "Before each meal: 1 glass", "Post class: 1 glass with lemon"]
}

Make the meals realistic for an Indian student — affordable street food, canteen items, hostel-cookable meals. Use the preferred cuisines. Strictly avoid allergies/dislikes. Adjust for health conditions. Include all meal breaks the student has. Keep total within budget.`;

  try {
    const res = await fetch('/api/generate-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: prompt })
    });
    if (!res.ok) throw new Error('Failed to fetch from backend server.');
    const data = await res.json();
    const raw = data.content || '';
    const clean = raw.replace(/```json|```/g,'').trim();
    const plan = JSON.parse(clean);
    renderPlan(plan, profile);
  } catch(e) {
    document.getElementById('loading-card').style.display = 'none';
    document.getElementById('result-content').innerHTML = `<div class="card" style="color:var(--coral);font-size:13px;">⚠ Could not generate plan. Please check your inputs and try again.<br><small style="color:var(--text-muted)">${e.message}</small></div>`;
  }
  btn.disabled = false; btn.textContent = '✦ Regenerate Plan';
}

function renderPlan(plan, profile) {
  document.getElementById('loading-card').style.display = 'none';
  const days = plan.weekPlan || [];
  const tips = plan.tips || [];
  const hydration = plan.hydrationSchedule || [];
  const budget = plan.budgetBreakdown || {};
  const monthlyBudget = parseInt(profile.budget) || 3000;
  const estimatedMonthly = (budget.daily||0)*30;
  const pct = Math.min(100, Math.round((estimatedMonthly/monthlyBudget)*100));

  let html = `
  <div class="result-card">
    <h3><div class="icon">✦</div>Your personalised nutrition targets</h3>
    <div class="nutrient-grid">
      <div class="nutrient-box"><div class="nutrient-val">${plan.calories||'—'}</div><div class="nutrient-label">kcal / day</div></div>
      <div class="nutrient-box"><div class="nutrient-val">${plan.protein||'—'}g</div><div class="nutrient-label">Protein</div></div>
      <div class="nutrient-box"><div class="nutrient-val">${plan.carbs||'—'}g</div><div class="nutrient-label">Carbs</div></div>
      <div class="nutrient-box"><div class="nutrient-val">${plan.fat||'—'}g</div><div class="nutrient-label">Fat</div></div>
    </div>
  </div>

  <div class="result-card">
    <h3><div class="icon">₹</div>Budget overview</h3>
    <div class="budget-bar">
      <div class="budget-row"><span>Estimated spend: ₹${estimatedMonthly}/month</span><span>Budget: ₹${monthlyBudget}/month</span></div>
      <div class="budget-track"><div class="budget-fill" style="width:${pct}%; background: ${pct > 100 ? '#E24B4A' : 'linear-gradient(90deg, var(--teal) 0%, var(--neon) 100%)'}; box-shadow: 0 0 10px ${pct > 100 ? 'rgba(226, 75, 74, 0.4)' : 'rgba(204, 255, 0, 0.2)'};"></div></div>
    </div>
    <div style="font-size:12px;color:var(--text-muted);display:flex;justify-content:space-between">
      <span>~₹${budget.daily||'—'}/day</span>
      <span>~₹${budget.weekly||'—'}/week</span>
    </div>
  </div>

  <div class="result-card">
    <h3><div class="icon">☀</div>7-day meal plan</h3>`;

  days.slice(0,7).forEach(day=>{
    html += `<div class="meal-day"><div class="meal-day-header">${day.day}</div>`;
    (day.meals||[]).forEach(m=>{
      html += `<div class="meal-item"><div class="meal-type">${m.type}</div><div class="meal-name">${m.name}</div><div class="meal-cal">${m.calories} kcal · ₹${m.cost}</div></div>`;
    });
    html += `</div>`;
  });
  html += `</div>`;

  if(hydration.length) {
    html += `<div class="result-card"><h3><div class="icon">💧</div>Hydration schedule (${profile.water}L target)</h3>`;
    const glassCount = Math.round(parseFloat(profile.water)*4);
    html += `<div class="water-track">`;
    for(let i=0;i<glassCount;i++) html += `<div class="glass"><div class="fill" style="height:${60+Math.random()*20}%"></div></div>`;
    html += `</div><ul class="tips-list" style="margin-top:12px">`;
    hydration.forEach(h=> html+=`<li>${h}</li>`);
    html += `</ul></div>`;
  }


  if(tips.length) {
    html += `<div class="result-card"><h3><div class="icon">★</div>Smart tips for your lifestyle</h3><ul class="tips-list">`;
    tips.forEach(t=> html+=`<li>${t}</li>`);
    html += `</ul></div>`;
  }

  html += `<div style="text-align:center;padding:1rem 0;font-size:11px;color:var(--text-muted)">This plan is for general guidance only. Consult a nutritionist for medical dietary needs.</div>`;

  document.getElementById('result-content').innerHTML = html;
  document.getElementById('result-area').scrollIntoView({behavior:'smooth'});
}