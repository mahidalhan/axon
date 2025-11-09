import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../constants/designTokens';

interface SupplementCardProps {
  icon: string;
  name: string;
  dosage: number;
  unit: string;
  timeTaken: string;
  category: string;
  onPress?: () => void;
}

export default function SupplementCard({
  icon,
  name,
  dosage,
  unit,
  timeTaken,
  category,
  onPress,
}: SupplementCardProps) {
  const getCategoryColor = () => {
    switch (category) {
      case 'nootropic': return colors.gradients.neuroplasticity.start;
      case 'performance': return colors.gradients.currentNeuroState.start;
      case 'recovery': return colors.gradients.sleepConsolidation.start;
      default: return colors.text.tertiary;
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.dosage}>{dosage}{unit}</Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.time}>{timeTaken}</Text>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor() + '15' }]}>
            <Text style={[styles.categoryText, { color: getCategoryColor() }]}>
              {category}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.5)',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  name: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  dosage: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  time: {
    fontSize: typography.sizes.caption,
    color: colors.text.secondary,
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: typography.sizes.tiny,
    fontWeight: typography.weights.bold,
  },
});
