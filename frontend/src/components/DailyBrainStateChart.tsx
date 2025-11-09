import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { colors, typography, spacing } from '../constants/designTokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DailyBrainStateChartProps {
  circadianBaseline: number[];  // 96 points (15-min intervals)
  sessionData: {
    startHour: number;
    endHour: number;
    lriValues: { hour: number; lri: number }[];
  };
  gammaPeaks: { hour: number; lri: number }[];
  events: { hour: number; type: string; icon: string; label: string }[];
}

export default function DailyBrainStateChart({
  circadianBaseline,
  sessionData,
  gammaPeaks,
  events,
}: DailyBrainStateChartProps) {
  
  // Debug logging
  console.log('[Chart] Baseline length:', circadianBaseline?.length);
  console.log('[Chart] Session data:', sessionData);
  console.log('[Chart] Gamma peaks:', gammaPeaks?.length);
  
  // Provide fallback if no data
  if (!circadianBaseline || circadianBaseline.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Your Brain State Today</Text>
        <Text style={styles.subtitle}>Loading chart data...</Text>
      </View>
    );
  }
  
  // Convert baseline to chart format (sample every 3 hours for clarity)
  const baselineChartData = circadianBaseline
    .filter((_, idx) => idx % 12 === 0)  // Every 3 hours (12 * 15min)
    .map((value, idx) => ({
      value: value,
      label: idx === 0 ? '6am' : idx === 1 ? '9am' : idx === 2 ? '12pm' : idx === 3 ? '3pm' : idx === 4 ? '6pm' : '9pm',
    }));
    
  console.log('[Chart] Baseline chart data:', baselineChartData);

  // Convert session data to chart format
  const sessionChartData = sessionData.lriValues.map((item) => ({
    value: item.lri,
    dataPointText: '',
  }));

  // Find the index range for the session in the baseline
  const sessionStartIdx = Math.floor(sessionData.startHour * 4); // 4 points per hour
  const sessionEndIdx = Math.ceil(sessionData.endHour * 4);

  return (
    <View style={styles.container}>
      {/* Chart Title */}
      <Text style={styles.title}>Your Brain State Today</Text>
      <Text style={styles.subtitle}>Your 40-minute window in context</Text>

      {/* Time markers for events */}
      <View style={styles.eventsRow}>
        {events.map((event, idx) => (
          <View key={idx} style={styles.eventMarker}>
            <Text style={styles.eventIcon}>{event.icon}</Text>
            <Text style={styles.eventLabel}>{event.label}</Text>
            <Text style={styles.eventTime}>
              {Math.floor(event.hour)}:{((event.hour % 1) * 60).toFixed(0).padStart(2, '0')}
            </Text>
          </View>
        ))}
      </View>

      {/* Main Chart */}
      <View style={styles.chartWrapper}>
        <LineChart
          data={baselineChartData}
          width={SCREEN_WIDTH - 60}
          height={240}
          spacing={(SCREEN_WIDTH - 100) / (baselineChartData.length - 1)}
          color="rgba(156, 163, 175, 0.3)"
          thickness={2}
          startFillColor="rgba(156, 163, 175, 0.1)"
          endFillColor="rgba(156, 163, 175, 0.05)"
          startOpacity={0.4}
          endOpacity={0.1}
          initialSpacing={10}
          yAxisColor="rgba(229, 231, 235, 0.3)"
          xAxisColor="rgba(229, 231, 235, 0.3)"
          yAxisTextStyle={{ color: colors.text.tertiary, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: colors.text.secondary, fontSize: 11, fontWeight: '600' }}
          hideDataPoints
          curved
          areaChart
          hideRules
          yAxisThickness={0}
          xAxisThickness={1}
        />
        
        {/* Gamma peak markers overlay */}
        <View style={styles.peaksOverlay}>
          {gammaPeaks.map((peak, idx) => {
            const xPosition = ((peak.hour - 6) / 18) * (SCREEN_WIDTH - 60);
            return (
              <View
                key={idx}
                style={[
                  styles.peakMarker,
                  { left: xPosition - 12 },
                ]}
              >
                <Text style={styles.peakStar}>⭐</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: 'rgba(156, 163, 175, 0.3)' }]} />
          <Text style={styles.legendText}>Typical circadian pattern</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.gradients.currentNeuroState.start }]} />
          <Text style={styles.legendText}>Your measured session</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={styles.legendStar}>⭐</Text>
          <Text style={styles.legendText}>Peak moments (Neuro Score {'>'} 70)</Text>
        </View>
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimerBox}>
        <Text style={styles.disclaimerText}>
          Gray curve shows typical brain alertness pattern based on circadian research. 
          Session data is measured from your EEG. Peak moments occur when your Neuro Score exceeds 70.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  eventsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  eventMarker: {
    alignItems: 'center',
  },
  eventIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  eventLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 9,
    color: colors.text.tertiary,
  },
  chartWrapper: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  peaksOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 240,
    pointerEvents: 'none',
  },
  peakMarker: {
    position: 'absolute',
    top: 20,
  },
  peakStar: {
    fontSize: 24,
  },
  legend: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  legendStar: {
    fontSize: 14,
    marginRight: spacing.sm,
  },
  legendText: {
    fontSize: typography.sizes.caption,
    color: colors.text.secondary,
  },
  disclaimerBox: {
    padding: spacing.md,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    borderRadius: 8,
    borderLeftWidth: 2,
    borderLeftColor: colors.gradients.neuroplasticity.start,
  },
  disclaimerText: {
    fontSize: typography.sizes.caption,
    lineHeight: 16,
    color: colors.text.secondary,
  },
});
