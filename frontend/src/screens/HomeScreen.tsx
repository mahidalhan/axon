import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../services/api';
import CircularProgress from '../components/CircularProgress';
import Card from '../components/Card';
import ScoreRing from '../components/ScoreRing';
import MetricDetailModal from '../components/MetricDetailModal';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/designTokens';
import { appCopy } from '../constants/copy';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [brainScore, setBrainScore] = useState<any>(null);
  const [todaySummary, setTodaySummary] = useState<any>(null);
  const [optimalWindow, setOptimalWindow] = useState<any>(null);
  const [currentMetrics, setCurrentMetrics] = useState<any>(null);
  const [showMetricModal, setShowMetricModal] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string>('');

  const loadData = async () => {
    try {
      const [scoreData, summaryData, windowData, metricsData] = await Promise.all([
        api.getBrainScoreToday(),
        api.getTodaySummary(),
        api.getOptimalWindowStatus(),
        api.getCurrentMetrics(),
      ]);

      setBrainScore(scoreData);
      setTodaySummary(summaryData);
      setOptimalWindow(windowData);
      setCurrentMetrics(metricsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return '#10B981';
      case 'very_good':
        return '#22C55E';
      case 'good':
        return '#84CC16';
      case 'moderate':
        return '#F59E0B';
      default:
        return '#9CA3AF';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#84CC16';
    if (score >= 40) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom'] as any}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Date Header */}
        <View style={styles.dateHeader}>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              day: 'numeric',
              month: 'long' 
            })}
          </Text>
        </View>

        {/* Brain Score Rings */}
        <Card style={styles.scoreCard}>
          <View style={styles.scoresContainer}>
            <ScoreRing
              value={todaySummary?.session_score || 0}
              label={appCopy.scores.currentNeuroState.title}
              subtitle={appCopy.scores.currentNeuroState.subtitle}
              gradientColors={[colors.gradients.currentNeuroState.start, colors.gradients.currentNeuroState.end]}
              size={100}
              onPress={() => {
                setSelectedMetric('neural');
                setShowMetricModal(true);
              }}
            />
            <ScoreRing
              value={brainScore?.brain_score || 0}
              label={appCopy.scores.neuroplasticity.title}
              subtitle={appCopy.scores.neuroplasticity.subtitle}
              gradientColors={[colors.gradients.neuroplasticity.start, colors.gradients.neuroplasticity.end]}
              size={100}
              isPrimary={true}
              onPress={() => {
                setSelectedMetric('brain');
                setShowMetricModal(true);
              }}
            />
            <ScoreRing
              value={brainScore?.components?.consolidation || 0}
              label={appCopy.scores.sleepConsolidation.title}
              subtitle={appCopy.scores.sleepConsolidation.subtitle}
              gradientColors={[colors.gradients.sleepConsolidation.start, colors.gradients.sleepConsolidation.end]}
              size={100}
              onPress={() => {
                setSelectedMetric('sleep');
                setShowMetricModal(true);
              }}
            />
          </View>
        </Card>

        {/* Optimal Window Status */}
        <Card style={styles.windowCard}>
          <View style={styles.windowHeader}>
            <View style={styles.windowIcon}>
              <Ionicons 
                name={optimalWindow?.has_window ? 'flash' : 'flash-outline'} 
                size={24} 
                color={optimalWindow?.has_window ? '#10B981' : '#9CA3AF'} 
              />
            </View>
            <Text style={styles.windowTitle}>Optimal Window</Text>
          </View>
          {optimalWindow?.has_window ? (
            <View>
              <View style={styles.activeNowContainer}>
                <Text style={styles.windowStatus}>Active Now</Text>
                <Text style={styles.currentTime}>
                  {new Date().toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </Text>
              </View>
              <View style={styles.windowDetails}>
                <View style={[styles.qualityBadge, { backgroundColor: getQualityColor(optimalWindow.quality) + '20' }]}>
                  <Text style={[styles.qualityText, { color: getQualityColor(optimalWindow.quality) }]}>
                    {optimalWindow.quality.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.lriText}>LRI: {optimalWindow.current_lri?.toFixed(0)}</Text>
              </View>
              <Text style={styles.windowMessage}>
                Perfect time for deep work and learning!
              </Text>
            </View>
          ) : (
            <View>
              <Text style={styles.windowStatus}>No Active Window</Text>
              <Text style={styles.windowMessage}>
                {optimalWindow?.message || 'Check back after your next session'}
              </Text>
            </View>
          )}
        </Card>

        {/* Today's Metrics */}
        <Card>
          <Text style={styles.cardTitle}>Today's Session</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>{todaySummary?.peak_lri?.toFixed(0) || 0}</Text>
              <Text style={styles.metricLabel}>Peak LRI</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>{todaySummary?.optimal_minutes?.toFixed(0) || 0}</Text>
              <Text style={styles.metricLabel}>Optimal Minutes</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>{todaySummary?.optimal_percentage?.toFixed(0) || 0}%</Text>
              <Text style={styles.metricLabel}>Optimal Time</Text>
            </View>
          </View>
        </Card>

        {/* Current State Metrics */}
        <Card>
          <Text style={styles.cardTitle}>Current State</Text>
          <View style={styles.currentMetrics}>
            <View style={styles.currentMetricRow}>
              <View style={styles.currentMetricInfo}>
                <Ionicons name="eye-outline" size={20} color="#6366F1" />
                <Text style={styles.currentMetricLabel}>Alertness</Text>
              </View>
              <View style={styles.currentMetricValueContainer}>
                <View style={[styles.currentMetricBar, { width: `${currentMetrics?.alertness || 0}%`, backgroundColor: '#6366F1' }]} />
                <Text style={styles.currentMetricValue}>{currentMetrics?.alertness?.toFixed(0) || 0}</Text>
              </View>
            </View>
            <View style={styles.currentMetricRow}>
              <View style={styles.currentMetricInfo}>
                <Ionicons name="bulb-outline" size={20} color="#F59E0B" />
                <Text style={styles.currentMetricLabel}>Focus</Text>
              </View>
              <View style={styles.currentMetricValueContainer}>
                <View style={[styles.currentMetricBar, { width: `${currentMetrics?.focus || 0}%`, backgroundColor: '#F59E0B' }]} />
                <Text style={styles.currentMetricValue}>{currentMetrics?.focus?.toFixed(0) || 0}</Text>
              </View>
            </View>
            <View style={styles.currentMetricRow}>
              <View style={styles.currentMetricInfo}>
                <Ionicons name="pulse-outline" size={20} color="#10B981" />
                <Text style={styles.currentMetricLabel}>Balance</Text>
              </View>
              <View style={styles.currentMetricValueContainer}>
                <View style={[styles.currentMetricBar, { width: `${currentMetrics?.arousal_balance || 0}%`, backgroundColor: '#10B981' }]} />
                <Text style={styles.currentMetricValue}>{currentMetrics?.arousal_balance?.toFixed(0) || 0}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Insight Card */}
        {brainScore?.insight && (
          <Card style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Ionicons name="bulb" size={24} color="#F59E0B" />
              <Text style={styles.insightTitle}>Today's Insight</Text>
            </View>
            <Text style={styles.insightText}>{brainScore.insight}</Text>
          </Card>
        )}

        {/* Metric Detail Modal */}
        <MetricDetailModal
          visible={showMetricModal}
          onClose={() => setShowMetricModal(false)}
          metricType={selectedMetric as 'neural' | 'brain' | 'sleep'}
          scoreValue={
            selectedMetric === 'neural' ? (todaySummary?.session_score || 0) :
            selectedMetric === 'brain' ? (brainScore?.brain_score || 0) :
            (brainScore?.components?.consolidation || 0)
          }
          components={
            selectedMetric === 'neural' ? currentMetrics :
            selectedMetric === 'brain' ? brainScore?.components :
            null
          }
          supportingMetrics={
            selectedMetric === 'sleep' ? brainScore?.supporting_metrics : null
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  dateHeader: {
    marginBottom: 16,
  },
  dateText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  scoreCard: {
    marginBottom: 24,
    paddingVertical: 32,
  },
  scoresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  mainScoreLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  windowCard: {
    marginBottom: 16,
  },
  windowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  windowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  windowTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  windowStatus: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  activeNowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  windowDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  qualityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  qualityText: {
    fontSize: 12,
    fontWeight: '700',
  },
  lriText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  windowMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  currentMetrics: {
    gap: 16,
  },
  currentMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentMetricInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  currentMetricLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  currentMetricValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    gap: 8,
  },
  currentMetricBar: {
    height: 8,
    borderRadius: 4,
  },
  currentMetricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    width: 40,
    textAlign: 'right',
  },
  insightCard: {
    marginBottom: 16,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#92400E',
    marginLeft: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalBody: {
    gap: 16,
  },
  metricDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  metricDetailLabel: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    flex: 1,
  },
  metricDetailValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  metricWeight: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
    marginLeft: 8,
  },
  metricExplanation: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  metricDisclaimer: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 18,
    marginTop: 12,
    fontStyle: 'italic',
  },
});
