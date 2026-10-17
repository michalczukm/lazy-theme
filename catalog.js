// Documentation behavior only; applications own their state and persistence.
const requestedTheme = new URLSearchParams(location.search).get('theme');
document.documentElement.dataset.lazyTheme = requestedTheme === 'dark' ? 'dark' : 'light';

document.addEventListener('DOMContentLoaded', () => {
  const themeSwitch = document.getElementById('theme-switch');
  const palette = document.getElementById('palette');
  const roles = [
    ['bg', 'Background'], ['surface', 'Surface'], ['ink', 'Ink'],
    ['muted', 'Muted'], ['accent', 'Accent'], ['on-accent', 'On accent'],
    ['soft', 'Soft'], ['line', 'Divider'], ['pressed', 'Pressed'],
    ['focus', 'Focus'], ['error', 'Error'],
  ];

  function showTheme() {
    const dark = document.documentElement.dataset.lazyTheme === 'dark';
    themeSwitch.value = dark ? 'dark' : 'light';
    document.getElementById('theme-description').textContent = dark
      ? 'Charcoal green. Warm gold. A dark proposal inspired by the kitchen dashboard.'
      : 'Warm paper. Green ink. The original shared baseline.';
    const styles = getComputedStyle(document.documentElement);
    palette.replaceChildren(...roles.map(([token, label]) => {
      const item = document.createElement('div');
      const name = document.createElement('dt');
      const swatch = document.createElement('span');
      swatch.className = 'catalog-swatch';
      swatch.setAttribute('aria-hidden', 'true');
      swatch.style.background = `var(--lazy-color-${token})`;
      name.append(swatch, label);
      const value = document.createElement('dd');
      value.textContent = styles.getPropertyValue(`--lazy-color-${token}`).trim();
      item.append(name, value);
      return item;
    }));
  }

  themeSwitch.addEventListener('change', () => {
    document.documentElement.dataset.lazyTheme = themeSwitch.value;
    const url = new URL(location.href);
    url.searchParams.set('theme', themeSwitch.value);
    history.replaceState(null, '', url);
    showTheme();
  });
  showTheme();

  for (const button of document.querySelectorAll('[data-example-action]')) {
    button.addEventListener('click', () => {
      document.getElementById('action-status').textContent = button.dataset.exampleAction;
    });
  }
  const choices = document.getElementById('volume-choices');
  choices.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || !choices.contains(button)) return;
    for (const choice of choices.querySelectorAll('button')) {
      choice.setAttribute('aria-pressed', String(choice === button));
    }
  });

  const form = document.getElementById('example-form');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const amount = document.getElementById('example-amount');
    const valid = amount.validity.valid;
    amount.setAttribute('aria-invalid', String(!valid));
    document.getElementById('amount-error').hidden = valid;
    document.getElementById('form-status').textContent = valid
      ? `${amount.value} ml is valid. Nothing was saved.`
      : 'Check the amount above.';
    if (!valid) amount.focus();
  });
});
