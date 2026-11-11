
import { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from 'expo-router';

import {
  getAllPets,
  getAllHealthRecords,
  addHealthRecordToDatabase,
  deleteHealthRecordFromDatabase,
  type HealthRecord,
} from '@/database/petDatabase';

type Pet = {
  id: number;
  name: string;
};

export default function HealthRecordsScreen() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [selectedPet, setSelectedPet] = useState<number | null>(null);
  const [recordType, setRecordType] = useState('Vaccination');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [showForm, setShowForm] = useState(false);

  const loadData = () => {
    setPets(getAllPets());
    setRecords(getAllHealthRecords());
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const addRecord = () => {
    if (!selectedPet || !date.trim() || !description.trim()) {
      Alert.alert(
        'Missing Information',
        'Please select a pet and enter the date and description.'
      );
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
      Alert.alert('Invalid Date', 'Enter date as YYYY-MM-DD.');
      return;
    }

    addHealthRecordToDatabase(
      selectedPet,
      recordType,
      date.trim(),
      description.trim(),
      notes.trim()
    );

    setDate('');
    setDescription('');
    setNotes('');
    setShowForm(false);
    loadData();

    Alert.alert('Success', 'Health record added successfully.');
  };

  const deleteRecord = (id: number) => {
    Alert.alert(
      'Delete Record',
      'Are you sure you want to delete this health record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteHealthRecordFromDatabase(id);
            loadData();
          },
        },
      ]
    );
  };

  const filteredRecords = selectedPet
    ? records.filter((record) => record.petId === selectedPet)
    : records;

  const renderRecord = ({ item }: { item: HealthRecord }) => (
    <View style={styles.recordCard}>
      <Text style={styles.petName}>
        {item.petName ?? 'Unknown Pet'}
      </Text>

      <Text style={styles.recordType}>{item.recordType}</Text>
      <Text style={styles.detail}>Date: {item.date}</Text>
      <Text style={styles.detail}>
        Description: {item.description}
      </Text>

      {item.notes ? (
        <Text style={styles.detail}>Notes: {item.notes}</Text>
      ) : null}

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteRecord(item.id)}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Pet Health Records</Text>
      <Text style={styles.subtitle}>
        Manage your pets' health information
      </Text>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowForm(!showForm)}
      >
        <Text style={styles.addButtonText}>
          {showForm ? 'Cancel' : '+ Add Health Record'}
        </Text>
      </TouchableOpacity>

      {showForm && (
        <View style={styles.form}>
          <Text style={styles.label}>Select Pet</Text>

          {pets.length === 0 ? (
            <Text style={styles.detail}>
              Please add a pet first.
            </Text>
          ) : (
            pets.map((pet) => (
              <TouchableOpacity
                key={pet.id}
                style={[
                  styles.petOption,
                  selectedPet === pet.id && styles.selectedPet,
                ]}
                onPress={() => setSelectedPet(pet.id)}
              >
                <Text style={styles.petOptionText}>
                  {pet.name}
                </Text>
              </TouchableOpacity>
            ))
          )}

          <Text style={styles.label}>Record Type</Text>

          <View style={styles.typeContainer}>
            {['Vaccination', 'Checkup', 'Medicine'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  recordType === type && styles.selectedType,
                ]}
                onPress={() => setRecordType(type)}
              >
                <Text style={styles.typeText}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            placeholder="2026-11-11"
            value={date}
            onChangeText={setDate}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter health details"
            value={description}
            onChangeText={setDescription}
          />

          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Additional notes"
            value={notes}
            onChangeText={setNotes}
            multiline
          />

          <TouchableOpacity
            style={styles.saveButton}
            onPress={addRecord}
          >
            <Text style={styles.saveButtonText}>Save Record</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.sectionHeading}>Health History</Text>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedPet === null && styles.selectedType,
          ]}
          onPress={() => setSelectedPet(null)}
        >
          <Text style={styles.typeText}>All Pets</Text>
        </TouchableOpacity>

        {pets.map((pet) => (
          <TouchableOpacity
            key={pet.id}
            style={[
              styles.filterButton,
              selectedPet === pet.id && styles.selectedType,
            ]}
            onPress={() => setSelectedPet(pet.id)}
          >
            <Text style={styles.typeText}>{pet.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredRecords.length === 0 ? (
        <Text style={styles.emptyText}>
          No health records found.
        </Text>
      ) : (
        <FlatList
          data={filteredRecords}
          renderItem={renderRecord}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    padding: 18,
  },
  heading: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#25334A',
    marginTop: 15,
  },
  subtitle: {
    fontSize: 14,
    color: '#777',
    marginTop: 5,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#4B9B83',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  form: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#25334A',
    marginTop: 12,
    marginBottom: 7,
  },
  input: {
    backgroundColor: '#F3F5F7',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  notesInput: {
    minHeight: 75,
    textAlignVertical: 'top',
  },
  petOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 7,
  },
  selectedPet: {
    backgroundColor: '#E0F2EC',
    borderColor: '#4B9B83',
  },
  petOptionText: {
    color: '#25334A',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#F3F5F7',
  },
  selectedType: {
    backgroundColor: '#CDE9DF',
    borderColor: '#4B9B83',
    borderWidth: 1,
  },
  typeText: {
    color: '#25334A',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#25334A',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 18,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#25334A',
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  filterButton: {
    padding: 9,
    backgroundColor: '#F3F5F7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  recordCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#25334A',
  },
  recordType: {
    color: '#4B9B83',
    fontWeight: 'bold',
    marginTop: 5,
  },
  detail: {
    color: '#555',
    fontSize: 14,
    marginTop: 7,
  },
  deleteButton: {
    alignSelf: 'flex-end',
    padding: 9,
    marginTop: 8,
  },
  deleteText: {
    color: '#D9534F',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 25,
  },
});
