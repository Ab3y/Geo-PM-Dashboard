/**
 * Automated screenshot capture for AbeOps documentation.
 * Uses Puppeteer to navigate each view and save PNGs.
 *
 * Usage:
 *   1. npm run dev          (start the dev server in another terminal)
 *   2. npm run screenshots  (run this script)
 *
 * Or with the preview server:
 *   1. npm run build && npm run preview
 *   2. npm run screenshots -- --port 4173
 */

import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = path.resolve(__dirname, 'docs', 'screenshots');

const BASE_URL = process.argv.includes('--port')
  ? `http://localhost:${process.argv[process.argv.indexOf('--port') + 1]}`
  : 'http://localhost:5173';

const VIEWPORT = { width: 1440, height: 900 };

const ROUTES = [
  { path: '/kanban', name: '01-kanban-board', waitFor: '[data-rfd-droppable-id]' },
  { path: '/backlog', name: '02-backlog-view', waitFor: 'table' },
  { path: '/sprint-planning', name: '03-sprint-planning', waitFor: 'text/Sprint' },
  { path: '/pmp', name: '04-pmp-dashboard', waitFor: 'text/Process Groups' },
  { path: '/dashboard', name: '05-geo-dashboard', waitFor: 'svg' },
];

const delay = ms => new Promise(r => setTimeout(r, ms));

async function capture() {
  console.log(`📸 Capturing screenshots from ${BASE_URL}...`);
  console.log(`   Output: ${SCREENSHOT_DIR}\n`);

  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: VIEWPORT,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Clear localStorage so we get fresh sample data
  await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluate(() => {
    localStorage.removeItem('abeops-data');
    localStorage.removeItem('abeops-persona-state');
  });

  // Capture each main route
  for (const route of ROUTES) {
    console.log(`  ✦ ${route.name} → ${route.path}`);
    await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle0', timeout: 30000 });
    await delay(1500); // let animations settle
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `${route.name}.png`),
      fullPage: false,
    });
  }

  // Capture persona selector dropdown
  console.log('  ✦ 06-persona-selector → opening dropdown');
  await page.goto(`${BASE_URL}/kanban`, { waitUntil: 'networkidle0' });
  await delay(800);
  // Click the persona button (last button-like element in the header)
  const personaBtn = await page.$('header button:last-of-type');
  if (personaBtn) {
    await personaBtn.click();
    await delay(600);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '06-persona-selector.png'),
      fullPage: false,
    });
  }

  // Capture different persona views
  const personas = [
    { index: 0, name: '07-persona-pm', label: 'Project Manager' },
    { index: 3, name: '08-persona-po', label: 'Product Owner' },
    { index: 2, name: '09-persona-dev', label: 'Team Member' },
    { index: 6, name: '10-persona-stakeholder', label: 'Stakeholder' },
  ];

  for (const p of personas) {
    console.log(`  ✦ ${p.name} → switching to ${p.label}`);
    // Open persona selector and pick
    await page.goto(`${BASE_URL}/kanban`, { waitUntil: 'networkidle0' });
    await delay(500);
    const btn = await page.$('header button:last-of-type');
    if (btn) {
      await btn.click();
      await delay(400);
      const items = await page.$$('[class*="persona"] button, [class*="dropdown"] button');
      if (items[p.index]) {
        await items[p.index].click();
        await delay(1000);
      }
    }
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `${p.name}.png`),
      fullPage: false,
    });
  }

  // Capture Scrum Poker (navigate to sprint planning and open poker)
  console.log('  ✦ 11-scrum-poker-setup → opening poker');
  await page.goto(`${BASE_URL}/sprint-planning`, { waitUntil: 'networkidle0' });
  await delay(1000);
  // Look for poker trigger button (dice icon)
  const pokerBtn = await page.$('[title*="poker" i], [title*="estimate" i], button:has(svg)');
  if (pokerBtn) {
    await pokerBtn.click();
    await delay(800);
  }
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '11-scrum-poker-setup.png'),
    fullPage: false,
  });

  // Capture data export menu
  console.log('  ✦ 12-data-export-menu → opening data menu');
  await page.goto(`${BASE_URL}/kanban`, { waitUntil: 'networkidle0' });
  await delay(500);
  const menuBtn = await page.$('header button[title="Data options"]');
  if (menuBtn) {
    await menuBtn.click();
    await delay(400);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '12-data-export-menu.png'),
      fullPage: false,
    });
  }

  // Capture Kanban with active filters
  console.log('  ✦ 13-filters-active → board with filters applied');
  await page.goto(`${BASE_URL}/kanban`, { waitUntil: 'networkidle0' });
  await delay(800);
  // Select a priority filter if dropdown exists
  const prioritySelect = await page.$('select');
  if (prioritySelect) {
    await prioritySelect.select('high');
    await delay(600);
  }
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '13-filters-active.png'),
    fullPage: false,
  });

  // Capture PMP matrix close-up by scrolling to it
  console.log('  ✦ 14-pmp-matrix → process-knowledge matrix');
  await page.goto(`${BASE_URL}/pmp`, { waitUntil: 'networkidle0' });
  await delay(1000);
  // Scroll to the matrix section
  await page.evaluate(() => {
    const matrix = document.querySelector('table');
    if (matrix) matrix.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await delay(500);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '14-pmp-matrix.png'),
    fullPage: false,
  });

  const totalScreenshots = ROUTES.length + personas.length + 5;
  await browser.close();
  console.log(`\n✅ Done! ${totalScreenshots} screenshots saved.`);
}

capture().catch(err => {
  console.error('❌ Screenshot capture failed:', err.message);
  process.exit(1);
});
