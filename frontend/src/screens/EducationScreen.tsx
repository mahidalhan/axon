import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../components/Card';
import { Ionicons } from '@expo/vector-icons';

export default function EducationScreen() {
  const sleepMetrics = [
    {
      title: 'Sleep Duration',
      icon: 'time',
      color: '#6366F1',
      optimal: '7-9 hours',
      weight: '30%',
      description: 'Your brain needs time to complete memory consolidation. Each 90-minute sleep cycle processes different types of learning.',
    },
    {
      title: 'Sleep Efficiency',
      icon: 'pulse',
      color: '#10B981',
      optimal: '>85%',
      weight: '25%',
      description: 'Percentage of time in bed actually sleeping. High efficiency means better consolidation.',
    },
    {
      title: 'HRV During Sleep',
      icon: 'heart',
      color: '#EF4444',
      optimal: '60-80 ms',
      weight: '10%',
      description: 'Heart Rate Variability indicates nervous system recovery. Higher HRV during sleep correlates with better memory consolidation.',
    },
    {
      title: 'Sleep Consistency',
      icon: 'calendar',
      color: '#F59E0B',
      optimal: '<30 min variance',
      weight: '10%',
      description: 'Regular bedtime strengthens your circadian rhythm and improves sleep quality.',
    },
    {
      title: 'WASO (Wake After Sleep Onset)',
      icon: 'alert-circle',
      color: '#8B5CF6',
      optimal: '<20 minutes',
      weight: '10%',
      description: 'Time spent awake during the night. Less WASO means more consolidated sleep and better memory formation.',
    },
    {
      title: 'Sleep Onset Latency',
      icon: 'moon',
      color: '#06B6D4',
      optimal: '<15 minutes',
      weight: '5%',
      description: 'How quickly you fall asleep. Falling asleep within 15 minutes indicates good sleep drive and timing.',
    },
    {
      title: 'Respiratory Rate',
      icon: 'fitness',
      color: '#14B8A6',
      optimal: '12-16 bpm',
      weight: '5%',
      description: 'Breathing rate during sleep. Stable, moderate rate indicates relaxed parasympathetic state.',
    },
    {
      title: 'Deep Sleep %',
      icon: 'bed',
      color: '#A855F7',
      optimal: '15-25%',
      weight: '5%',
      description: 'Percentage of sleep in deep/slow-wave sleep. Critical for physical recovery and memory consolidation.',
    },
  ];

  const neuroplasticityInfo = [
    {
      phase: 'Trigger',
      description: 'Exercise or focused learning creates the signal for brain change.',
      icon: 'flash',
      color: '#F59E0B',
    },
    {
      phase: 'Signal',
      description: 'Optimal windows (1-4h post-exercise) when brain is primed for learning.',
      icon: 'thunderbolt',
      color: '#6366F1',
    },
    {
      phase: 'Consolidation',
      description: 'Sleep locks in new neural connections and clears metabolic waste.',
      icon: 'moon',
      color: '#10B981',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <Card style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="school" size={40} color="#4F46E5" />
          </View>
          <Text style={styles.heroTitle}>Sleep & Neuroplasticity</Text>
          <Text style={styles.heroSubtitle}>
            Understanding how sleep, exercise, and learning work together to optimize your brain
          </Text>
        </Card>

        {/* Three Phase Model */}
        <Text style={styles.sectionTitle}>Three-Phase Neuroplasticity Model</Text>
        {neuroplasticityInfo.map((phase, index) => (
          <Card key={index} style={styles.phaseCard}>
            <View style={styles.phaseHeader}>
              <View style={[styles.phaseIcon, { backgroundColor: phase.color + '20' }]}>
                <Ionicons name={phase.icon as any} size={24} color={phase.color} />
              </View>
              <Text style={styles.phaseTitle}>{phase.phase}</Text>
            </View>
            <Text style={styles.phaseDescription}>{phase.description}</Text>
          </Card>
        ))}

        {/* Sleep Metrics */}
        <Text style={styles.sectionTitle}>Why We Track 8 Sleep Metrics</Text>
        <Card style={styles.infoCard}>
          <Text style={styles.infoText}>
            Your sleep score isn't just about duration. Research shows that <Text style={styles.boldText}>sleep quality matters just as much</Text> for memory consolidation and neuroplasticity.
          </Text>
        </Card>

        {sleepMetrics.map((metric, index) => (
          <Card key={index}>
            <View style={styles.metricHeader}>
              <View style={[styles.metricIcon, { backgroundColor: metric.color + '20' }]}>
                <Ionicons name={metric.icon as any} size={20} color={metric.color} />
              </View>
              <View style={styles.metricInfo}>
                <View style={styles.metricTitleRow}>
                  <Text style={styles.metricTitle}>{metric.title}</Text>
                  <Text style={styles.metricWeight}>{metric.weight}</Text>
                </View>
                <Text style={styles.metricOptimal}>Optimal: {metric.optimal}</Text>
              </View>
            </View>
            <Text style={styles.metricDescription}>{metric.description}</Text>
          </Card>
        ))}

        {/* Tips Section */}
        <Text style={styles.sectionTitle}>Actionable Tips</Text>
        <Card style={styles.tipsCard}>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.tipText}>Set consistent bedtime (within 30 minutes)</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.tipText}>Keep bedroom cool (60-67°F)</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.tipText}>Avoid screens 1 hour before bed</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.tipText}>Schedule learning 1-4 hours after exercise</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.tipText}>No intense exercise &lt;3 hours before bed</Text>
          </View>
        </Card>

        {/* Research References */}
        <Card style={styles.referenceCard}>
          <Text style={styles.referenceTitle}>Scientific Foundation</Text>
          <Text style={styles.referenceText}>
            This app is based on research from the Huberman Lab, Matthew Walker's "Why We Sleep", and peer-reviewed studies on neuroplasticity and sleep consolidation.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  heroCard: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 12,
  },
  phaseCard: {
    marginBottom: 12,
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  phaseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  phaseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  phaseDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
  },
  boldText: {
    fontWeight: '700',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  metricInfo: {
    flex: 1,
  },
  metricTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  metricWeight: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366F1',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  metricOptimal: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 2,
  },
  metricDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  tipsCard: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  referenceCard: {
    backgroundColor: '#F3F4F6',
    marginTop: 8,
  },
  referenceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  referenceText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
});
