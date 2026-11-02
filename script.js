(() => {
  const STORAGE = {
    applications: 'ddrky_applications',
    users: 'ddrky_partner_users',
    session: 'ddrky_session',
    adminSession: 'ddrky_admin_session'
  };

  const ADMIN_EMAIL = 'admin@ddrky.com';
  const ADMIN_PASSWORD = 'DDRKY2026';

  const read = (key, fallback = []) => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (error) {
      return fallback;
    }
  };

  const write = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const getUserList = () => read(STORAGE.users, []);
  const saveUserList = (users) => write(STORAGE.users, users);

  const ensureDemoData = () => {
    const users = getUserList();
    if (!Array.isArray(users) || users.length === 0) {
      saveUserList([
        {
          id: 'demo-user-1',
          name: 'Demo',
          surname: 'Partner',
          email: 'demo@ddrky.com',
          password: 'demo1234',
          whatsapp: '70000000',
          city: 'Abidjan',
          motivation: 'Je souhaite soutenir la vision DDRKY.',
          statut: 'Approuvé',
          createdAt: new Date().toISOString()
        }
      ]);
    }
  };

  const getSessionUser = () => read(STORAGE.session, null);
  const setSessionUser = (user) => write(STORAGE.session, user);
  const clearSessionUser = () => localStorage.removeItem(STORAGE.session);
  const getAdminSession = () => read(STORAGE.adminSession, null);
  const setAdminSession = (admin) => write(STORAGE.adminSession, admin);
  const clearAdminSession = () => localStorage.removeItem(STORAGE.adminSession);

  const renderAdminDashboard = () => {
    const container = document.getElementById('candidaturesContainer');
    const totalField = document.getElementById('totalCandidatures');
    const waitingField = document.getElementById('candidaturesAttente');
    const approvedField = document.getElementById('partenairesApprouves');

    if (!container) return;

    const applications = read(STORAGE.applications, []);
    const total = applications.length;
    const waiting = applications.filter((app) => app.statut === 'En attente d\'approbation').length;
    const approved = applications.filter((app) => app.statut === 'Approuvé').length;

    if (totalField) totalField.textContent = total;
    if (waitingField) waitingField.textContent = waiting;
    if (approvedField) approvedField.textContent = approved;

    if (!total) {
      container.innerHTML = '<div class="empty-message">Aucune candidature pour le moment.</div>';
      return;
    }

    container.innerHTML = applications.map((application) => {
      const statusClass = application.statut === 'Approuvé'
        ? 'statut-approuve'
        : application.statut === 'Refusé'
          ? 'statut-refuse'
          : 'statut-attente';

      return `
        <article class="candidature-card" data-id="${application.id}">
          <div class="candidature-header">
            <h3>${application.nom || 'Candidature'} ${application.prenom || ''}</h3>
            <span class="statut ${statusClass}">${application.statut || 'En attente d\'approbation'}</span>
          </div>
          <div class="candidature-info">
            <p><strong>Email :</strong> ${application.email || '—'}</p>
            <p><strong>WhatsApp :</strong> ${application.whatsapp || '—'}</p>
            <p><strong>Ville :</strong> ${application.ville || '—'}</p>
          </div>
          <div class="candidature-motivation">
            ${application.motivation || 'Aucune motivation renseignée.'}
          </div>
          <div class="candidature-actions">
            <button class="approve-button" type="button" data-action="approve" data-id="${application.id}">Approuver</button>
            <button class="refuse-button" type="button" data-action="refuse" data-id="${application.id}">Refuser</button>
          </div>
        </article>
      `;
    }).join('');

    document.querySelectorAll('[data-action="approve"]').forEach((button) => {
      button.addEventListener('click', () => updateApplicationStatus(button.dataset.id, 'Approuvé'));
    });

    document.querySelectorAll('[data-action="refuse"]').forEach((button) => {
      button.addEventListener('click', () => updateApplicationStatus(button.dataset.id, 'Refusé'));
    });
  };

  const updateApplicationStatus = (id, newStatus) => {
    const apps = read(STORAGE.applications, []);
    const updated = apps.map((app) => app.id === id ? { ...app, statut: newStatus } : app);
    write(STORAGE.applications, updated);
    renderAdminDashboard();
  };

  const handlePartnerForm = () => {
    const form = document.getElementById('partnerForm');
    if (!form) return;

    const confirmation = document.getElementById('confirmationMessage');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const payload = {
        id: `app-${Date.now()}`,
        nom: document.getElementById('nom').value.trim(),
        prenom: document.getElementById('prenom').value.trim(),
        email: document.getElementById('email').value.trim(),
        whatsapp: document.getElementById('whatsapp').value.trim(),
        ville: document.getElementById('ville').value.trim(),
        motivation: document.getElementById('motivation').value.trim(),
        photo: document.getElementById('photo').value,
        statut: 'En attente d\'approbation',
        createdAt: new Date().toISOString()
      };

      if (!payload.nom || !payload.prenom || !payload.email || !payload.whatsapp || !payload.ville || !payload.motivation) {
        alert('Veuillez remplir tous les champs obligatoires.');
        return;
      }

      const apps = read(STORAGE.applications, []);
      apps.unshift(payload);
      write(STORAGE.applications, apps);

      form.style.display = 'none';
      if (confirmation) {
        confirmation.style.display = 'block';
      }
    });
  };

  const handleConnexionPage = () => {
    const form = document.getElementById('loginForm');
    if (!form) return;

    const message = document.getElementById('loginMessage');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = document.getElementById('email').value.trim().toLowerCase();
      const password = document.getElementById('password').value;
      ensureDemoData();

      const users = getUserList();
      const user = users.find((item) => item.email && item.email.toLowerCase() === email && item.password === password);

      if (!user) {
        if (message) {
          message.textContent = 'Identifiants incorrects. Vérifie ton email et ton mot de passe.';
          message.style.display = 'block';
        }
        return;
      }

      setSessionUser({ email: user.email, name: `${user.name} ${user.surname}` });
      window.location.href = 'espace-partenaire.html';
    });

    const toggleButton = document.getElementById('togglePassword');
    if (toggleButton) {
      toggleButton.addEventListener('click', () => {
        const input = document.getElementById('password');
        if (!input) return;
        const isHidden = input.type === 'password';
        input.type = isHidden ? 'text' : 'password';
        toggleButton.textContent = isHidden ? '🙈' : '👁️';
      });
    }

    const forgotLink = document.getElementById('forgotPasswordLink');
    if (forgotLink) {
      forgotLink.addEventListener('click', (event) => {
        event.preventDefault();
        const email = document.getElementById('email').value.trim();
        if (!email) {
          if (message) {
            message.textContent = 'Entre d\'abord l\'adresse e-mail utilisée pour ta candidature.';
            message.style.display = 'block';
          }
          return;
        }
        if (message) {
          message.textContent = 'Si cette adresse correspond à ton compte, un lien sécurisé peut être envoyé.';
          message.style.display = 'block';
        }
      });
    }
  };

  const handlePartnerSpace = () => {
    const authSection = document.getElementById('authSection');
    const partnerSpace = document.getElementById('partnerSpace');
    const logoutButton = document.getElementById('logoutButton');
    const signupPanel = document.getElementById('signupPanel');
    const loginPanel = document.getElementById('loginPanel');
    const otpPanel = document.getElementById('otpPanel');
    const message = document.getElementById('authMessage');
    const otpEmail = document.getElementById('otpEmail');
    if (!authSection || !partnerSpace) return;

    const showMessage = (text, type = 'error') => {
      if (!message) return;
      message.textContent = text;
      message.className = `auth-message ${type}`;
    };

    const showSpace = (user) => {
      authSection.hidden = true;
      partnerSpace.hidden = false;
      if (logoutButton) logoutButton.hidden = false;
      const partnerEmail = document.getElementById('partnerEmail');
      if (partnerEmail) partnerEmail.textContent = user.email || '';
    };

    const showAuth = () => {
      authSection.hidden = false;
      partnerSpace.hidden = true;
      if (logoutButton) logoutButton.hidden = true;
    };

    document.getElementById('showLoginButton')?.addEventListener('click', () => {
      signupPanel.hidden = true;
      loginPanel.hidden = false;
      showMessage('');
    });

    document.getElementById('showSignupButton')?.addEventListener('click', () => {
      loginPanel.hidden = true;
      signupPanel.hidden = false;
      showMessage('');
    });

    document.getElementById('signupForm')?.addEventListener('submit', (event) => {
      event.preventDefault();
      ensureDemoData();
      const email = document.getElementById('signupEmail').value.trim().toLowerCase();
      const password = document.getElementById('signupPassword').value;
      const nom = document.getElementById('nom').value.trim();
      const prenom = document.getElementById('prenom').value.trim();

      if (!email || !password || !nom || !prenom) {
        showMessage('Tous les champs sont obligatoires.');
        return;
      }

      const users = getUserList();
      if (users.some((user) => user.email && user.email.toLowerCase() === email)) {
        showMessage('Un compte existe déjà avec cette adresse e-mail.');
        return;
      }

      const user = { id: `tmp-${Date.now()}`, name: nom, surname: prenom, email, password, createdAt: new Date().toISOString() };
      users.unshift(user);
      saveUserList(users);
      setSessionUser({ email: user.email, name: `${user.name} ${user.surname}` });
      pendingEmail = email;
      if (otpEmail) otpEmail.textContent = email;
      otpPanel.hidden = false;
      signupPanel.hidden = true;
      showMessage('Code envoyé. Vérifie votre boîte e-mail pour la validation de compte.', 'success');
      showSpace(user);
    });

    let pendingEmail = '';
    document.getElementById('otpForm')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const token = document.getElementById('otpCode').value.trim();
      if (!pendingEmail || token.length < 6) {
        showMessage('Entrez le code à 6 chiffres reçu par email.');
        return;
      }
      showMessage('Adresse e-mail vérifiée.', 'success');
      const user = getSessionUser();
      if (user) showSpace(user);
    });

    document.getElementById('resendButton')?.addEventListener('click', () => {
      showMessage('Un nouveau code a été généré pour cette session de démonstration.', 'success');
    });

    document.getElementById('loginForm')?.addEventListener('submit', (event) => {
      event.preventDefault();
      ensureDemoData();
      const email = document.getElementById('loginEmail').value.trim().toLowerCase();
      const password = document.getElementById('loginPassword').value;
      const users = getUserList();
      const user = users.find((item) => item.email && item.email.toLowerCase() === email && item.password === password);
      if (!user) {
        showMessage('Identifiants invalides.');
        return;
      }
      setSessionUser({ email: user.email, name: `${user.name} ${user.surname}` });
      showSpace({ email: user.email, name: `${user.name} ${user.surname}` });
    });

    logoutButton?.addEventListener('click', (event) => {
      event.preventDefault();
      clearSessionUser();
      showAuth();
      if (loginPanel) loginPanel.hidden = false;
      if (signupPanel) signupPanel.hidden = true;
    });

    const sessionUser = getSessionUser();
    if (sessionUser) {
      showSpace(sessionUser);
    } else {
      showAuth();
    }
  };

  const handleAdminLoginPage = () => {
    const form = document.getElementById('adminLoginForm');
    if (!form) return;

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = document.getElementById('adminEmail').value.trim().toLowerCase();
      const password = document.getElementById('adminPassword').value;

      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        setAdminSession({ email, role: 'admin' });
        window.location.href = 'admin.html';
        return;
      }

      alert('Identifiants administrateur incorrects.');
    });

    const resetButton = document.getElementById('forgotPasswordButton');
    const resetBox = document.getElementById('resetPasswordBox');
    if (resetButton && resetBox) {
      resetButton.addEventListener('click', () => {
        resetBox.style.display = 'block';
      });
    }

    const resetForm = document.getElementById('resetPasswordForm');
    const resetMessage = document.getElementById('resetMessage');
    if (resetForm && resetMessage) {
      resetForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const email = document.getElementById('resetEmail').value.trim();
        if (!email) {
          resetMessage.textContent = 'Saisissez votre email admin.';
          return;
        }
        resetMessage.textContent = 'Lien de réinitialisation simulé. Vérifiez votre boîte mail.';
      });
    }
  };

  const handleAdminDashboard = () => {
    const adminLogout = document.getElementById('adminLogout');
    if (adminLogout) {
      adminLogout.addEventListener('click', (event) => {
        event.preventDefault();
        clearAdminSession();
        window.location.href = 'admin-connexion.html';
      });
    }

    const currentAdmin = getAdminSession();
    if (!currentAdmin && window.location.pathname.endsWith('/admin.html')) {
      window.location.href = 'admin-connexion.html';
      return;
    }

    renderAdminDashboard();
  };

  const handleCreatePasswordPage = () => {
    const form = document.getElementById('createPasswordForm');
    if (!form) return;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = document.getElementById('email').value.trim().toLowerCase();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const message = document.getElementById('passwordMessage');

      if (!email || !password || !confirmPassword) {
        if (message) {
          message.textContent = 'Remplissez tous les champs.';
          message.style.display = 'block';
        }
        return;
      }

      if (password !== confirmPassword) {
        if (message) {
          message.textContent = 'Les mots de passe ne correspondent pas.';
          message.style.display = 'block';
        }
        return;
      }

      ensureDemoData();
      const users = getUserList();
      const found = users.findIndex((item) => item.email && item.email.toLowerCase() === email);
      if (found >= 0) {
        users[found].password = password;
        saveUserList(users);
        if (message) {
          message.textContent = 'Mot de passe créé avec succès.';
          message.style.display = 'block';
          message.style.color = '#147a45';
        }
        setTimeout(() => {
          window.location.href = 'connexion.html';
        }, 800);
        return;
      }

      if (message) {
        message.textContent = 'Aucun compte ne correspond à cet e-mail.';
        message.style.display = 'block';
      }
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    handlePartnerForm();
    handleConnexionPage();
    handlePartnerSpace();
    handleAdminLoginPage();
    handleAdminDashboard();
    handleCreatePasswordPage();
  });
})();
