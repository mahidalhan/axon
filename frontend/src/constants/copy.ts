/**
 * App Copy - AXON
 * Aspirational, Steve Jobs-inspired messaging
 */

export const appCopy = {
  tagline: 'Know your brain. Master your mind.',
  hero: 'Peak when it matters.',
  
  scores: {
    currentNeuroState: {
      title: 'Current Neuro State',
      subtitle: 'Right now',
      description: 'Your brain\'s readiness for peak cognitive performance.',
      longDescription: `Your brain's readiness for peak cognitive performance.

Right now. This moment.

Perfect for:
• Deep work that demands focus
• Complex problem-solving
• Creative breakthroughs
• Strategic thinking
• High-stakes decisions`,
      science: 'EEG patterns show when your brain enters states of heightened alertness, focus, and cognitive control.',
    },
    neuroplasticity: {
      title: 'Neuro Readiness',
      subtitle: 'Brain state',
      description: 'Your brain\'s capacity to adapt, learn, and rewire.',
      longDescription: `Your brain's capacity to adapt, learn, and rewire.

Not just performance. Growth.

This is your brain's readiness to:
• Form new neural connections
• Master new skills
• Adapt to challenges
• Build mental resilience`,
      science: 'Combines neural state, sleep quality, and behavioral timing. Based on Huberman Lab\'s neuroplasticity protocols.',
    },
    sleepConsolidation: {
      title: 'Sleep Consolidation',
      subtitle: 'Last night',
      description: 'Your brain\'s ability to lock in what you learned.',
      longDescription: `Your brain's ability to lock in what you learned.

While you sleep, your brain rewires.
Deep connections form. Memories solidify.

This score predicts:
• How well your brain consolidates today's work
• Memory formation quality
• Neural recovery strength`,
      science: '8 research-validated sleep metrics including HRV, deep sleep %, and consistency. Walker (2017), Stickgold (2005).',
    },
  },
  
  session: {
    title: 'Your Brain Today',
    subtitle: 'Your 40-minute window',
    contextTitle: 'Your Peak Window',
    gammaPeaks: 'Peak moments detected',
    optimalWindow: 'Optimal window',
    circadianPhase: {
      morning_peak: 'Morning peak period',
      afternoon_dip: 'Afternoon recovery',
      evening_peak: 'Evening peak period',
    },
  },
  
  education: {
    title: 'Understanding AXON',
    scoresSection: 'Understanding Your Scores',
    scienceSection: 'The Science Behind AXON',
    protocolsSection: 'Optimization Protocols',
  },
  
  insights: {
    peakState: 'Your brain entered a state of peak focus and alertness.',
    perfectFor: 'Perfect for:',
    deepWork: 'Complex problem-solving',
    creative: 'Creative breakthroughs',
    strategic: 'Strategic decisions',
  },
};

export const chartLabels = {
  baseline: 'Baseline shows typical brain rhythm',
  measured: 'Bold shows your measured neural state',
  disclaimer: 'Gray curve shows typical alertness pattern based on circadian research. Colored area is your measured brain state from EEG.',
};
