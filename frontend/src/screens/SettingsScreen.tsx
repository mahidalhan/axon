import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../components/Card';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const [selectedParticipant, setSelectedParticipant] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const participants = Array.from({ length: 20 }, (_, i) => i);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* App Info */}
        <Card>
          <View style={styles.appHeader}>
            <View style={styles.appIcon}>
              <Ionicons name="analytics" size={40} color="#4F46E5" />
            </View>
            <View style={styles.appInfo}>
              <Text style={styles.appName}>Brain Score</Text>
              <Text style={styles.appVersion}>Version 1.0.0</Text>
            </View>
          </View>
          <Text style={styles.appDescription}>
            Optimize your learning and cognitive performance using EEG analysis and sleep tracking.
          </Text>
        </Card>

        {/* Participant Selection */}
        <Text style={styles.sectionTitle}>EEG Session Data</Text>
        <Card>
          <Text style={styles.settingLabel}>Participant ID</Text>
          <Text style={styles.settingDescription}>
            Select which Muse EEG participant data to display (demo mode)
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.participantScroll}>
            {participants.map((id) => (
              <TouchableOpacity
                key={id}
                style={[
                  styles.participantChip,
                  selectedParticipant === id && styles.participantChipActive,
                ]}
                onPress={() => setSelectedParticipant(id)}
              >
                <Text
                  style={[
                    styles.participantText,
                    selectedParticipant === id && styles.participantTextActive,
                  ]}
                >
                  {id}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Card>

        {/* Preferences */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <Card>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setNotificationsEnabled(!notificationsEnabled)}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="notifications" size={24} color="#6366F1" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Notifications</Text>
                <Text style={styles.settingSubtitle}>Optimal window alerts</Text>
              </View>
            </View>
            <View
              style={[
                styles.toggle,
                notificationsEnabled && styles.toggleActive,
              ]}
            >
              <View
                style={[
                  styles.toggleKnob,
                  notificationsEnabled && styles.toggleKnobActive,
                ]}
              />
            </View>
          </TouchableOpacity>
        </Card>

        <Card>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="time" size={24} color="#10B981" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Optimal Window Threshold</Text>
                <Text style={styles.settingSubtitle}>LRI ≥70 (default)</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </Card>

        {/* Data & Privacy */}
        <Text style={styles.sectionTitle}>Data & Privacy</Text>
        <Card>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="download" size={24} color="#F59E0B" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Import Apple Health Data</Text>
                <Text style={styles.settingSubtitle}>Upload export.xml</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </Card>

        {/* About */}
        <Text style={styles.sectionTitle}>About</Text>
        <Card>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="information-circle" size={24} color="#6B7280" />
              <Text style={styles.settingTitle}>How It Works</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </Card>

        <Card>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="book" size={24} color="#6B7280" />
              <Text style={styles.settingTitle}>Research & References</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </Card>

        <Card>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="shield-checkmark" size={24} color="#6B7280" />
              <Text style={styles.settingTitle}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </Card>

        {/* Footer */}
        <Text style={styles.footer}>
          Made with neuroplasticity in mind
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  appIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  appVersion: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  appDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  participantScroll: {
    marginHorizontal: -4,
  },
  participantChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 4,
    minWidth: 48,
    alignItems: 'center',
  },
  participantChipActive: {
    backgroundColor: '#4F46E5',
  },
  participantText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  participantTextActive: {
    color: '#FFFFFF',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#10B981',
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
  footer: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
});
