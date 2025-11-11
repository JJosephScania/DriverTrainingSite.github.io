// Shared helpers
const $ = (q, ctx=document) => ctx.querySelector(q);
const yearEl = document.getElementById('year'); if (yearEl) yearEl.textContent = new Date().getFullYear();

// Index: gallery arrows
(function(){
  const gallery = document.querySelector('.mobile-gallery');
  if (!gallery) return;
  const list = gallery.querySelector('.list');
  const left = gallery.querySelector('.ctrl.left');
  const right = gallery.querySelector('.ctrl.right');
  function updateArrows(){
    if (!list) return;
    left.disabled = list.scrollLeft <= 4;
    right.disabled = list.scrollLeft + list.clientWidth >= list.scrollWidth - 4;
  }
  list?.addEventListener('scroll', updateArrows, { passive: true });
  updateArrows();
})();

// Book page: read ?service= and inject
(function(){
  const params = new URLSearchParams(location.search);
  const s = params.get('service');
  const title = $('#service-title');
  const hidden = $('#service');
  if (title && s){ title.textContent = s; }
  if (hidden && s){ hidden.value = s; }
})();

// Strict weekday-only selection (effectively untoggleable weekends)
function isWeekend(dateStr){
  if(!dateStr) return false;
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getUTCDay();
  return day === 0 || day === 6;
}
(function(){
  const date = $('#date');
  if (!date) return;
  // Prevent picking weekends: if chosen, clear and show error
  const err = document.querySelector('.error[data-for="date"]');
  function enforceWeekday(){
    if (isWeekend(date.value)){
      date.value = '';
      if (err) err.textContent = 'Weekends are unavailable. Please choose Mon–Fri.';
      // Optional visual nudge
      date.classList.add('shake');
      setTimeout(()=>date.classList.remove('shake'), 300);
    } else {
      if (err) err.textContent = '';
    }
  }
  date.addEventListener('change', enforceWeekday);
  date.addEventListener('input', enforceWeekday);
})();

// Lightweight validation + mock submit (book page)
(function(){
  const form = $('#appt-form');
  if (!form) return;
  const statusEl = form.querySelector('.submit-status');
  const setError = (id, msg='') => { const el = form.querySelector(`.error[data-for="${id}"]`); if (el) el.textContent = msg; };
  function validate(){
    let ok = true;
    ['firstName','lastName','email','service','date','time'].forEach(f=>setError(f,''));
    const email = $('#email').value.trim();
    if(!$('#firstName').value.trim()){ setError('firstName','First name is required'); ok=false; }
    if(!$('#lastName').value.trim()){ setError('lastName','Last name is required'); ok=false; }
    if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ setError('email','Enter a valid email'); ok=false; }
    if(!$('#service').value){ setError('service','Please choose a service (go back and select one)'); ok=false; }
    const d = $('#date').value;
    if(!d){ setError('date','Please choose a date'); ok=false; }
    if(d && isWeekend(d)){ setError('date','Weekends are unavailable. Choose Mon–Fri.'); ok=false; }
    if(!$('#time').value){ setError('time','Please select a time'); ok=false; }
    return ok;
  }
  form.addEventListener('submit', e => {
    e.preventDefault();
    if(!validate()){ statusEl.textContent = 'Please fix the errors above.'; return; }
    statusEl.textContent = 'Submitting...';
    setTimeout(()=>{ statusEl.textContent = 'Thank you! We will be in touch to confirm your appointment.'; form.reset(); }, 600);
  });
})();
