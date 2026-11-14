
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
import { Calendar } from 'react-native-calendars';

import {
  initDatabase,
  addReminderToDatabase,
  getAllReminders,
  deleteReminderFromDatabase,
  getReminderNotificationId,
  updateReminderCompletion,
} from '../database/petDatabase';

import * as Notifications from 'expo-notifications';

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
  notificationId: string | null;
  completed: number;
};

const getToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export default function RemindersScreen() {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(getToday());
  const [time, setTime] = useState('');
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [reminders, setReminders] = useState<Reminder[]>([]);

  const loadReminders = () => {
    try {
      initDatabase();
      setReminders(getAllReminders());
    } catch (error) {
      Alert.alert('Error', 'Unable to load reminders.');
      console.log(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadReminders();
    }, [])
  );

  // Add reminder
  const addReminder = async () => {
    if (!title.trim() || !date.trim() || !time.trim()) {
      Alert.alert('Missing Details', 'Please enter all details.');
      return;
    }

    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!timePattern.test(time.trim())) {
      Alert.alert(
        'Invalid Time',
        'Please enter time in 24-hour format, such as 08:30 or 18:45.'
      );
      return;
    }

    const reminderDate = new Date(
      `${date.trim()}T${time.trim()}:00`
    );

    if (
      isNaN(reminderDate.getTime()) ||
      reminderDate <= new Date()
    ) {
      Alert.alert(
        'Invalid Date or Time',
        'Please select a valid future date and time.'
      );
      return;
    }

    try {
      const permission =
        await Notifications.requestPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow notifications to receive pet reminders.'
        );
        return;
      }

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

      addReminderToDatabase(
        title.trim(),
        date.trim(),
        time.trim(),
        notificationId
      );

      setTitle('');
      setTime('');
      setSelectedDate(date.trim());

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

  // Mark reminder as completed
  const toggleCompletion = (id: number, completed: number) => {
    try {
      updateReminderCompletion(id, completed === 0);
      loadReminders();
    } catch (error) {
      Alert.alert('Error', 'Unable to update reminder status.');
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
              const notificationId =
                getReminderNotificationId(id);

              if (notificationId) {
                await Notifications.cancelScheduledNotificationAsync(
                  notificationId
                );
              }

              deleteReminderFromDatabase(id);
              loadReminders();

              Alert.alert(
                'Deleted',
                'Reminder deleted successfully.'
              );
            } catch (error) {
              Alert.alert(
                'Error',
                'Unable to delete reminder.'
              );
              console.log(error);
            }
          },
        },
      ]
    );
  };

  // Filter reminders by selected date
  const filteredReminders = reminders.filter(
    (item) => item.date === selectedDate
  );

  // Mark dates containing reminders
  const markedDates: {
    [key: string]: {
      selected?: boolean;
      selectedColor?: string;
      marked?: boolean;
      dotColor?: string;
    };
  } = {};

  reminders.forEach((item) => {
    markedDates[item.date] = {
      ...markedDates[item.date],
      marked: true,
      dotColor: '#347A55',
    };
  });

  markedDates[selectedDate] = {
    ...markedDates[selectedDate],
    selected: true,
    selectedColor: '#347A55',
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Pet Reminders</Text>

      <Text style={styles.subtitle}>
        Never miss your pet's important care activities
      </Text>

      <View style={styles.form}>
        <Text style={styles.formHeading}>Add New Reminder</Text>

        {/* Select Date - Calendar First */}
        <Text style={styles.label}>Select Date</Text>

        <Calendar
          current={date}
          onDayPress={(day) => {
            setDate(day.dateString);
            setSelectedDate(day.dateString);
          }}
          markedDates={markedDates}
          theme={{
            todayTextColor: '#347A55',
            arrowColor: '#347A55',
            selectedDayBackgroundColor: '#347A55',
            selectedDayTextColor: '#FFFFFF',
            textMonthFontWeight: 'bold',
            textDayFontSize: 14,
          }}
        />

        <Text style={styles.selectedDate}>
          Selected Date: {date}
        </Text>

        {/* Reminder Name and Time */}
        <View style={styles.inputRow}>
          <View style={styles.inputColumn}>
            <Text style={styles.label}>Reminder Name</Text>

            <TextInput
              style={styles.input}
              placeholder="e.g. Feeding"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputColumn}>
            <Text style={styles.label}>Time</Text>

            <TextInput
              style={styles.input}
              placeholder="HH:MM"
              value={time}
              onChangeText={setTime}
            />
          </View>
        </View>

        {/* Add Reminder Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={addReminder}
        >
          <Text style={styles.buttonText}>
            Add Reminder
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.heading}>
        Reminders for Selected Date
      </Text>

      <Text style={styles.dateSubtitle}>
        {selectedDate}
      </Text>

      {filteredReminders.length === 0 ? (
        <Text style={styles.empty}>
          No reminders for this date.
        </Text>
      ) : (
        filteredReminders.map((item) => (
          <View
            key={item.id}
            style={styles.reminderCard}
          >
            <Text
              style={[
                styles.reminderName,
                item.completed === 1 && styles.completedName,
              ]}
            >
              {item.title}
            </Text>

            <Text>Date: {item.date}</Text>
            <Text>Time: {item.time}</Text>

            <TouchableOpacity
              style={styles.completionRow}
              onPress={() =>
                toggleCompletion(item.id, item.completed)
              }
            >
              <View
                style={[
                  styles.checkbox,
                  item.completed === 1 && styles.checkedBox,
                ]}
              >
                {item.completed === 1 && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>

              <Text
                style={[
                  styles.completionText,
                  item.completed === 1 && styles.completedText,
                ]}
              >
                {item.completed === 1
                  ? 'Completed'
                  : 'Mark as Completed'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteReminder(item.id)}
            >
              <Text style={styles.deleteText}>Delete</Text>
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
  },

  content: {
    padding: 20,
    paddingBottom: 40,
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

  formHeading: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#285943',
    marginBottom: 10,
  },

  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },

  inputColumn: {
    flex: 1,
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 7,
    marginTop: 15,
    color: '#333',
  },

  input: {
    borderWidth: 1,
    borderColor: '#D5DED5',
    borderRadius: 9,
    padding: 12,
    fontSize: 15,
  },

  selectedDate: {
    color: '#347A55',
    fontWeight: '600',
    marginTop: 10,
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
    marginBottom: 5,
  },

  dateSubtitle: {
    color: '#347A55',
    marginBottom: 12,
    fontWeight: '600',
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

  completedName: {
    textDecorationLine: 'line-through',
    color: '#888',
  },

  completionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },

  checkbox: {
    width: 23,
    height: 23,
    borderWidth: 1.5,
    borderColor: '#347A55',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkedBox: {
    backgroundColor: '#347A55',
  },

  checkmark: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },

  completionText: {
    marginLeft: 10,
    color: '#347A55',
    fontWeight: '600',
  },

  completedText: {
    color: '#777',
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
