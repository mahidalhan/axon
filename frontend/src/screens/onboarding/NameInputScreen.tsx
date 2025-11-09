import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../constants/designTokens';
import { useOnboarding } from '../../contexts/OnboardingContext';

interface NameInputScreenProps {
  navigation: any;
}

export default function NameInputScreen({ navigation }: NameInputScreenProps) {
  const { setUserName } = useOnboarding();
  const [name, setName] = useState('');

  const handleContinue = () => {
    if (name.trim()) {
      setUserName(name.trim());
      navigation.navigate('ScoreEducation1');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
            {/* Progress */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '28%' }]} />
              </View>
              <Text style={styles.progressText}>2 of 7</Text>
            </View>

            {/* Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="person" size={60} color={colors.gradients.neuroplasticity.start} />
            </View>

            {/* Title */}
            <Text style={styles.title}>What's your first name?</Text>
            <Text style={styles.subtitle}>(e.g. John)</Text>

            {/* Input */}
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={colors.text.tertiary}
              autoFocus={true}
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />

            <View style={{ flex: 1 }} />

            {/* CTA Button */}
            <TouchableOpacity
              style={[
                styles.ctaButton,
                !name.trim() && styles.ctaButtonDisabled,
              ]}
              onPress={handleContinue}
              disabled={!name.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.ctaText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  progressContainer: {
    marginBottom: spacing.xxxl,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(229, 231, 235, 0.3)',
    borderRadius: 2,
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: 4,
    backgroundColor: colors.gradients.neuroplasticity.start,
    borderRadius: 2,
  },
  progressText: {
    fontSize: typography.sizes.caption,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.gradients.neuroplasticity.start + '15',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.h2,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.bodySmall,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  input: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: colors.gradients.neuroplasticity.start,
  },
  ctaButton: {
    backgroundColor: colors.text.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  ctaButtonDisabled: {
    backgroundColor: colors.text.tertiary,
    opacity: 0.5,
  },
  ctaText: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
});
