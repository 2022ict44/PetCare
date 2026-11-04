
import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router';

import {
  initDatabase,
  addActivityToDatabase,
  getAllActivities,
  deleteActivityFromDatabase,
} from '../database/petDatabase';

type Activity = {
  id: number;
  activity: string;
  date: string;
  time: string;
};

export default function ActivitiesScreen() {
  const [activity, setActivity] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [activities, setActivities] = useState<Activity[]>([]);

  const loadActivities = () => {
    try {
      initDatabase();
      const data = getAllActivities();
      setActivities(data);
    } catch (error) {
      Alert.alert('Error', 'Unable to load activities.');
      console.log(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadActivities();
    }, [])
  );

  const addActivity = () => {
    if (!activity.trim() || !date.trim() || !time.trim()) {
      Alert.alert('Missing Details', 'Please enter all details.');
      return;
    }

    try {
      addActivityToDatabase(
        activity.trim(),
        date.trim(),
        time.trim()
      );

      setActivity('');
      setDate('');
      setTime('');

      loadActivities();

      Alert.alert('Success', 'Activity saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Unable to save activity.');
      console.log(error);
    }
  };

  const deleteActivity = (id: number) => {
    Alert.alert(
      'Delete Activity',
      'Are you sure you want to delete this activity?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            try {
              deleteActivityFromDatabase(id);
              loadActivities();
            } catch (error) {
              Alert.alert('Error', 'Unable to delete activity.');
              console.log(error);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Pet Activities</Text>
      <Text style={styles.subtitle}>
        Manage your pet's daily activities
      </Text>

      <View style={styles.form}>
        <Text style={styles.label}>Activity Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Feeding, Walking, Bathing"
          value={activity}
          onChangeText={setActivity}
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
          placeholder="e.g. 08:00 AM"
          value={time}
          onChangeText={setTime}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={addActivity}
        >
          <Text style={styles.buttonText}>Add Activity</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.heading}>My Activities</Text>

      {activities.length === 0 ? (
        <Text style={styles.empty}>
          No activities added yet.
        </Text>
      ) : (
        activities.map((item) => (
          <View key={item.id} style={styles.activityCard}>
            <View style={styles.cardContent}>
              <Text style={styles.activityName}>
                {item.activity}
              </Text>
              <Text>Date: {item.date}</Text>
              <Text>Time: {item.time}</Text>
            </View>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteActivity(item.id)}
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
  activityCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },
  cardContent: {
    gap: 5,
  },
  activityName: {
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
