document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const rememberMe = document.getElementById('rememberMe');

  const params = new URLSearchParams(window.location.search);
  const emailFromUrl = params.get('email');
  const remembered = localStorage.getItem('secondhand.lastEmail');
  if (emailFromUrl) {
    emailInput.value = emailFromUrl;
  } else if (remembered) {
    emailInput.value = remembered;
    rememberMe.checked = true;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    [emailInput, passwordInput].forEach(el => el.classList.remove('is-invalid','is-valid'));

    if (!email || !password) {
      if (!email) emailInput.classList.add('is-invalid');
      if (!password) passwordInput.classList.add('is-invalid');
      alert('Please enter both email and password.');
      form.classList.add('was-validated');
      return;
    }

    if (!emailInput.checkValidity()) {
      emailInput.classList.add('is-invalid');
      form.classList.add('was-validated');
      return;
    } else {
      emailInput.classList.add('is-valid');
    }

    let users = [];
    try {
      users = JSON.parse(localStorage.getItem('secondhand.users') || '[]');
    } catch (_) {
      users = [];
    }

    const target = users.find(u => (u.email || '').trim().toLowerCase() === email.toLowerCase());
    if (!target) {
      alert('User not found. Please register first.');
      return;
    }

    if (target.password !== password) {
      passwordInput.classList.add('is-invalid');
      alert('Incorrect password.');
      return;
    }

    if (rememberMe.checked) {
      localStorage.setItem('secondhand.lastEmail', email);
    } else {
      localStorage.removeItem('secondhand.lastEmail');
    }

    alert('Login successful! Redirecting to home page...');
    window.location.href = 'index.html';
  });
});
