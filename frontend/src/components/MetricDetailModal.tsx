import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../constants/designTokens';
import { appCopy } from '../constants/copy';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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

  if (!visible) {
    return null;
  }

  const getMetricConfig = () => {
    switch (metricType) {
      case 'neural':
        return appCopy.scores.currentNeuroState;
      case 'brain':
        return appCopy.scores.neuroplasticity;
      case 'sleep':
        return appCopy.scores.sleepConsolidation;
      default:
        return appCopy.scores.neuroplasticity;
    }
  };

  const getGradientColor = () => {
    switch (metricType) {
      case 'neural':
        return colors.gradients.currentNeuroState.start;
      case 'brain':
        return colors.gradients.neuroplasticity.start;
      case 'sleep':
        return colors.gradients.sleepConsolidation.start;
      default:
        return colors.gradients.neuroplasticity.start;
    }
  };

  const config = getMetricConfig();
  const gradientColor = getGradientColor();

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Very Good';
    if (score >= 55) return 'Good';
    if (score >= 40) return 'Moderate';
    return 'Low';
  };

  // Circle progress calculations
  const circleSize = 140;
  const strokeWidth = 10;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (scoreValue / 100) * circumference;
  const strokeDashoffset = circumference - progress;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: gradientColor + '15' }]}>
            <Text style={styles.headerTitle}>{config.title}</Text>
            <TouchableOpacity 
              onPress={onClose} 
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={32} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            bounces={true}
          >
            {/* Big Score */}
            <View style={styles.scoreSection}>
              <View style={[styles.scoreCircle, { borderColor: gradientColor }]}>
                <Text style={styles.scoreValue}>{Math.round(scoreValue)}</Text>
              </View>
              <Text style={[styles.scoreStatus, { color: gradientColor }]}>
                {getScoreLabel(scoreValue)}
              </Text>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="information-circle" size={22} color={gradientColor} />
                <Text style={styles.sectionTitle}>WHAT THIS MEANS</Text>
              </View>
              <Text style={styles.bodyText}>{config.description}</Text>
            </View>

            {/* Bullet Points */}
            <View style={styles.section}>
              <Text style={styles.subHeader}>Perfect for:</Text>
              <View style={styles.bulletRow}>
                <View style={[styles.bulletDot, { backgroundColor: gradientColor }]} />
                <Text style={styles.bulletText}>Deep work that demands focus</Text>
              </View>
              <View style={styles.bulletRow}>
                <View style={[styles.bulletDot, { backgroundColor: gradientColor }]} />
                <Text style={styles.bulletText}>Complex problem-solving</Text>
              </View>
              <View style={styles.bulletRow}>
                <View style={[styles.bulletDot, { backgroundColor: gradientColor }]} />
                <Text style={styles.bulletText}>Creative breakthroughs</Text>
              </View>
              <View style={styles.bulletRow}>
                <View style={[styles.bulletDot, { backgroundColor: gradientColor }]} />
                <Text style={styles.bulletText}>Strategic thinking</Text>
              </View>
            </View>

            {/* Sleep Metrics */}
            {metricType === 'sleep' && supportingMetrics?.sleep_score && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="moon" size={22} color={gradientColor} />
                  <Text style={styles.sectionTitle}>YOUR METRICS</Text>
                </View>
                <View style={styles.metricsCard}>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Sleep Score</Text>
                    <Text style={styles.metricValue}>{supportingMetrics.sleep_score.value}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Formula Version</Text>
                    <Text style={styles.metricValue}>
                      {supportingMetrics.sleep_score.version.replace('_', ' ')}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Science Section */}
            <TouchableOpacity 
              style={styles.section}
              onPress={() => setScienceExpanded(!scienceExpanded)}
              activeOpacity={0.7}
            >
              <View style={styles.scienceHeader}>
                <View style={styles.scienceHeaderLeft}>
                  <Ionicons name="flask" size={22} color={gradientColor} />
                  <Text style={styles.sectionTitle}>THE SCIENCE</Text>
                </View>
                <Ionicons 
                  name={scienceExpanded ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={colors.text.secondary}
                />
              </View>
              {scienceExpanded && (
                <View style={styles.scienceBox}>
                  <Text style={styles.scienceText}>{config.science}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* CTA */}
            <TouchableOpacity 
              style={[styles.ctaButton, { backgroundColor: gradientColor }]}
              onPress={onClose}
            >
              <Text style={styles.ctaText}>Got It</Text>
            </TouchableOpacity>

            <View style={{ height: 60 }} />
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
    height: SCREEN_HEIGHT * 0.85,
    paddingBottom: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.3)',
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: 100,
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
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
    fontSize: 52,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -1.5,
  },
  scoreStatus: {
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
    letterSpacing: 1,
  },
  subHeader: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  bodyText: {
    fontSize: typography.sizes.body,
    lineHeight: 24,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    marginRight: spacing.md,
  },
  bulletText: {
    flex: 1,
    fontSize: typography.sizes.body,
    lineHeight: 22,
    color: colors.text.primary,
  },
  metricsCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
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
  divider: {
    height: 1,
    backgroundColor: 'rgba(229, 231, 235, 0.3)',
    marginVertical: spacing.sm,
  },
  scienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scienceHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  scienceBox: {
    marginTop: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.gradients.neuroplasticity.start,
  },
  scienceText: {
    fontSize: typography.sizes.bodySmall,
    lineHeight: 22,
    color: colors.text.secondary,
  },
  ctaButton: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  ctaText: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.white,
    letterSpacing: 0.5,
  },
});
