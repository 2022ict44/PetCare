
import { useState, useCallback } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';

import {
  initDatabase,
  addReminderToDatabase,
  getAllReminders,
  deleteReminderFromDatabase,
  getReminderNotificationId,
} from '../database/petDatabase';

import * as Notifications from 'expo-notifications';

// Notification display settings
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

type Reminder = {
  id: number;
  title: string;
  date: string;
  time: string;
};

export default function RemindersScreen() {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reminders, setReminders] = useState<Reminder[]>([]);

  // Load reminders from SQLite database
  const loadReminders = () => {
    try {
      initDatabase();
      setReminders(getAllReminders());
    } catch (error) {
      Alert.alert('Error', 'Unable to load reminders.');
      console.log(error);
    }
  };

  // Load reminders when screen opens
  useFocusEffect(
    useCallback(() => {
      loadReminders();
    }, [])
  );

  // Add a new reminder
  const addReminder = async () => {
    if (!title.trim() || !date.trim() || !time.trim()) {
      Alert.alert(
        'Missing Details',
        'Please enter all details.'
      );
      return;
    }

    // Validate date format: YYYY-MM-DD
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    // Validate time format: HH:MM (24-hour format)
    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!datePattern.test(date.trim())) {
      Alert.alert(
        'Invalid Date',
        'Please enter date in YYYY-MM-DD format.'
      );
      return;
    }

    if (!timePattern.test(time.trim())) {
      Alert.alert(
        'Invalid Time',
        'Please enter time in 24-hour format, such as 08:30 or 18:45.'
      );
      return;
    }

    // Create reminder date and time
    const reminderDate = new Date(
      `${date.trim()}T${time.trim()}:00`
    );

    // Check whether the date and time are valid and in the future
    if (
      isNaN(reminderDate.getTime()) ||
      reminderDate <= new Date()
    ) {
      Alert.alert(
        'Invalid Date or Time',
        'Please enter a valid future date and time.'
      );
      return;
    }

    try {
      // Request notification permission
      const permission =
        await Notifications.requestPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow notifications to receive pet reminders.'
        );
        return;
      }

      // Schedule local notification
      
const notificationId =
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'PetCare Reminder 🐾',
      body: title.trim(),
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderDate,
    },
  });

      // Save reminder to SQLite database
      addReminderToDatabase(
  title.trim(),
  date.trim(),
  time.trim(),
  notificationId
);

      // Clear input fields
      setTitle('');
      setDate('');
      setTime('');

      // Refresh reminder list
      loadReminders();

      Alert.alert(
        'Success',
        'Reminder saved and notification scheduled!'
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Unable to save or schedule reminder.'
      );
      console.log(error);
    }
  };

  // Delete reminder
  
const deleteReminder = (id: number) => {
  Alert.alert(
    'Delete Reminder',
    'Are you sure you want to delete this reminder?',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            // Get notification ID from database
            const notificationId =
              getReminderNotificationId(id);

            // Cancel scheduled notification
            if (notificationId) {
              await Notifications.cancelScheduledNotificationAsync(
                notificationId
              );
            }

            // Delete reminder from database
            deleteReminderFromDatabase(id);

            // Refresh reminder list
            loadReminders();

            Alert.alert(
              'Deleted',
              'Reminder and notification deleted successfully.'
            );
          } catch (error) {
            Alert.alert(
              'Error',
              'Unable to delete reminder or notification.'
            );

            console.log(error);
          }
        },
      },
    ]
  );
};

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Pet Reminders</Text>

      <Text style={styles.subtitle}>
        Never miss your pet's important care activities
      </Text>

      <View style={styles.form}>
        <Text style={styles.label}>Reminder Name</Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. Feeding, Medicine, Vet Visit"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Date</Text>

        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={date}
          onChangeText={setDate}
        />

        <Text style={styles.label}>Time</Text>

        <TextInput
          style={styles.input}
          placeholder="HH:MM (24-hour format)"
          value={time}
          onChangeText={setTime}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={addReminder}
        >
          <Text style={styles.buttonText}>
            Add Reminder
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.heading}>My Reminders</Text>

      {reminders.length === 0 ? (
        <Text style={styles.empty}>
          No reminders added yet.
        </Text>
      ) : (
        reminders.map((item) => (
          <View
            key={item.id}
            style={styles.reminderCard}
          >
            <Text style={styles.reminderName}>
              {item.title}
            </Text>

            <Text>Date: {item.date}</Text>

            <Text>Time: {item.time}</Text>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteReminder(item.id)}
            >
              <Text style={styles.deleteText}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8F5',
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#285943',
    marginTop: 20,
  },

  subtitle: {
    fontSize: 15,
    color: '#666',
    marginTop: 5,
    marginBottom: 20,
  },

  form: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 15,
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 7,
    marginTop: 10,
    color: '#333',
  },

  input: {
    borderWidth: 1,
    borderColor: '#D5DED5',
    borderRadius: 9,
    padding: 12,
    fontSize: 15,
  },

  button: {
    backgroundColor: '#347A55',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  heading: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#285943',
    marginTop: 25,
    marginBottom: 12,
  },

  empty: {
    color: '#777',
    textAlign: 'center',
    marginTop: 15,
  },

  reminderCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },

  reminderName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#347A55',
    marginBottom: 7,
  },

  deleteButton: {
    backgroundColor: '#FCE8E8',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },

  deleteText: {
    color: '#C62828',
    fontWeight: 'bold',
  },
});
