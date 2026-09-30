/**
 * 大澳灣文化工作團 (Taowan Cultural Working Group)
 * Main Interactive Module (huan-design-system engineering defense)
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileNav();
  initBackToTop();
  initLightbox();
  initTabs();
  initContactForm();
  initAdminAuth();
});

/* ---------------------------------------------------------
   1. Header Scroll Behavior (Hide on scroll down, Show on scroll up)
--------------------------------------------------------- */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let lastScrollY = window.scrollY;
  let ticking = false;

  const updateHeader = () => {
    const currentScrollY = window.scrollY;

    // Background style when scrolled
    if (currentScrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Hide when scrolling down, show when scrolling up
    if (currentScrollY > 140 && currentScrollY > lastScrollY) {
      header.classList.add('header-hidden');
    } else {
      header.classList.remove('header-hidden');
    }

    lastScrollY = Math.max(0, currentScrollY);
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });

  updateHeader();
}

/* ---------------------------------------------------------
   2. Mobile Navigation Drawer
--------------------------------------------------------- */
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const drawer = document.querySelector('.mobile-nav-drawer');
  if (!toggleBtn || !drawer) return;

  const toggleDrawer = (open) => {
    const isOpen = typeof open === 'boolean' ? open : !drawer.classList.contains('open');
    drawer.classList.toggle('open', isOpen);
    toggleBtn.classList.toggle('open', isOpen);
    toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  toggleBtn.addEventListener('click', () => toggleDrawer());

  // Close when clicking links
  drawer.querySelectorAll('.nav-link, .nav-cta-btn').forEach(link => {
    link.addEventListener('click', () => toggleDrawer(false));
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (drawer.classList.contains('open') && !drawer.contains(e.target) && !toggleBtn.contains(e.target)) {
      toggleDrawer(false);
    }
  });

  // Close on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      toggleDrawer(false);
    }
  });
}

/* ---------------------------------------------------------
   3. Back to Top Button
--------------------------------------------------------- */
function initBackToTop() {
  let btn = document.querySelector('.back-to-top-btn');
  if (!btn) {
    btn = document.createElement('button');
    btn.className = 'back-to-top-btn';
    btn.setAttribute('aria-label', '回到頂端');
    btn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    `;
    document.body.appendChild(btn);
  }

  window.addEventListener('scroll', () => {
    if (window.scrollY > 350) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------------------------------------------------------
   4. Image Lightbox Viewer
--------------------------------------------------------- */
let currentLightboxImages = [];
let currentLightboxIndex = 0;

function initLightbox() {
  let modal = document.querySelector('.lightbox-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'lightbox-modal';
    modal.innerHTML = `
      <div class="lightbox-content">
        <button class="lightbox-close" aria-label="關閉">&times;</button>
        <button class="lightbox-prev" aria-label="上一張">&#10094;</button>
        <img class="lightbox-img" src="" alt="照片放大預覽" />
        <div class="lightbox-caption"></div>
        <button class="lightbox-next" aria-label="下一張">&#10095;</button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const imgEl = modal.querySelector('.lightbox-img');
  const captionEl = modal.querySelector('.lightbox-caption');
  const closeBtn = modal.querySelector('.lightbox-close');
  const prevBtn = modal.querySelector('.lightbox-prev');
  const nextBtn = modal.querySelector('.lightbox-next');

  function openLightbox(images, index = 0) {
    currentLightboxImages = images;
    currentLightboxIndex = index;
    updateLightbox();
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function updateLightbox() {
    if (!currentLightboxImages.length) return;
    const item = currentLightboxImages[currentLightboxIndex];
    imgEl.src = item.src;
    captionEl.textContent = item.caption || '';
    prevBtn.style.display = currentLightboxImages.length > 1 ? 'flex' : 'none';
    nextBtn.style.display = currentLightboxImages.length > 1 ? 'flex' : 'none';
  }

  function closeLightbox() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  function prevImage() {
    currentLightboxIndex = (currentLightboxIndex - 1 + currentLightboxImages.length) % currentLightboxImages.length;
    updateLightbox();
  }

  function nextImage() {
    currentLightboxIndex = (currentLightboxIndex + 1) % currentLightboxImages.length;
    updateLightbox();
  }

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', prevImage);
  nextBtn.addEventListener('click', nextImage);

  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('lightbox-content')) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
  });

  // Touch Swipe for Mobile
  let touchStartX = 0;
  let touchEndX = 0;

  modal.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  modal.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchStartX - touchEndX > 50) {
      nextImage();
    } else if (touchEndX - touchStartX > 50) {
      prevImage();
    }
  }, { passive: true });

  // Bind gallery triggers
  document.querySelectorAll('[data-lightbox]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const groupName = el.getAttribute('data-lightbox-group') || 'default';
      const groupElements = Array.from(document.querySelectorAll(`[data-lightbox][data-lightbox-group="${groupName}"]`));
      
      const images = groupElements.map(item => ({
        src: item.getAttribute('href') || item.getAttribute('data-src') || item.src,
        caption: item.getAttribute('data-caption') || item.getAttribute('title') || item.querySelector('img')?.alt || ''
      }));

      const clickedIndex = groupElements.indexOf(el);
      openLightbox(images, clickedIndex >= 0 ? clickedIndex : 0);
    });
  });

  window.openCustomLightbox = openLightbox;
}

