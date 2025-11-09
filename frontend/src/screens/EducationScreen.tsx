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
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <Card style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="school" size={40} color="#4F46E5" />
          </View>
          <Text style={styles.heroTitle}>Understanding AXON</Text>
          <Text style={styles.heroSubtitle}>
            Science-backed insights into your brain's readiness for peak performance
          </Text>
        </Card>

        {/* Your Scores */}
        <Text style={styles.sectionTitle}>Your Three Scores</Text>
        
        <Card>
          <Text style={styles.cardTitle}>Current Neuro State</Text>
          <Text style={styles.infoText}>
            Your brain's readiness for peak cognitive performance right now.
          </Text>
          <Text style={styles.scienceText}>
            Based on EEG patterns showing alertness, focus, and cognitive control.
          </Text>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Neuro Readiness</Text>
          <Text style={styles.infoText}>
            Your brain's capacity to adapt, learn, and rewire.
          </Text>
          <Text style={styles.scienceText}>
            Combines session quality (55%), sleep consolidation (25%), and behavioral timing (20%).
          </Text>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Sleep Consolidation</Text>
          <Text style={styles.infoText}>
            Your brain's ability to lock in what you learned while you sleep.
          </Text>
          <Text style={styles.scienceText}>
            8 research-validated sleep metrics including HRV, deep sleep %, and consistency.
          </Text>
        </Card>

        {/* Scientific Foundation */}
        <Text style={styles.sectionTitle}>Scientific Foundation</Text>
        <Card style={styles.referenceCard}>
          <View style={styles.referenceHeader}>
            <Ionicons name="library" size={28} color="#6366F1" />
            <Text style={styles.referenceTitle}>Research Basis</Text>
          </View>
          <Text style={styles.referenceIntro}>
            AXON is based on peer-reviewed research from:
          </Text>
          <View style={styles.referenceList}>
            <View style={styles.referenceItem}>
              <Text style={styles.referenceBullet}>•</Text>
              <Text style={styles.referenceText}>Huberman Lab neuroplasticity protocols</Text>
            </View>
            <View style={styles.referenceItem}>
              <Text style={styles.referenceBullet}>•</Text>
              <Text style={styles.referenceText}>Matthew Walker's sleep science (2017)</Text>
            </View>
            <View style={styles.referenceItem}>
              <Text style={styles.referenceBullet}>•</Text>
              <Text style={styles.referenceText}>2024-2025 EEG studies on cognitive performance</Text>
            </View>
          </View>
        </Card>

        {/* Tips */}
        <Text style={styles.sectionTitle}>Optimization Tips</Text>
        <Card>
          <Text style={styles.cardTitle}>Timing Your Sessions</Text>
          <Text style={styles.tipText}>
            • Schedule focus work 1-2 hours after exercise{'\n'}
            • Morning workouts create afternoon peaks{'\n'}
            • Avoid intense sessions when baseline is low
          </Text>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Sleep Optimization</Text>
          <Text style={styles.tipText}>
            • Consistent bedtime (within 30 minutes){'\n'}
            • 7-9 hours of sleep{'\n'}
            • Cool bedroom (60-67°F){'\n'}
            • No screens 1 hour before bed
          </Text>
        </Card>

        <View style={{ height: 40 }} />
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
    marginBottom: 24,
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 22,
    marginBottom: 12,
  },
  scienceText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },
  tipText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  referenceCard: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.5)',
  },
  referenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  referenceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  referenceIntro: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 22,
    marginBottom: 16,
  },
  referenceList: {
    gap: 12,
  },
  referenceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  referenceBullet: {
    fontSize: 15,
    color: '#6366F1',
    fontWeight: '700',
    marginRight: 8,
  },
  referenceText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
