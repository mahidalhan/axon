import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AccordionSection from '../components/AccordionSection';
import FormulaBar from '../components/FormulaBar';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../constants/designTokens';
import { appCopy } from '../constants/copy';

export default function EducationScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.heroIconContainer}>
            <Ionicons name="school" size={40} color={colors.gradients.neuroplasticity.start} />
          </View>
          <Text style={styles.heroTitle}>Understanding AXON</Text>
          <Text style={styles.heroSubtitle}>
            Science-backed insights into your brain's readiness for peak performance
          </Text>
        </View>

        {/* Section 1: Understanding Your Scores */}
        <AccordionSection
          title="Understanding Your Scores"
          icon="analytics"
          iconColor={colors.gradients.neuroplasticity.start}
          defaultExpanded={true}
        >
          {/* Current Neuro State */}
          <View style={styles.scoreCard}>
            <Text style={styles.scoreTitle}>{appCopy.scores.currentNeuroState.title}</Text>
            <Text style={styles.scoreDescription}>
              {appCopy.scores.currentNeuroState.description}
            </Text>

            <View style={styles.formulaSection}>
              <Text style={styles.formulaTitle}>How it's calculated:</Text>
              <FormulaBar
                label="Alertness"
                weight={0.4}
                value={78}
                color={colors.gradients.neuroplasticity.start}
              />
              <FormulaBar
                label="Focus"
                weight={0.4}
                value={86}
                color={colors.gradients.currentNeuroState.start}
              />
              <FormulaBar
                label="Balance"
                weight={0.2}
                value={72}
                color={colors.gradients.sleepConsolidation.start}
              />
            </View>

            <View style={styles.scienceBox}>
              <Text style={styles.scienceLabel}>THE SCIENCE</Text>
              <Text style={styles.scienceText}>
                {appCopy.scores.currentNeuroState.science}
              </Text>
            </View>
          </View>

          {/* Neuro Readiness */}
          <View style={styles.scoreCard}>
            <Text style={styles.scoreTitle}>{appCopy.scores.neuroplasticity.title}</Text>
            <Text style={styles.scoreDescription}>
              {appCopy.scores.neuroplasticity.description}
            </Text>

            <View style={styles.formulaSection}>
              <Text style={styles.formulaTitle}>How it's calculated:</Text>
              <FormulaBar
                label="Session Quality"
                weight={0.55}
                value={76}
                color={colors.gradients.currentNeuroState.start}
              />
              <FormulaBar
                label="Sleep Consolidation"
                weight={0.25}
                value={82}
                color={colors.gradients.sleepConsolidation.start}
              />
              <FormulaBar
                label="Behavior Alignment"
                weight={0.20}
                value={65}
                color={colors.gradients.neuroplasticity.start}
              />
            </View>

            <View style={styles.scienceBox}>
              <Text style={styles.scienceLabel}>THE SCIENCE</Text>
              <Text style={styles.scienceText}>
                {appCopy.scores.neuroplasticity.science}
              </Text>
            </View>
          </View>

          {/* Sleep Consolidation */}
          <View style={styles.scoreCard}>
            <Text style={styles.scoreTitle}>{appCopy.scores.sleepConsolidation.title}</Text>
            <Text style={styles.scoreDescription}>
              {appCopy.scores.sleepConsolidation.description}
            </Text>

            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>How well your brain consolidates today's work</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Memory formation quality</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Neural recovery strength</Text>
              </View>
            </View>

            <View style={styles.scienceBox}>
              <Text style={styles.scienceLabel}>THE SCIENCE</Text>
              <Text style={styles.scienceText}>
                {appCopy.scores.sleepConsolidation.science}
              </Text>
            </View>
          </View>
        </AccordionSection>

        {/* Section 2: The Science Behind AXON */}
        <AccordionSection
          title="The Science Behind AXON"
          icon="flask"
          iconColor={colors.gradients.currentNeuroState.start}
        >
          <View style={styles.scienceArticle}>
            <Text style={styles.articleTitle}>EEG Band Powers</Text>
            <Text style={styles.articleText}>
              <Text style={styles.bold}>Beta waves (13-30 Hz)</Text> measure alertness and cognitive control. 
              Higher beta power correlates with norepinephrine release from the locus coeruleus.
              {' \n\n'}
              <Text style={styles.bold}>Theta waves (4-8 Hz)</Text> indicate focus and memory encoding. 
              Associated with acetylcholine release from the nucleus basalis.
              {' \n\n'}
              <Text style={styles.bold}>Alpha suppression</Text> shows active engagement versus idle state.
            </Text>
            <Text style={styles.citation}>
              Research: PMC 2024, Huberman Lab (2024-2025)
            </Text>
          </View>

          <View style={styles.scienceArticle}>
            <Text style={styles.articleTitle}>Post-Exercise Window</Text>
            <Text style={styles.articleText}>
              Exercise activates the vagus nerve, triggering norepinephrine and acetylcholine release. 
              This creates a <Text style={styles.bold}>1-4 hour window</Text> of heightened neuroplasticity.
            </Text>
            <Text style={styles.citation}>
              Huberman Lab: "Organize learning bouts 1-2 hours after exercise"
            </Text>
          </View>

          <View style={styles.scienceArticle}>
            <Text style={styles.articleTitle}>Sleep Consolidation</Text>
            <Text style={styles.articleText}>
              Deep slow-wave sleep drives hippocampal-cortical memory transfer. 
              REM sleep solidifies neural connections through synaptic remodeling.
            </Text>
            <Text style={styles.citation}>
              Walker (2017), Stickgold (2005), Frontiers (2025)
            </Text>
          </View>
        </AccordionSection>

        {/* Section 3: Optimization Protocols */}
        <AccordionSection
          title="Optimization Protocols"
          icon="fitness"
          iconColor={colors.status.excellent}
        >
          <View style={styles.protocolCard}>
            <View style={styles.protocolHeader}>
              <Ionicons name="checkmark-circle" size={24} color={colors.status.excellent} />
              <Text style={styles.protocolTitle}>Timing Your Sessions</Text>
            </View>
            <Text style={styles.protocolText}>
              • Schedule focus work 1-2 hours after exercise{' \n'}
              • Morning workouts create afternoon peaks{' \n'}
              • Avoid intense sessions when baseline is low
            </Text>
          </View>

          <View style={styles.protocolCard}>
            <View style={styles.protocolHeader}>
              <Ionicons name="moon" size={24} color={colors.gradients.sleepConsolidation.start} />
              <Text style={styles.protocolTitle}>Sleep Optimization</Text>
            </View>
            <Text style={styles.protocolText}>
              • Consistent bedtime (within 30 minutes){' \n'}
              • 7-9 hours of sleep{' \n'}
              • Cool bedroom (60-67°F){' \n'}
              • No screens 1 hour before bed
            </Text>
          </View>

          <View style={styles.protocolCard}>
            <View style={styles.protocolHeader}>
              <Ionicons name="barbell" size={24} color={colors.gradients.currentNeuroState.start} />
              <Text style={styles.protocolTitle}>Exercise Strategy</Text>
            </View>
            <Text style={styles.protocolText}>
              • High-intensity workouts boost neuroplasticity{' \n'}
              • Morning exercise = afternoon learning window{' \n'}
              • Avoid intense exercise 3h before bed
            </Text>
          </View>
        </AccordionSection>

        {/* Research Foundation */}
        <View style={styles.referenceCard}>
          <View style={styles.referenceHeader}>
            <Ionicons name="library" size={28} color={colors.gradients.neuroplasticity.start} />
            <Text style={styles.referenceTitle}>Scientific Foundation</Text>
          </View>
          <Text style={styles.referenceText}>
            AXON is based on peer-reviewed research from:
          </Text>
          <View style={styles.referenceList}>
            <View style={styles.referenceItem}>
              <Text style={styles.referenceBullet}>•</Text>
              <Text style={styles.referenceItemText}>Huberman Lab neuroplasticity protocols</Text>
            </View>
            <View style={styles.referenceItem}>
              <Text style={styles.referenceBullet}>•</Text>
              <Text style={styles.referenceItemText}>Matthew Walker's sleep science (2017)</Text>
            </View>
            <View style={styles.referenceItem}>
              <Text style={styles.referenceBullet}>•</Text>
              <Text style={styles.referenceItemText}>2024-2025 EEG studies on cognitive performance</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.gradients.neuroplasticity.start + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  heroTitle: {
    fontSize: typography.sizes.h2,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    fontSize: typography.sizes.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.xl,
  },
  scoreCard: {
    marginBottom: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.3)',
  },
  scoreTitle: {
    fontSize: typography.sizes.h4,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  scoreDescription: {
    fontSize: typography.sizes.body,
    color: colors.text.primary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  formulaSection: {
    marginBottom: spacing.lg,
  },
  formulaTitle: {
    fontSize: typography.sizes.bodySmall,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    letterSpacing: 0.5,
  },
  bulletList: {
    marginBottom: spacing.lg,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  bullet: {
    fontSize: typography.sizes.body,
    color: colors.gradients.sleepConsolidation.start,
    marginRight: spacing.sm,
    fontWeight: typography.weights.bold,
  },
  bulletText: {
    flex: 1,
    fontSize: typography.sizes.bodySmall,
    color: colors.text.primary,
    lineHeight: 20,
  },
  scienceBox: {
    padding: spacing.lg,
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.gradients.neuroplasticity.start,
  },
  scienceLabel: {
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  scienceText: {
    fontSize: typography.sizes.bodySmall,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  scienceArticle: {
    marginBottom: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.2)',
  },
  articleTitle: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  articleText: {
    fontSize: typography.sizes.bodySmall,
    color: colors.text.primary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  bold: {
    fontWeight: typography.weights.bold,
  },
  citation: {
    fontSize: typography.sizes.caption,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  protocolCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.background.primary,
    borderRadius: 8,
  },
  protocolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  protocolTitle: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  protocolText: {
    fontSize: typography.sizes.bodySmall,
    color: colors.text.primary,
    lineHeight: 20,
  },
  referenceCard: {
    padding: spacing.xl,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.5)',
  },
  referenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  referenceTitle: {
    fontSize: typography.sizes.h4,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  referenceText: {
    fontSize: typography.sizes.body,
    color: colors.text.primary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  referenceList: {
    gap: spacing.md,
  },
  referenceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  referenceBullet: {
    fontSize: typography.sizes.body,
    color: colors.gradients.neuroplasticity.start,
    fontWeight: typography.weights.bold,
    marginRight: spacing.sm,
  },
  referenceItemText: {
    flex: 1,
    fontSize: typography.sizes.bodySmall,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});
