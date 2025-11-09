import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../components/Card';
import { Ionicons } from '@expo/vector-icons';

export default function AppleHealthImportScreen({ navigation }: any) {
  const [dataSources, setDataSources] = useState([
    {
      id: 1,
      name: "Apple Watch SE (40mm)",
      device: 'Apple Watch',
      lastSync: '14/09/25',
      icon: 'watch',
      color: '#EF4444',
      enabled: true,
    },
    {
      id: 2,
      name: 'iPhone 15',
      device: 'iPhone',
      lastSync: '14/09/25',
      icon: 'phone-portrait',
      color: '#6366F1',
      enabled: true,
    },
  ]);

  const [hideDataSources, setHideDataSources] = useState(false);

  const handleImport = () => {
    Alert.alert(
      'Apple Health Import',
      'In the full version, this will open Apple Health to authorize data access and import your sleep, workout, and HRV data.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sleep</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Data sources</Text>
          <TouchableOpacity>
            <Text style={styles.editButton}>Edit</Text>
          </TouchableOpacity>
        </View>

        {!hideDataSources && (
          <Card style={styles.dataSourcesCard}>
            {dataSources.map((source, index) => (
              <View
                key={source.id}
                style={[
                  styles.dataSourceItem,
                  index < dataSources.length - 1 && styles.dataSourceItemBorder,
                ]}
              >
                <View style={styles.dataSourceLeft}>
                  <Text style={styles.dataSourceNumber}>{source.id}</Text>
                  <View style={[styles.deviceIcon, { backgroundColor: source.color + '20' }]}>
                    <Ionicons name={source.icon as any} size={20} color={source.color} />
                  </View>
                  <View style={styles.dataSourceInfo}>
                    <Text style={styles.dataSourceName}>{source.name}</Text>
                    <Text style={styles.dataSourceDevice}>
                      {source.device} · {source.lastSync}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            ))}
          </Card>
        )}

        <TouchableOpacity
          style={styles.hideButton}
          onPress={() => setHideDataSources(!hideDataSources)}
        >
          <Text style={styles.hideButtonText}>
            {hideDataSources ? 'Show' : 'Hide'} data sources
          </Text>
          <View style={styles.hiddenBadge}>
            <Text style={styles.hiddenText}>
              {hideDataSources ? dataSources.length : 0} hidden
            </Text>
          </View>
          <Ionicons
            name={hideDataSources ? 'chevron-down' : 'chevron-up'}
            size={20}
            color="#6B7280"
          />
        </TouchableOpacity>

        <Text style={styles.dataSourceNote}>
          AXON grabs data from all the sources above. If there is a conflict, it will prioritize
          the sources in the listed order.
        </Text>

        <TouchableOpacity style={styles.importButton} onPress={handleImport}>
          <Ionicons name="heart" size={24} color="#FFFFFF" />
          <Text style={styles.importButtonText}>Connect Apple Health</Text>
        </TouchableOpacity>

        <Card>
          <Text style={styles.cardTitle}>What we import from Apple Health</Text>
          <View style={styles.importList}>
            <View style={styles.importItem}>
              <Ionicons name="bed" size={20} color="#6366F1" />
              <Text style={styles.importItemText}>Sleep data (duration, efficiency, stages)</Text>
            </View>
            <View style={styles.importItem}>
              <Ionicons name="heart" size={20} color="#EF4444" />
              <Text style={styles.importItemText}>Heart Rate Variability (HRV)</Text>
            </View>
            <View style={styles.importItem}>
              <Ionicons name="fitness" size={20} color="#10B981" />
              <Text style={styles.importItemText}>Workouts (type, duration, intensity)</Text>
            </View>
            <View style={styles.importItem}>
              <Ionicons name="pulse" size={20} color="#F59E0B" />
              <Text style={styles.importItemText}>Respiratory rate during sleep</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.privacyCard}>
          <View style={styles.privacyHeader}>
            <Ionicons name="shield-checkmark" size={24} color="#10B981" />
            <Text style={styles.privacyTitle}>Your data is private</Text>
          </View>
          <Text style={styles.privacyText}>
            All health data stays on your device. We only use it to calculate your brain score and
            provide insights. Nothing is shared with third parties.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  editButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
  },
  dataSourcesCard: {
    padding: 16,
  },
  dataSourceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dataSourceItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dataSourceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dataSourceNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
    width: 24,
  },
  deviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dataSourceInfo: {
    flex: 1,
  },
  dataSourceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  dataSourceDevice: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 2,
  },
  hideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  hideButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  hiddenBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  hiddenText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  dataSourceNote: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 24,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 24,
    gap: 12,
  },
  importButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  importList: {
    gap: 16,
  },
  importItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  importItemText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  privacyCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#065F46',
  },
  privacyText: {
    fontSize: 14,
    color: '#047857',
    lineHeight: 20,
  },
});
