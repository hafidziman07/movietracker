import { getClient } from '../app.js';

const msg = document.getElementById('auth-msg');
let mode = 'login';

const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const regFields = document.getElementById('reg-fields');
const btnSubmit = document.getElementById('btn-submit');

tabLogin.addEventListener('click', () => setMode('login'));
tabRegister.addEventListener('click', () => setMode('register'));

function setMode(m) {
  mode = m;
  tabLogin.classList.toggle('active', m === 'login');
  tabRegister.classList.toggle('active', m === 'register');
  regFields.style.display = m === 'register' ? 'block' : 'none';
  btnSubmit.textContent = m === 'register' ? 'Daftar' : 'Masuk';
  msg.textContent = '';
}

document.getElementById('auth-form').addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const nama = document.getElementById('nama').value.trim();
  const sb = await getClient();
  btnSubmit.disabled = true;

  const { error } = mode === 'login'
    ? await sb.auth.signInWithPassword({ email, password })
    : await sb.auth.signUp({ email, password, options: { data: { nama } } });

  btnSubmit.disabled = false;
  if (error) {
    msg.textContent = error.message.includes('Invalid login credentials')
      ? 'Email atau password salah.' : error.message;
    return;
  }
  if (mode === 'register' && !sb.auth.session) {
    msg.textContent = 'Registrasi berhasil! Cek email untuk verifikasi jika diperlukan.';
    return;
  }
  location.href = 'dashboard.html';
});

// Sudah login? langsung ke dashboard
getClient().then(async sb => {
  const { data: { session } } = await sb.auth.getSession();
  if (session) location.href = 'dashboard.html';
});
