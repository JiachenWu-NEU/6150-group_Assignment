document.addEventListener("DOMContentLoaded", () => {
  const form       = document.getElementById("registerForm");
  const firstName  = document.getElementById("firstName");
  const lastName   = document.getElementById("lastName");
  const email      = document.getElementById("email");
  const locationEl = document.getElementById("location");
  const password   = document.getElementById("password");
  const confirmPw  = document.getElementById("confirmPassword");
  const togglePwd  = document.getElementById("togglePassword");

  const strengthBar  = document.getElementById("passwordStrengthBar");
  const strengthText = document.getElementById("passwordStrengthText");

  document.querySelectorAll(".account-type-card").forEach(card => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".account-type-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      card.querySelector("input[type=radio]").checked = true;
    });
  });

  togglePwd.addEventListener("click", () => {
    const isPwd = password.type === "password";
    password.type = isPwd ? "text" : "password";
    togglePwd.innerHTML = `<i class="bi ${isPwd ? "bi-eye-slash" : "bi-eye"}"></i>`;
    password.focus();
  });

  function scorePassword(v) {
    const rules = [
      v.length >= 8,
      /[a-z]/.test(v),
      /[A-Z]/.test(v),
      /\d/.test(v),
      /[^A-Za-z0-9]/.test(v)
    ];
    return { ok: rules.every(Boolean), score: rules.filter(Boolean).length };
  }

  function setStrengthUI(score) {
    const percentMap = [10, 25, 50, 75, 100];
    const labelMap   = ["Very weak", "Weak", "Fair", "Good", "Strong"];
    const classMap   = ["bg-danger", "bg-danger", "bg-warning", "bg-info", "bg-success"];
    const idx = Math.max(0, score - 1);

    strengthBar.style.width = `${percentMap[idx]}%`;
    strengthBar.setAttribute("aria-valuenow", percentMap[idx]);
    strengthBar.classList.remove("bg-danger","bg-warning","bg-info","bg-success");
    strengthBar.classList.add(classMap[idx]);
    strengthText.textContent = labelMap[idx];
  }

  function setFieldValidity(input, valid, msgWhenInvalid = "") {
    if (valid) {
      input.setCustomValidity("");
      input.classList.remove("is-invalid");
      input.classList.add("is-valid");
    } else {
      input.setCustomValidity(msgWhenInvalid || "Invalid");
      input.classList.remove("is-valid");
      input.classList.add("is-invalid");
    }
  }

  function validateConfirm() {
    const match = confirmPw.value.length > 0 && confirmPw.value === password.value;
    setFieldValidity(confirmPw, match, "Passwords do not match");
  }

  function setInvalidMsg(input, msg) {
    const group = input.closest(".mb-3");
    const fb = group?.querySelector(".invalid-feedback");
    if (fb) fb.textContent = msg;
  }
  
  function scorePassword(v) {
    return {
      len: v.length >= 8,
      lower: /[a-z]/.test(v),
      upper: /[A-Z]/.test(v),
      digit: /\d/.test(v),
      special: /[^A-Za-z0-9]/.test(v)
    };
  }
  
  function setStrengthUI(score) {
    const strengthBar  = document.getElementById("passwordStrengthBar");
    const strengthText = document.getElementById("passwordStrengthText");
    const percentMap = [10, 25, 50, 75, 100];
    const labelMap   = ["Very weak", "Weak", "Fair", "Good", "Strong"];
    const classMap   = ["bg-danger", "bg-danger", "bg-warning", "bg-info", "bg-success"];
    const idx = Math.max(0, score - 1);
    strengthBar.style.width = `${percentMap[idx]}%`;
    strengthBar.setAttribute("aria-valuenow", percentMap[idx]);
    strengthBar.classList.remove("bg-danger","bg-warning","bg-info","bg-success");
    strengthBar.classList.add(classMap[idx]);
    strengthText.textContent = labelMap[idx];
  }
  
  function setFieldValidity(input, valid, msgWhenInvalid = "") {
    if (valid) {
      input.setCustomValidity("");
      input.classList.remove("is-invalid");
      input.classList.add("is-valid");
    } else {
      input.setCustomValidity(msgWhenInvalid || "Invalid");
      input.classList.remove("is-valid");
      input.classList.add("is-invalid");
    }
  }
  
  password.addEventListener("input", () => {
    const v = password.value;
    const r = scorePassword(v);
    const score = ["len","lower","upper","digit","special"].filter(k => r[k]).length;
  
    setStrengthUI(Math.max(1, score));
  
    let msg = "";
    if (!r.len) {
      msg = "Password must be at least 8 characters.";
    } else {
      const missing = [];
      if (!r.lower)   missing.push("a lowercase letter");
      if (!r.upper)   missing.push("an uppercase letter");
      if (!r.digit)   missing.push("a number");
      if (!r.special) missing.push("a special character");
      if (missing.length) {
        msg = "Include " + missing.join(", ").replace(/, ([^,]*)$/, ", and $1") + ".";
      }
    }
  
    const ok = r.len && r.lower && r.upper && r.digit && r.special;
  
    setFieldValidity(password, ok, msg || "Invalid password");
    setInvalidMsg(password, msg || "Invalid password");
  
    validateConfirm();
  });


  confirmPw.addEventListener("input", validateConfirm);

  function liveRequired(input, message) {
    input.addEventListener("input", () => {
      const ok = input.value.trim().length > 0 && (input.checkValidity?.() ?? true);
      setFieldValidity(input, ok, message);
    });
  }
  liveRequired(firstName, "Please enter your first name");
  liveRequired(lastName,  "Please enter your last name");
  liveRequired(email,     "Please enter a valid email");
  liveRequired(locationEl,"Please enter your location");

  setStrengthUI(1);
});
