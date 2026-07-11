document.documentElement.classList.add('js-ready');

const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
const navLinks = [...document.querySelectorAll('.site-nav a')];
const mobileContact = document.querySelector('.mobile-contact');
const contactSection = document.querySelector('#contact');

const closeMenu = ({ restoreFocus = false } = {}) => {
  nav.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
  if (restoreFocus) menuButton.focus();
};

menuButton.addEventListener('click', () => {
  const willOpen = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(willOpen));
  nav.classList.toggle('is-open', willOpen);
  document.body.classList.toggle('menu-open', willOpen);
  if (willOpen) navLinks[0]?.focus();
});

navLinks.forEach((link) => link.addEventListener('click', () => closeMenu()));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && nav.classList.contains('is-open')) closeMenu({ restoreFocus: true });
});

window.addEventListener('scroll', () => {
  header.classList.toggle('is-scrolled', window.scrollY > 24);
}, { passive: true });

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -30px' });

document.querySelectorAll('.reveal').forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 3, 2) * 70}ms`;
  revealObserver.observe(element);
});

const sectionObserver = new IntersectionObserver((entries) => {
  const visible = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  navLinks.forEach((link) => link.classList.toggle('is-active', link.hash === `#${visible.target.id}`));
}, { rootMargin: '-30% 0px -60%', threshold: [0, 0.2, 0.6] });

document.querySelectorAll('main section[id]').forEach((section) => sectionObserver.observe(section));

if (mobileContact && contactSection) {
  let contactInView = false;
  const syncMobileContact = () => {
    mobileContact.classList.toggle('is-hidden', contactInView || window.scrollY < 420);
  };
  const contactObserver = new IntersectionObserver(([entry]) => {
    contactInView = entry.isIntersecting;
    syncMobileContact();
  }, { threshold: 0.1 });
  contactObserver.observe(contactSection);
  window.addEventListener('scroll', syncMobileContact, { passive: true });
  syncMobileContact();
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
const dialogClose = dialog.querySelector('.dialog-close');
const dialogNext = dialog.querySelector('.dialog-next');
const projectOrder = Object.keys(caseData);
let activeCase = projectOrder[0];
let caseTrigger = null;

const renderCase = (key) => {
  const data = caseData[key];
  if (!data) return;
  activeCase = key;
  dialog.querySelector('.dialog-index span').textContent = data.number;
  dialog.querySelector('h2').textContent = data.title;
  dialog.querySelector('.dialog-lead').textContent = data.subtitle;
  dialog.querySelector('[data-case-task]').textContent = data.task;
  dialog.querySelector('[data-case-solution]').textContent = data.solution;
  dialog.querySelector('[data-case-result]').textContent = data.result;
};

document.querySelectorAll('.project-card').forEach((card) => {
  const button = card.querySelector('.project-link');
  button.addEventListener('click', () => {
    caseTrigger = button;
    renderCase(card.dataset.project);
    dialog.showModal();
  });
});

dialogClose.addEventListener('click', () => dialog.close());
dialogNext.addEventListener('click', () => {
  const nextIndex = (projectOrder.indexOf(activeCase) + 1) % projectOrder.length;
  renderCase(projectOrder[nextIndex]);
});
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});
dialog.addEventListener('close', () => caseTrigger?.focus());

const form = document.querySelector('#project-form');
const formSuccess = form.querySelector('.form-success');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const requiredFields = [...form.querySelectorAll('[required]')];
  let firstInvalid = null;

  requiredFields.forEach((field) => {
    const invalid = !field.value.trim();
    field.classList.toggle('is-invalid', invalid);
    field.setAttribute('aria-invalid', String(invalid));
    if (invalid && !firstInvalid) firstInvalid = field;
  });

  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }

  const data = new FormData(form);
  const subject = encodeURIComponent(`Новый проект: ${data.get('product')}`);
  const body = encodeURIComponent([
    `Имя: ${data.get('name')}`,
    `Контакт: ${data.get('contact')}`,
    `Продукт: ${data.get('product')}`,
    '',
    'Задача:',
    data.get('message')
  ].join('\n'));

  formSuccess.classList.add('is-visible');
  window.location.href = `mailto:aleksey-rusin96@mail.ru?subject=${subject}&body=${body}`;
});

form.querySelectorAll('[required]').forEach((field) => {
  field.addEventListener('input', () => {
    if (!field.value.trim()) return;
    field.classList.remove('is-invalid');
    field.setAttribute('aria-invalid', 'false');
  });
});

document.querySelector('#year').textContent = new Date().getFullYear();
