import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../constants/designTokens';
import { appCopy } from '../constants/copy';

interface MetricDetailModalProps {
  visible: boolean;
  onClose: () => void;
  metricType: 'neural' | 'brain' | 'sleep';
  scoreValue: number;
  components?: any;
  supportingMetrics?: any;
}

export default function MetricDetailModal({
  visible,
  onClose,
  metricType,
  scoreValue,
  components,
  supportingMetrics,
}: MetricDetailModalProps) {
  const [scienceExpanded, setScienceExpanded] = useState(false);

  const getMetricConfig = () => {
    switch (metricType) {
      case 'neural':
        return {
          title: appCopy.scores.currentNeuroState.title,
          description: appCopy.scores.currentNeuroState.description,
          longDescription: appCopy.scores.currentNeuroState.longDescription,
          science: appCopy.scores.currentNeuroState.science,
          gradient: [colors.gradients.currentNeuroState.start, colors.gradients.currentNeuroState.end],
        };
      case 'brain':
        return {
          title: appCopy.scores.neuroplasticity.title,
          description: appCopy.scores.neuroplasticity.description,
          longDescription: appCopy.scores.neuroplasticity.longDescription,
          science: appCopy.scores.neuroplasticity.science,
          gradient: [colors.gradients.neuroplasticity.start, colors.gradients.neuroplasticity.end],
        };
      case 'sleep':
        return {
          title: appCopy.scores.sleepConsolidation.title,
          description: appCopy.scores.sleepConsolidation.description,
          longDescription: appCopy.scores.sleepConsolidation.longDescription,
          science: appCopy.scores.sleepConsolidation.science,
          gradient: [colors.gradients.sleepConsolidation.start, colors.gradients.sleepConsolidation.end],
        };
      default:
        // Fallback to neuroplasticity config if type is invalid
        return {
          title: appCopy.scores.neuroplasticity.title,
          description: appCopy.scores.neuroplasticity.description,
          longDescription: appCopy.scores.neuroplasticity.longDescription,
          science: appCopy.scores.neuroplasticity.science,
          gradient: [colors.gradients.neuroplasticity.start, colors.gradients.neuroplasticity.end],
        };
    }
  };

  // Don't render anything if modal is not visible
  if (!visible) {
    return null;
  }

  const config = getMetricConfig();
  
  // Provide safe fallback values
  const gradientColor = config.gradient?.[0] || colors.gradients.neuroplasticity.start;
  const gradientColor2 = config.gradient?.[1] || colors.gradients.neuroplasticity.end;

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Very Good';
    if (score >= 55) return 'Good';
    if (score >= 40) return 'Moderate';
    return 'Low';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header with gradient background */}
          <View style={[styles.header, { backgroundColor: gradientColor + '20' }]}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>{config.title}</Text>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={28} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Big Score Display */}
            <View style={styles.scoreDisplay}>
              <View style={[styles.scoreCircle, { borderColor: gradientColor }]}>
                <Text style={styles.scoreValue}>{Math.round(scoreValue)}</Text>
              </View>
              <Text style={[styles.scoreLabel, { color: gradientColor }]}>
                {getScoreLabel(scoreValue)}
              </Text>
            </View>

            {/* What This Means Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="information-circle" size={20} color={gradientColor} />
                <Text style={styles.sectionTitle}>WHAT THIS MEANS</Text>
              </View>
              <Text style={styles.descriptionText}>{config.description}</Text>
            </View>

            {/* Key Points */}
            <View style={styles.section}>
              {config.longDescription.split('\n').filter(line => line.startsWith('•')).map((point, idx) => (
                <View key={idx} style={styles.bulletPoint}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{point.replace('• ', '')}</Text>
                </View>
              ))}
            </View>

            {/* Metrics Display for Sleep */}
            {metricType === 'sleep' && supportingMetrics && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="analytics" size={20} color={gradientColor} />
                  <Text style={styles.sectionTitle}>YOUR METRICS</Text>
                </View>
                <View style={styles.metricsGrid}>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Sleep Score</Text>
                    <Text style={styles.metricValue}>{supportingMetrics.sleep_score?.value || 'N/A'}</Text>
                  </View>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Formula Version</Text>
                    <Text style={styles.metricValue}>{supportingMetrics.sleep_score?.version || 'N/A'}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Collapsible Science Section */}
            <TouchableOpacity 
              style={styles.section}
              onPress={() => setScienceExpanded(!scienceExpanded)}
              activeOpacity={0.7}
            >
              <View style={styles.sectionHeader}>
                <Ionicons name="flask" size={20} color={gradientColor} />
                <Text style={styles.sectionTitle}>THE SCIENCE</Text>
                <Ionicons 
                  name={scienceExpanded ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={colors.text.secondary} 
                  style={styles.chevron}
                />
              </View>
              {scienceExpanded && (
                <View style={styles.scienceContent}>
                  <Text style={styles.scienceText}>{config.science}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* CTA Button */}
            <TouchableOpacity 
              style={[styles.ctaButton, { backgroundColor: gradientColor }]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.ctaButtonText}>Got It</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.3)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.h2,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  scoreDisplay: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.primary,
    marginBottom: spacing.md,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: -1,
  },
  scoreLabel: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.bold,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.bodySmall,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    letterSpacing: 0.5,
    flex: 1,
  },
  chevron: {
    marginLeft: 'auto',
  },
  descriptionText: {
    fontSize: typography.sizes.body,
    lineHeight: 24,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    paddingLeft: spacing.sm,
  },
  bullet: {
    fontSize: typography.sizes.body,
    color: colors.text.primary,
    marginRight: spacing.sm,
    fontWeight: typography.weights.bold,
  },
  bulletText: {
    flex: 1,
    fontSize: typography.sizes.body,
    lineHeight: 22,
    color: colors.text.primary,
  },
  metricsGrid: {
    gap: spacing.md,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.2)',
  },
  metricLabel: {
    fontSize: typography.sizes.body,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  metricValue: {
    fontSize: typography.sizes.body,
    color: colors.text.primary,
    fontWeight: typography.weights.bold,
  },
  scienceContent: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
  },
  scienceText: {
    fontSize: typography.sizes.bodySmall,
    lineHeight: 20,
    color: colors.text.secondary,
  },
  ctaButton: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  ctaButtonText: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
});
