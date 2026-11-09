import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createJourney, advance, chooseAction, chooseRecording, restoreGame, exportJourney } from '../dist/engine.mjs';
function settle(state) { let guard = 0; while (state.screen === 'story' && guard++ < 50) state = advance(state); assert.ok(guard < 50); return state; }
function play(actions, recording = true, name = 'Yonas') {
  let s = settle(createJourney(name));
  for (const action of actions) { s = settle(chooseAction(s, action)); if (s.screen === 'record') s = settle(chooseRecording(s, recording)); }
  return s;
}
test('three training choices finish the route; recording earns exactly one point and four weeks end', () => {
  const s = play(['train', 'train', 'rest', 'train']);
  assert.equal(s.screen, 'end'); assert.equal(s.routeDone, true); assert.equal(s.actions.length, 4);
  assert.deepEqual(s.stats, { money: 45, stamina: 85, ability: 15, reputation: 1 });
  assert.equal(s.events.filter(e => e.type === 'record-and-post').length, 1);
});
test('declining posting closes the gate without changing training outcome', () => {
  const s = play(['train', 'train', 'train', 'train'], false);
  assert.equal(s.routeDone, true); assert.equal(s.recordAllowed, false); assert.equal(s.stats.reputation, 0);
  assert.equal(s.events.filter(e => e.type === 'record-and-post').length, 1);
});
test('no training means no recording scene or achievement', () => {
  const s = play(['rest', 'work', 'rest', 'work']);
  assert.equal(s.screen, 'end'); assert.equal(s.recordAsked, false); assert.equal(s.recordAllowed, null); assert.equal(s.routeDone, false);
  assert.equal(s.stats.ability, 0); assert.equal(s.stats.money, 115);
});
test('second training in final week still offers the mini event before the ending', () => {
  let s = settle(createJourney());
  for (const a of ['work', 'train', 'rest', 'train']) s = settle(chooseAction(s, a));
  assert.equal(s.screen, 'record'); assert.equal(s.week, 4);
  s = settle(chooseRecording(s, true)); assert.equal(s.screen, 'end'); assert.equal(s.routeDone, false);
});
test('reload mid-story or at recording resumes without duplicated rewards', () => {
  let s = settle(createJourney('Nadia'));
  s = settle(chooseAction(s, 'train')); s = settle(chooseAction(s, 'train'));
  s = restoreGame(JSON.stringify(s)); assert.equal(s.screen, 'record');
  s = chooseRecording(s, true); s = restoreGame(JSON.stringify(s)); s = settle(s);
  assert.equal(s.stats.reputation, 1); assert.equal(s.trainingCount, 2);
  assert.ok(s.history.some(l => l.speaker === 'Nadia'));
});
test('forced training uses reduced gain and clamps resources at zero', () => {
  for (const stats of [{ money: 5, stamina: 50 }, { money: 50, stamina: 5 }, { money: 0, stamina: 0 }]) {
    const s = settle(createJourney()); Object.assign(s.stats, stats);
    const r = chooseAction(s, 'train'); assert.equal(r.stats.ability, 1); assert.ok(r.stats.money >= 0); assert.ok(r.stats.stamina >= 0);
  }
});
test('working when exhausted pays nothing; rest caps stamina but money has no ceiling', () => {
  let s = settle(createJourney()); s.stats.stamina = 5; s.stats.money = 250;
  s = settle(chooseAction(s, 'work')); assert.equal(s.stats.money, 250); assert.equal(s.stats.stamina, 0);
  s.stats.stamina = 95; s = settle(chooseAction(s, 'rest')); assert.equal(s.stats.stamina, 100);
});
test('invalid saves are ignored, player names and export remain safe for display', () => {
  assert.equal(restoreGame('{broken'), null); assert.equal(restoreGame(JSON.stringify({ version: 1 })), null);
  const s = play(['train', 'work', 'rest', 'train'], true, '<Ada>');
  assert.equal(s.name, '<Ada>'); const report = exportJourney(s);
  assert.equal('stats' in report, false); assert.equal(report.choices.length, 5);
});
