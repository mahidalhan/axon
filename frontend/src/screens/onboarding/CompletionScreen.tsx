import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useOnboarding } from '../../contexts/OnboardingContext';

interface CompletionScreenProps {
  navigation: any;
}

export default function CompletionScreen({ navigation }: CompletionScreenProps) {
  const { completeOnboarding, userName } = useOnboarding();

  const handleStart = async () => {
    await completeOnboarding();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={100} color="#10B981" />
        </View>

        <Text style={styles.title}>
          Nice to meet you, {userName || 'there'}!
        </Text>
        
        <Text style={styles.subtitle}>
          AXON is your brain companion, helping you identify and maximize your peak cognitive windows.
        </Text>

        <View style={styles.featuresContainer}>
          <View style={styles.featureRow}>
            <Ionicons name="flash" size={24} color="#F59E0B" />
            <Text style={styles.featureText}>Track real-time brain states</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="analytics" size={24} color="#6366F1" />
            <Text style={styles.featureText}>Optimize timing with science</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="moon" size={24} color="#06B6D4" />
            <Text style={styles.featureText}>Improve sleep consolidation</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleStart}
        >
          <Text style={styles.ctaText}>Start Using AXON</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
  },
  featuresContainer: {
    gap: 16,
    width: '100%',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  featureText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  footer: {
    padding: 24,
  },
  ctaButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
