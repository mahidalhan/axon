import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing, shadows } from '../constants/designTokens';

interface GlassmorphicCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
}

export default function GlassmorphicCard({
  children,
  style,
  elevated = false,
}: GlassmorphicCardProps) {
  return (
    <View
      style={[
        styles.card,
        elevated && shadows.md,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.5)',
  },
});
