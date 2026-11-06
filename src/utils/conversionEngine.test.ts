import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyObjection,
  calculateConversionScore,
  formatBroadcastMessage,
  calculatePipelineStats,
  Lead,
  ChatMessage,
} from './conversionEngine';

const mockLead: Lead = {
  id: 'lead-1',
  name: 'Marco Bellini',
  handle: '@marcobellini_fit',
  platform: 'instagram',
  niche: 'Personal Fitness Coach',
  location: 'Milano',
  painPoint: 'Difficoltà a trovare clienti per percorsi premium',
  aiFitScore: 80,
  stage: 'discovered',
  potentialValue: 1200,
  bio: 'Aiuto imprenditori a tornare in forma in 90 giorni.',
};

test('classifyObjection correctly categorizes various prospect replies', () => {
  assert.equal(classifyObjection('Quanto costa il vostro servizio?'), 'PRICE');
  assert.equal(classifyObjection('Possiamo fissare una call per parlarne a voce?'), 'SCHEDULE_CALL');
  assert.equal(classifyObjection('Non mi interessa, grazie'), 'NOT_INTERESTED');
  assert.equal(classifyObjection('Ma sei un bot o una persona reale?'), 'SKEPTICISM_AI');
  assert.equal(classifyObjection('Abbiamo già un’agenzia che ci gestisce questo'), 'ALREADY_HAVE_PROVIDER');
  assert.equal(classifyObjection('Mandami qualche dettaglio in più'), 'SEND_INFO');
  assert.equal(classifyObjection('Sembra interessante, dimmi di più'), 'POSITIVE_INTEREST');
  assert.equal(classifyObjection('Ciao, da dove mi scrivi?'), 'GENERAL_QUESTION');
});

test('formatBroadcastMessage replaces template variables correctly', () => {
  const template = 'Ciao {{nome}}, ho visto il tuo profilo {{handle}} su {{piattaforma}}. Notavo che {{pain_point}}.';
  const formatted = formatBroadcastMessage(template, mockLead);
  assert.equal(
    formatted,
    'Ciao Marco Bellini, ho visto il tuo profilo @marcobellini_fit su instagram. Notavo che Difficoltà a trovare clienti per percorsi premium.'
  );
});

test('calculateConversionScore adjusts score based on messages and objections', () => {
  const emptyMsgs: ChatMessage[] = [];
  const baseScore = calculateConversionScore(mockLead, emptyMsgs);
  assert.ok(baseScore < 80, 'Score without messages should be discounted');

  const interestedMsgs: ChatMessage[] = [
    {
      id: 'm1',
      sender: 'bot',
      text: 'Ciao Marco!',
      timestamp: '10:00',
    },
    {
      id: 'm2',
      sender: 'prospect',
      text: 'Molto interessante, quando sei libero per fissare una call?',
      timestamp: '10:05',
    },
  ];
  const callScore = calculateConversionScore(mockLead, interestedMsgs);
  assert.ok(callScore >= 94, 'Ready to schedule call should produce high conversion score');

  const rejectedMsgs: ChatMessage[] = [
    {
      id: 'm3',
      sender: 'prospect',
      text: 'Non mi interessa minimamente, lasciami stare.',
      timestamp: '10:10',
    },
  ];
  const rejectScore = calculateConversionScore(mockLead, rejectedMsgs);
  assert.ok(rejectScore <= 25, 'Rejection should sharply lower conversion score');
});

test('calculatePipelineStats aggregates lead metrics accurately', () => {
  const leads: Lead[] = [
    { ...mockLead, id: '1', stage: 'discovered', potentialValue: 1000 },
    { ...mockLead, id: '2', stage: 'broadcast_sent', potentialValue: 1500 },
    { ...mockLead, id: '3', stage: 'replied', potentialValue: 2000 },
    { ...mockLead, id: '4', stage: 'negotiating', potentialValue: 3000 },
    { ...mockLead, id: '5', stage: 'converted', potentialValue: 2500 },
  ];

  const stats = calculatePipelineStats(leads);
  assert.equal(stats.totalLeads, 5);
  assert.equal(stats.broadcastSent, 4); // leads 2, 3, 4, 5
  assert.equal(stats.repliesReceived, 3); // leads 3, 4, 5
  assert.equal(stats.negotiating, 1);
  assert.equal(stats.converted, 1);
  assert.equal(stats.closedValue, 2500);
  assert.equal(stats.totalPipelineValue, 10000);
  assert.equal(stats.responseRate, 75); // 3 / 4 = 75%
  assert.equal(stats.conversionRate, 25); // 1 / 4 = 25%
});