/* ---------------------------------------------------------
   5. Tabs System with URL Hash Support
--------------------------------------------------------- */
function initTabs() {
  const switchTab = (targetId) => {
    document.querySelectorAll('.tabs-nav').forEach(nav => {
      const btn = nav.querySelector(`.tab-btn[data-tab="${targetId}"]`);
      if (btn) {
        nav.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const container = nav.closest('.tabs-container') || document;
        container.querySelectorAll('.tab-content').forEach(content => {
          if (content.id === targetId) {
            content.classList.add('active');
          } else {
            content.classList.remove('active');
          }
        });
      }
    });
  };

  document.querySelectorAll('.tabs-nav').forEach(nav => {
    const buttons = nav.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-tab');
        switchTab(targetId);
      });
    });
  });

  // Handle URL hash on load
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    if (hash === 'origin' || hash === 'tab-origin') switchTab('tab-origin');
    else if (hash === 'service' || hash === 'tab-service') switchTab('tab-service');
    else if (hash === 'spirit' || hash === 'tab-spirit') switchTab('tab-spirit');
    else if (hash === 'timeline' || hash === 'tab-timeline') switchTab('tab-timeline');
    else if (hash === 'articles' || hash === 'tab-articles') switchTab('tab-articles');
  }

  window.addEventListener('hashchange', () => {
    const h = window.location.hash.replace('#', '');
    if (h === 'origin' || h === 'tab-origin') switchTab('tab-origin');
    else if (h === 'service' || h === 'tab-service') switchTab('tab-service');
    else if (h === 'spirit' || h === 'tab-spirit') switchTab('tab-spirit');
    else if (h === 'timeline' || h === 'tab-timeline') switchTab('tab-timeline');
    else if (h === 'articles' || h === 'tab-articles') switchTab('tab-articles');
  });
}

