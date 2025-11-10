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
      description: 'Your brain\'s immediate readiness for peak cognitive tasks.',
      longDescription: `Your brain's immediate readiness for peak cognitive tasks.

This moment. This session.

Optimal for:
• Focused deep work sessions
• High-stakes decision making
• Intense problem-solving
• Peak performance tasks`,
      science: 'Real-time EEG patterns measuring current alertness (beta waves), focus (theta waves), and cognitive control. Shows your brain state RIGHT NOW.',
    },
    neuroplasticity: {
      title: 'Neuro Readiness',
      subtitle: 'Brain state',
      description: 'Your brain\'s capacity for long-term adaptation and growth.',
      longDescription: `Your brain's capacity for long-term adaptation and growth.

Not just performance. Lasting change.

Supports:
• Learning new skills
• Building mental resilience  
• Forming new neural pathways
• Adapting to challenges`,
      science: 'Combines session quality (55%), sleep consolidation (25%), and behavioral timing (20%). Predicts your capacity for neuroplastic change over days and weeks.',
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
