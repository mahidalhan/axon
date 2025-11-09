import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { colors, typography, spacing, shadows } from '../constants/designTokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ScoreRingProps {
  value: number;
  label: string;
  subtitle: string;
  gradientColors: [string, string];
  size?: number;
  strokeWidth?: number;
  isPrimary?: boolean;
  onPress?: () => void;
}

export default function ScoreRing({
  value,
  label,
  subtitle,
  gradientColors,
  size = 100,
  strokeWidth = 8,
  isPrimary = false,
  onPress,
}: ScoreRingProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [value]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  const displaySize = isPrimary ? size * 1.2 : size;
  const displayStrokeWidth = isPrimary ? strokeWidth * 1.2 : strokeWidth;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.container, { width: displaySize, height: displaySize }]}
    >
      <View style={styles.svgContainer}>
        <Svg width={displaySize} height={displaySize}>
          <Defs>
            <LinearGradient
              id={`gradient-${label}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <Stop offset="0%" stopColor={gradientColors[0]} stopOpacity="1" />
              <Stop offset="100%" stopColor={gradientColors[1]} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          
          {/* Background circle */}
          <Circle
            cx={displaySize / 2}
            cy={displaySize / 2}
            r={radius}
            stroke="rgba(229, 231, 235, 0.3)"
            strokeWidth={displayStrokeWidth}
            fill="none"
          />
          
          {/* Progress circle */}
          <AnimatedCircle
            cx={displaySize / 2}
            cy={displaySize / 2}
            r={radius}
            stroke={`url(#gradient-${label})`}
            strokeWidth={displayStrokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            rotation="-90"
            origin={`${displaySize / 2}, ${displaySize / 2}`}
          />
        </Svg>
        
        {/* Center content */}
        <View style={styles.centerContent}>
          <Text style={[styles.value, isPrimary && styles.valuePrimary]}>
            {Math.round(value)}
          </Text>
        </View>
      </View>
      
      {/* Labels */}
      <View style={styles.labelsContainer}>
        <Text style={[styles.label, isPrimary && styles.labelPrimary]} numberOfLines={2}>
          {label}
        </Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.primary,
  },
  valuePrimary: {
    fontSize: 40,
  },
  labelsContainer: {
    marginTop: spacing.sm,
    alignItems: 'center',
    maxWidth: 120,
  },
  label: {
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 2,
  },
  labelPrimary: {
    fontSize: typography.sizes.bodySmall,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    fontSize: typography.sizes.tiny,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
