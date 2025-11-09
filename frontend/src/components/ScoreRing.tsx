import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Stop,
  G,
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
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: value,
      duration: 1200,
      useNativeDriver: true,
    }).start();
  }, [value]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  const displaySize = isPrimary ? size * 1.2 : size;
  const displayStrokeWidth = isPrimary ? strokeWidth * 1.25 : strokeWidth;
  const displayRadius = (displaySize - displayStrokeWidth) / 2;

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      style={[styles.container, { width: displaySize + 20, height: displaySize + 40 }]}
    >
      <Animated.View 
        style={[
          styles.ringContainer,
          { transform: [{ scale: scaleAnim }] },
          isPrimary && shadows.glow(gradientColors[1]),
        ]}
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
              r={displayRadius}
              stroke="rgba(229, 231, 235, 0.3)"
              strokeWidth={displayStrokeWidth}
              fill="none"
            />
            
            {/* Progress circle with gradient */}
            <G rotation="-90" origin={`${displaySize / 2}, ${displaySize / 2}`}>
              <AnimatedCircle
                cx={displaySize / 2}
                cy={displaySize / 2}
                r={displayRadius}
                stroke={`url(#gradient-${label})`}
                strokeWidth={displayStrokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </G>
          </Svg>
          
          {/* Center content */}
          <View style={styles.centerContent}>
            <Text style={[styles.value, isPrimary && styles.valuePrimary]}>
              {Math.round(value)}
            </Text>
          </View>
        </View>
      </Animated.View>
      
      {/* Labels with proper text wrapping */}
      <View style={styles.labelsContainer}>
        <Text 
          style={[styles.label, isPrimary && styles.labelPrimary]} 
          numberOfLines={2}
          adjustsFontSizeToFit={true}
          minimumFontScale={0.85}
        >
          {label}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  ringContainer: {
    position: 'relative',
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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  value: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  valuePrimary: {
    fontSize: 44,
  },
  labelsContainer: {
    marginTop: spacing.md,
    alignItems: 'center',
    width: 110,
    paddingHorizontal: spacing.xs,
  },
  label: {
    fontSize: typography.sizes.bodySmall,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 16,
  },
  labelPrimary: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    lineHeight: 18,
  },
  subtitle: {
    fontSize: typography.sizes.tiny,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 14,
  },
});
