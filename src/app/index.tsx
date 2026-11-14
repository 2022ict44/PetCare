
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import {
  initDatabase,
  getAllPets,
  getAllGuides,
  getAllReminders,
  getAllHealthRecords,
} from '../database/petDatabase';

export default function HomeScreen() {
  const [petCount, setPetCount] = useState(0);
  const [guideCount, setGuideCount] = useState(0);
  const [reminderCount, setReminderCount] = useState(0);
  const [healthRecordCount, setHealthRecordCount] = useState(0);

  // Load dashboard counts from SQLite
  const loadDashboard = () => {
    try {
      initDatabase();

      const pets = getAllPets();
      const guides = getAllGuides();
      const reminders = getAllReminders();
      const healthRecords = getAllHealthRecords();

      setPetCount(pets.length);
      setGuideCount(guides.length);
      setReminderCount(reminders.length);
      setHealthRecordCount(healthRecords.length);
    } catch (error) {
      console.log('Unable to load dashboard:', error);
    }
  };

  // Refresh counts whenever Home screen opens
  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>Welcome to</Text>
            <Text style={styles.appName}>PetCare 🐾</Text>
          </View>

          <Text style={styles.profile}>🐶</Text>
        </View>

        {/* Introduction */}
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>
            Happy Pets, Happy Life!
          </Text>

          <Text style={styles.bannerText}>
            Take care of your lovely pets every day.
          </Text>

          <Text style={styles.bannerEmoji}>
            🐕 🐈
          </Text>
        </View>

        {/* Summary */}
        <Text style={styles.sectionTitle}>
          My Overview
        </Text>

        <View style={styles.summaryContainer}>

          {/* Pet Count */}
          <View style={styles.summaryCard}>
            <Text style={styles.cardEmoji}>🐾</Text>
            <Text style={styles.cardNumber}>{petCount}</Text>
            <Text style={styles.cardLabel}>My Pets</Text>
          </View>

          {/* Pet Guide Count */}
          <View style={styles.summaryCard}>
            <Text style={styles.cardEmoji}>📖</Text>
            <Text style={styles.cardNumber}>{guideCount}</Text>
            <Text style={styles.cardLabel}>Pet Guides</Text>
          </View>

        </View>

        {/* Reminder Summary */}
        <View style={styles.reminderSummary}>
          <Text style={styles.reminderEmoji}>🔔</Text>

          <View>
            <Text style={styles.reminderTitle}>
              My Reminders
            </Text>

            <Text style={styles.reminderNumber}>
              {reminderCount} reminders saved
            </Text>
          </View>
        </View>

        {/* Health Records Summary */}
        <View style={styles.reminderSummary}>
          <Text style={styles.reminderEmoji}>🏥</Text>

          <View>
            <Text style={styles.reminderTitle}>
              Total Health Records
            </Text>

            <Text style={styles.reminderNumber}>
              {healthRecordCount} health records saved
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Made with ❤️ for your lovely pets
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F2',
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 25,
  },

  welcome: {
    fontSize: 16,
    color: '#777',
  },

  appName: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#386641',
  },

  profile: {
    fontSize: 38,
  },

  banner: {
    backgroundColor: '#386641',
    padding: 22,
    borderRadius: 20,
    marginBottom: 25,
  },

  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },

  bannerText: {
    color: '#E8F5E9',
    fontSize: 14,
    marginTop: 8,
  },

  bannerEmoji: {
    fontSize: 35,
    marginTop: 15,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },

  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 15,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
  },

  cardEmoji: {
    fontSize: 28,
  },

  cardNumber: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#386641',
    marginTop: 8,
  },

  cardLabel: {
    color: '#777',
    marginTop: 5,
    fontSize: 13,
  },

  reminderSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    marginBottom: 25,
    elevation: 2,
  },

  reminderEmoji: {
    fontSize: 30,
    marginRight: 15,
  },

  reminderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },

  reminderNumber: {
    fontSize: 13,
    color: '#777',
    marginTop: 5,
  },

  footer: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
    marginBottom: 25,
    fontSize: 13,
  },
});