/* ---------------------------------------------------------
   6. Contact Form Validation, LocalStorage Draft & Feedback
--------------------------------------------------------- */
function initContactForm() {
  const form = document.querySelector('#contactForm');
  if (!form) return;

  const DRAFT_KEY = 'taowan_contact_draft';

  // Restore draft if present
  try {
    const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}');
    if (draft.name && form.querySelector('[name="name"]')) form.querySelector('[name="name"]').value = draft.name;
    if (draft.email && form.querySelector('[name="email"]')) form.querySelector('[name="email"]').value = draft.email;
    if (draft.phone && form.querySelector('[name="phone"]')) form.querySelector('[name="phone"]').value = draft.phone;
    if (draft.subject && form.querySelector('[name="subject"]')) form.querySelector('[name="subject"]').value = draft.subject;
    if (draft.message && form.querySelector('[name="message"]')) form.querySelector('[name="message"]').value = draft.message;
  } catch (e) {}

  // Auto-save draft on input
  form.addEventListener('input', () => {
    const draft = {
      name: form.querySelector('[name="name"]')?.value || '',
      email: form.querySelector('[name="email"]')?.value || '',
      phone: form.querySelector('[name="phone"]')?.value || '',
      subject: form.querySelector('[name="subject"]')?.value || '',
      message: form.querySelector('[name="message"]')?.value || ''
    };
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (e) {}
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = (form.querySelector('[name="name"]')?.value || '').trim();
    const email = (form.querySelector('[name="email"]')?.value || '').trim();
    const phone = (form.querySelector('[name="phone"]')?.value || '').trim() || '未提供';
    const subject = (form.querySelector('[name="subject"]')?.value || '').trim() || '大澳灣網站線上留言';
    const message = (form.querySelector('[name="message"]')?.value || '').trim();

    if (!name || !email || !message) {
      alert('請填妥姓名、電子信箱與留言內容。');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '傳送中，請稍候...';

    try {
      const response = await fetch('https://formsubmit.co/ajax/wisrain@ms34.hinet.net', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          '姓名': name,
          '電子信箱': email,
          '聯絡電話': phone,
          '主旨': subject,
          '留言內容': message,
          _subject: `【大澳灣網站留言】${subject} - ${name}`,
          _template: 'table'
        })
      });

      if (response.ok) {
        alert(`謝謝您的留言，${name}！\n\n您的訊息已送達團隊信箱 (wisrain@ms34.hinet.net)，我們將盡快與您聯繫。`);
        form.reset();
        localStorage.removeItem(DRAFT_KEY);
      } else {
        throw new Error('伺服器回傳非 200 狀態');
      }
    } catch (err) {
      const mailtoUrl = `mailto:wisrain@ms34.hinet.net?subject=${encodeURIComponent('【大澳灣網站留言】' + subject)}&body=${encodeURIComponent(`姓名: ${name}\n電話: ${phone}\nEmail: ${email}\n\n留言內容:\n${message}`)}`;
      alert(`謝謝您的留言，${name}！\n\n系統將為您開啟郵件程式發送至 wisrain@ms34.hinet.net。`);
      window.location.href = mailtoUrl;
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

/* ---------------------------------------------------------
   7. Unified Low-Key Admin Auth Module (taowan2000 / TAW99986206!)
--------------------------------------------------------- */
function initAdminAuth() {
  const ADMIN_USER = 'taowan2000';
  const ADMIN_PASS = 'TAW99986206!';
  const AUTH_KEY = 'taowan_admin_logged_in';

  const checkState = () => {
    const isLoggedIn = localStorage.getItem(AUTH_KEY) === 'true';
    
    // Toggle admin bars
    document.querySelectorAll('.admin-bar, .editor-control-bar').forEach(el => {
      el.style.display = isLoggedIn ? 'flex' : 'none';
    });

    // Update footer link text
    const footerLink = document.querySelector('#footerAdminLink');
    if (footerLink) {
      footerLink.innerHTML = isLoggedIn 
        ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg> 管理員已登入 (點選登出)' 
        : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> 管理員專區';
    }
  };

  // Build Login Modal if not present
  let loginModal = document.querySelector('#loginModal');
  if (!loginModal) {
    loginModal = document.createElement('div');
    loginModal.id = 'loginModal';
    loginModal.className = 'article-modal';
    loginModal.innerHTML = `
      <div class="article-modal-dialog" style="max-width: 400px; padding: 32px;">
        <button id="closeLoginModalGlobal" class="modal-close-btn" aria-label="關閉">&times;</button>
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--color-rust-light); color: var(--color-rust); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px auto;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <h3 style="color: var(--color-ink); font-size: 1.35rem; font-weight: 600;">管理員登入</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">請輸入管理帳號與密碼以解鎖刊登功能</p>
        </div>
        <form id="globalAdminLoginForm">
          <div class="form-group">
            <label class="form-label" for="globalLoginUser">帳號</label>
            <input type="text" id="globalLoginUser" class="form-control" placeholder="請輸入帳號" required autocomplete="username" />
          </div>
          <div class="form-group">
            <label class="form-label" for="globalLoginPass">密碼</label>
            <input type="password" id="globalLoginPass" class="form-control" placeholder="請輸入密碼" required autocomplete="current-password" />
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 10px;">登入 &rarr;</button>
        </form>
      </div>
    `;
    document.body.appendChild(loginModal);
  }

  const closeBtn = loginModal.querySelector('.modal-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      loginModal.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) {
      loginModal.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  const form = loginModal.querySelector('#globalAdminLoginForm') || loginModal.querySelector('#adminLoginForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const u = (loginModal.querySelector('#globalLoginUser') || loginModal.querySelector('#loginUser')).value.trim();
      const p = (loginModal.querySelector('#globalLoginPass') || loginModal.querySelector('#loginPass')).value.trim();

      if (u === ADMIN_USER && p === ADMIN_PASS) {
        localStorage.setItem(AUTH_KEY, 'true');
        alert('登入成功，已解鎖刊登與管理功能。');
        loginModal.classList.remove('open');
        document.body.style.overflow = '';
        form.reset();
        checkState();
      } else {
        alert('帳號或密碼不正確，請重新輸入。');
      }
    });
  }

  // Footer Link Trigger
  const footerLink = document.querySelector('#footerAdminLink');
  if (footerLink) {
    footerLink.addEventListener('click', (e) => {
      e.preventDefault();
      const isLoggedIn = localStorage.getItem(AUTH_KEY) === 'true';
      if (isLoggedIn) {
        if (confirm('確定要登出管理員身分？')) {
          localStorage.removeItem(AUTH_KEY);
          alert('已順利登出。');
          checkState();
        }
      } else {
        loginModal.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });
  }

  // Logout Buttons across pages
  document.querySelectorAll('#adminLogoutBtn, #editorLogoutBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('確定要登出管理員身分？')) {
        localStorage.removeItem(AUTH_KEY);
        alert('已順利登出。');
        checkState();
      }
    });
  });

  // Shortcut key: Ctrl + Shift + A
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      const isLoggedIn = localStorage.getItem(AUTH_KEY) === 'true';
      if (!isLoggedIn) {
        loginModal.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    }
  });

  checkState();
}
