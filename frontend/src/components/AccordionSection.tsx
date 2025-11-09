import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../constants/designTokens';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AccordionSectionProps {
  title: string;
  icon?: string;
  iconColor?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export default function AccordionSection({
  title,
  icon,
  iconColor = colors.gradients.neuroplasticity.start,
  children,
  defaultExpanded = false,
}: AccordionSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpanded}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          {icon && (
            <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
              <Ionicons name={icon as any} size={24} color={iconColor} />
            </View>
          )}
          <Text style={styles.title}>{title}</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color={colors.text.secondary}
        />
      </TouchableOpacity>

      {expanded && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.5)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  title: {
    fontSize: typography.sizes.h4,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingTop: 0,
  },
});
