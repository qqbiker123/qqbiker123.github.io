document.documentElement.classList.add('js-ready');

const header = document.querySelector('.site-header');
const brand = document.querySelector('.brand');
const menuButton = document.querySelector('.menu-toggle');
const menuButtonLabel = menuButton?.querySelector('.sr-only');
const nav = document.querySelector('.site-nav');
const navLinks = [...document.querySelectorAll('.site-nav a')];
const mobileContact = document.querySelector('.mobile-contact');
const contactSection = document.querySelector('#contact');
const mobileViewport = window.matchMedia('(max-width: 820px)');
const pageRegions = [document.querySelector('main'), document.querySelector('footer'), mobileContact].filter(Boolean);

const setMenuLabel = (isOpen) => {
  if (menuButtonLabel) menuButtonLabel.textContent = isOpen ? 'Закрыть меню' : 'Открыть меню';
};

const setPageInert = (isInert) => {
  pageRegions.forEach((region) => {
    region.inert = isInert;
  });
};

const closeMenu = ({ restoreFocus = false } = {}) => {
  if (!menuButton || !nav) return;
  nav.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
  setPageInert(false);
  setMenuLabel(false);
  if (restoreFocus) menuButton.focus();
};

const openMenu = () => {
  if (!menuButton || !nav || !mobileViewport.matches) return;
  nav.classList.add('is-open');
  menuButton.setAttribute('aria-expanded', 'true');
  document.body.classList.add('menu-open');
  setPageInert(true);
  setMenuLabel(true);
  navLinks[0]?.focus();
};

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  if (isOpen) closeMenu();
  else openMenu();
});

navLinks.forEach((link) => link.addEventListener('click', () => closeMenu()));
brand?.addEventListener('click', () => closeMenu());

