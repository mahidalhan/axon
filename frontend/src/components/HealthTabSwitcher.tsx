import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../constants/designTokens';

interface HealthTabSwitcherProps {
  tabs: string[];
  activeTab: number;
  onTabChange: (index: number) => void;
}

export default function HealthTabSwitcher({ tabs, activeTab, onTabChange }: HealthTabSwitcherProps) {
  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={tab}
          style={[
            styles.tab,
            activeTab === index && styles.tabActive,
          ]}
          onPress={() => onTabChange(index)}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.tabText,
            activeTab === index && styles.tabTextActive,
          ]}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    padding: 4,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: colors.background.secondary,
  },
  tabText: {
    fontSize: typography.sizes.bodySmall,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: colors.text.primary,
  },
});
