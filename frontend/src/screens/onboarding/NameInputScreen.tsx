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
import { useOnboarding } from '../../contexts/OnboardingContext';

interface NameInputScreenProps {
  navigation: any;
}

export default function NameInputScreen({ navigation }: NameInputScreenProps) {
  const { setUserName } = useOnboarding();
  const [name, setName] = useState('');

  const handleContinue = async () => {
    if (name.trim()) {
      await setUserName(name.trim());
      navigation.navigate('Completion');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Iconicons name="person" size={60} color="#6366F1" />
            </View>

            <Text style={styles.title}>What's your first name?</Text>
            <Text style={styles.subtitle}>(e.g. John)</Text>

            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="#9CA3AF"
              autoFocus={true}
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />

            <View style={{ flex: 1 }} />

            <TouchableOpacity
              style={[
                styles.ctaButton,
                !name.trim() && styles.ctaButtonDisabled,
              ]}
              onPress={handleContinue}
              disabled={!name.trim()}
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
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    fontSize: 20,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#6366F1',
  },
  ctaButton: {
    backgroundColor: '#1F2937',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  ctaButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.5,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