document.addEventListener('keydown', (event) => {
  if (!nav?.classList.contains('is-open')) return;

  if (event.key === 'Escape') {
    event.preventDefault();
    closeMenu({ restoreFocus: true });
    return;
  }

  if (event.key !== 'Tab') return;
  const focusable = [menuButton, ...navLinks].filter((element) => element && !element.hidden);
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

mobileViewport.addEventListener('change', (event) => {
  if (!event.matches) closeMenu();
  scheduleScrollSync();
});

let contactInView = false;
let scrollFrame = 0;

const syncScrollUI = () => {
  scrollFrame = 0;
  header?.classList.toggle('is-scrolled', window.scrollY > 24);

  if (mobileContact) {
    const hidden = !mobileViewport.matches || contactInView || window.scrollY < 420;
    mobileContact.classList.toggle('is-hidden', hidden);
    mobileContact.setAttribute('aria-hidden', String(hidden));
    mobileContact.tabIndex = hidden ? -1 : 0;
  }
};

function scheduleScrollSync() {
  if (scrollFrame) return;
  scrollFrame = window.requestAnimationFrame(syncScrollUI);
}

window.addEventListener('scroll', scheduleScrollSync, { passive: true });

if (contactSection && 'IntersectionObserver' in window) {
  const contactObserver = new IntersectionObserver(([entry]) => {
    contactInView = entry.isIntersecting;
    scheduleScrollSync();
  }, { threshold: 0.1 });
  contactObserver.observe(contactSection);
}

scheduleScrollSync();

const revealElements = [...document.querySelectorAll('.reveal')];
revealElements.forEach((element, index) => {
  const delay = Math.min(index % 3, 2);
  if (delay) element.classList.add(`reveal-delay-${delay}`);
});

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px' });

  revealElements.forEach((element) => revealObserver.observe(element));

  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;

    navLinks.forEach((link) => {
      const isActive = link.hash === `#${visible.target.id}`;
      link.classList.toggle('is-active', isActive);
      if (isActive) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-30% 0px -60%', threshold: [0, 0.2, 0.6] });

  document.querySelectorAll('main section[id]').forEach((section) => sectionObserver.observe(section));
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'));
}

const caseData = {
  slotly: {
    number: '01',
    title: 'Slotly',
    subtitle: 'Онлайн-запись для частной студии',
    task: 'Сократить переписку с клиентами и исключить накладки в расписании.',
    solution: 'Каталог услуг, выбор специалиста и времени, кабинет администратора и автоматические напоминания.',
    result: 'Путь от выбора услуги до подтверждённой записи занимает меньше минуты.'
  },
  supply: {
    number: '02',
    title: 'Supply Desk',
    subtitle: 'Кабинет для оптовых заказов',
    task: 'Заменить заказы в таблицах и мессенджерах единым рабочим пространством.',
    solution: 'Персональные цены, быстрый повтор заказа, статусы поставки и экспорт документов.',
    result: 'Менеджер видит историю клиента, а покупатель оформляет типовой заказ без звонка.'
  },
  leadline: {
    number: '03',
    title: 'Leadline',
    subtitle: 'Бот для обработки заявок',
    task: 'Не терять обращения с сайта и быстро распределять их между менеджерами.',
    solution: 'Бот уточняет детали, создаёт сделку в CRM и отправляет ответственному уведомление.',
    result: 'Заявка попадает в работу сразу, а данные не приходится переносить вручную.'
  }
};

const dialog = document.querySelector('#case-dialog');
const dialogClose = dialog?.querySelector('.dialog-close');
const dialogNext = dialog?.querySelector('.dialog-next');
const dialogTitle = dialog?.querySelector('#case-title');
const projectOrder = Object.keys(caseData);
let activeCase = projectOrder[0];
let caseTrigger = null;

const renderCase = (key, { announce = false } = {}) => {
  const data = caseData[key];
  if (!data || !dialog) return;
  activeCase = key;
  dialog.querySelector('.dialog-index span').textContent = data.number;
  dialogTitle.textContent = data.title;
  dialog.querySelector('.dialog-lead').textContent = data.subtitle;
  dialog.querySelector('[data-case-task]').textContent = data.task;
  dialog.querySelector('[data-case-solution]').textContent = data.solution;
  dialog.querySelector('[data-case-result]').textContent = data.result;
  if (announce) dialogTitle.focus({ preventScroll: true });
};

if (dialog) {
  document.querySelectorAll('.project-card').forEach((card) => {
    const button = card.querySelector('.project-link');
    button?.addEventListener('click', () => {
      caseTrigger = button;
      renderCase(card.dataset.project);
      dialog.showModal();
    });
  });

  dialogClose?.addEventListener('click', () => dialog.close());
  dialogNext?.addEventListener('click', () => {
    const nextIndex = (projectOrder.indexOf(activeCase) + 1) % projectOrder.length;
    renderCase(projectOrder[nextIndex], { announce: true });
  });
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => caseTrigger?.focus());
}

const form = document.querySelector('#project-form');

if (form) {
  const formSuccess = form.querySelector('.form-success');
  const formSubmitButton = form.querySelector('button[type="submit"]');
  const requiredFields = [...form.querySelectorAll('[required]')];

  const validateField = (field) => {
    const invalid = !field.checkValidity();
    field.classList.toggle('is-invalid', invalid);
    field.setAttribute('aria-invalid', String(invalid));
    return !invalid;
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    let firstInvalid = null;

    requiredFields.forEach((field) => {
      if (!validateField(field) && !firstInvalid) firstInvalid = field;
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const contact = String(data.get('contact') || '').trim();
    const product = String(data.get('product') || '').trim();
    const task = String(data.get('message') || '').trim();
    const lines = [
      'Здравствуйте! Заявка с сайта qqbiker123.github.io',
      '',
      `Имя: ${name}`,
      contact ? `Дополнительный контакт: ${contact}` : '',
      `Проект: ${product}`,
      '',
      'Задача:',
      task
    ].filter(Boolean);
    const telegramUrl = new URL('https://t.me/yourmomismycardi0');
    telegramUrl.searchParams.set('text', lines.join('\n'));

    formSuccess?.classList.add('is-visible');
    formSubmitButton.disabled = true;
    formSubmitButton.setAttribute('aria-busy', 'true');
    window.requestAnimationFrame(() => window.location.assign(telegramUrl.href));
  });

  requiredFields.forEach((field) => {
    const clearError = () => {
      if (!field.checkValidity()) return;
      field.classList.remove('is-invalid');
      field.setAttribute('aria-invalid', 'false');
    };
    field.addEventListener('input', clearError);
    field.addEventListener('change', clearError);
  });

  form.noValidate = true;

  window.addEventListener('pageshow', () => {
    formSuccess?.classList.remove('is-visible');
    formSubmitButton.disabled = false;
    formSubmitButton.removeAttribute('aria-busy');
  });
}

const copyEmailButton = document.querySelector('[data-copy-email]');
copyEmailButton?.addEventListener('click', async () => {
  const email = copyEmailButton.dataset.copyEmail;
  let copied = false;

  try {
    await navigator.clipboard.writeText(email);
    copied = true;
  } catch {
    const helper = document.createElement('textarea');
    helper.className = 'sr-only';
    helper.value = email;
    helper.setAttribute('readonly', '');
    document.body.append(helper);
    helper.select();
    copied = document.execCommand('copy');
    helper.remove();
  }

  if (!copied) return;
  const originalLabel = copyEmailButton.textContent;
  copyEmailButton.textContent = 'Скопировано';
  window.setTimeout(() => {
    copyEmailButton.textContent = originalLabel;
  }, 1800);
});

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();
