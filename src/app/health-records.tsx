
import { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
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
  type: string;
  breed: string;
  age: string;
};

const checkupTypes = [
  'General Checkup',
  'Dental Checkup',
  'Eye Checkup',
  'Skin Checkup',
  'Ear Checkup',
  'Other',
];

export default function HealthRecordsScreen() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [records, setRecords] = useState<HealthRecord[]>([]);

  // Selected pet profile
  const [activePetId, setActivePetId] = useState<number | null>(null);

  // Pet selected for adding a record
  const [selectedPet, setSelectedPet] = useState<number | null>(null);

  const [recordType, setRecordType] = useState('Vaccination');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  const [selectedCheckup, setSelectedCheckup] = useState('');
  const [otherCheckup, setOtherCheckup] = useState('');
  const [showCheckupOptions, setShowCheckupOptions] = useState(false);
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

  const activePet = pets.find((pet) => pet.id === activePetId);

  const petRecords = activePetId
    ? records.filter((record) => record.petId === activePetId)
    : [];

  const resetForm = () => {
    setSelectedPet(null);
    setDate('');
    setDescription('');
    setNotes('');
    setSelectedCheckup('');
    setOtherCheckup('');
    setShowCheckupOptions(false);
  };

  const changeRecordType = (type: string) => {
    setRecordType(type);
    setDescription('');
    setNotes('');
    setSelectedCheckup('');
    setOtherCheckup('');
    setShowCheckupOptions(false);
  };

  const addRecord = () => {
    if (!selectedPet) {
      Alert.alert('Missing Information', 'Please select a pet.');
      return;
    }

    if (!date.trim()) {
      Alert.alert('Missing Information', 'Please enter the date.');
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
      Alert.alert('Invalid Date', 'Enter date as YYYY-MM-DD.');
      return;
    }

    let finalDescription = description.trim();

    if (recordType === 'Checkup') {
      if (!selectedCheckup) {
        Alert.alert(
          'Missing Information',
          'Please select a checkup type.'
        );
        return;
      }

      finalDescription =
        selectedCheckup === 'Other'
          ? otherCheckup.trim()
          : selectedCheckup;

      if (!finalDescription) {
        Alert.alert(
          'Missing Information',
          'Please enter the checkup type.'
        );
        return;
      }
    } else if (!finalDescription) {
      Alert.alert(
        'Missing Information',
        recordType === 'Vaccination'
          ? 'Please enter the vaccine name.'
          : 'Please enter the medicine name.'
      );
      return;
    }

    addHealthRecordToDatabase(
      selectedPet,
      recordType,
      date.trim(),
      finalDescription,
      notes.trim()
    );

    resetForm();
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

  const getDescriptionLabel = () => {
    if (recordType === 'Vaccination') return 'Vaccine Name';
    if (recordType === 'Medicine') return 'Medicine Name';
    return 'Checkup Type';
  };

  const getNotesLabel = () => {
    if (recordType === 'Vaccination') {
      return 'Notes (Situation after vaccination)';
    }

    if (recordType === 'Medicine') {
      return 'Notes (Situation after giving medicine)';
    }

    return 'Notes (Optional)';
  };

  const renderRecord = (item: HealthRecord) => {
    let descriptionLabel = 'Description';

    if (item.recordType === 'Vaccination') {
      descriptionLabel = 'Vaccine Name';
    } else if (item.recordType === 'Medicine') {
      descriptionLabel = 'Medicine Name';
    } else if (item.recordType === 'Checkup') {
      descriptionLabel = 'Checkup Type';
    }

    return (
      <View key={item.id} style={styles.recordCard}>
        <Text style={styles.recordType}>{item.recordType}</Text>

        <Text style={styles.detail}>Date: {item.date}</Text>

        <Text style={styles.detail}>
          {descriptionLabel}: {item.description}
        </Text>

        {item.notes ? (
          <Text style={styles.detail}>
            {item.recordType === 'Vaccination'
              ? 'Situation after vaccination'
              : item.recordType === 'Medicine'
              ? 'Situation after giving medicine'
              : 'Notes'}: {item.notes}
          </Text>
        ) : null}

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteRecord(item.id)}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Pet Health Records</Text>

      <Text style={styles.subtitle}>
        View and manage each pet's health information
      </Text>

      {activePetId === null ? (
        <>
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
              <Text style={styles.formHeading}>Add Health Record</Text>

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
                    onPress={() => changeRecordType(type)}
                  >
                    <Text style={styles.typeText}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Date (YYYY-MM-DD)</Text>

              <TextInput
                style={styles.input}
                placeholder="2026-11-14"
                value={date}
                onChangeText={setDate}
              />

              {recordType === 'Checkup' ? (
                <>
                  <Text style={styles.label}>Checkup Type</Text>

                  <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() =>
                      setShowCheckupOptions(!showCheckupOptions)
                    }
                  >
                    <Text style={styles.dropdownText}>
                      {selectedCheckup || 'Select Checkup Type'}
                    </Text>
                    <Text style={styles.dropdownArrow}>
                      {showCheckupOptions ? '▲' : '▼'}
                    </Text>
                  </TouchableOpacity>

                  {showCheckupOptions && (
                    <View style={styles.dropdownOptions}>
                      {checkupTypes.map((type) => (
                        <TouchableOpacity
                          key={type}
                          style={styles.dropdownOption}
                          onPress={() => {
                            setSelectedCheckup(type);
                            setOtherCheckup('');
                            setShowCheckupOptions(false);
                          }}
                        >
                          <Text style={styles.dropdownOptionText}>
                            {type}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {selectedCheckup === 'Other' && (
                    <>
                      <Text style={styles.label}>
                        Enter Other Checkup Type
                      </Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter checkup type"
                        value={otherCheckup}
                        onChangeText={setOtherCheckup}
                      />
                    </>
                  )}
                </>
              ) : (
                <>
                  <Text style={styles.label}>
                    {getDescriptionLabel()}
                  </Text>

                  <TextInput
                    style={styles.input}
                    placeholder={
                      recordType === 'Vaccination'
                        ? 'Enter vaccine name'
                        : 'Enter medicine name'
                    }
                    value={description}
                    onChangeText={setDescription}
                  />
                </>
              )}

              <Text style={styles.label}>{getNotesLabel()}</Text>

              <TextInput
                style={[styles.input, styles.notesInput]}
                placeholder={
                  recordType === 'Vaccination'
                    ? 'Describe the pet situation after vaccination'
                    : recordType === 'Medicine'
                    ? 'Describe the pet situation after giving medicine'
                    : 'Additional notes (optional)'
                }
                value={notes}
                onChangeText={setNotes}
                multiline
              />

              <TouchableOpacity
                style={styles.saveButton}
                onPress={addRecord}
              >
                <Text style={styles.saveButtonText}>
                  Save Record
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.sectionHeading}>
            Select a Pet Profile
          </Text>

          {pets.length === 0 ? (
            <Text style={styles.emptyText}>
              No pets added yet. Please add a pet first.
            </Text>
          ) : (
            pets.map((pet) => {
              const count = records.filter(
                (record) => record.petId === pet.id
              ).length;

              return (
                <TouchableOpacity
                  key={pet.id}
                  style={styles.profileCard}
                  onPress={() => setActivePetId(pet.id)}
                >
                  <View style={styles.profileIcon}>
                    <Text style={styles.profileIconText}>
                      {pet.type.toLowerCase().includes('cat')
                        ? '🐱'
                        : pet.type.toLowerCase().includes('dog')
                        ? '🐶'
                        : '🐾'}
                    </Text>
                  </View>

                  <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>
                      {pet.name}
                    </Text>
                    <Text style={styles.profileDetails}>
                      {pet.type}
                      {pet.breed ? ` • ${pet.breed}` : ''}
                    </Text>
                    <Text style={styles.profileCount}>
                      {count} Health Record{count !== 1 ? 's' : ''}
                    </Text>
                  </View>

                  <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>
              );
            })
          )}
        </>
      ) : (
        <>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setActivePetId(null);
              setShowForm(false);
            }}
          >
            <Text style={styles.backButtonText}>
              ‹ Back to All Pets
            </Text>
          </TouchableOpacity>

          {activePet && (
            <View style={styles.petProfile}>
              <View style={styles.largeProfileIcon}>
                <Text style={styles.largeProfileIconText}>
                  {activePet.type.toLowerCase().includes('cat')
                    ? '🐱'
                    : activePet.type.toLowerCase().includes('dog')
                    ? '🐶'
                    : '🐾'}
                </Text>
              </View>

              <Text style={styles.profileTitle}>
                {activePet.name}
              </Text>

              <Text style={styles.profileDetails}>
                {activePet.type}
              </Text>

              <Text style={styles.detail}>
                Breed: {activePet.breed || 'Not specified'}
              </Text>

              <Text style={styles.detail}>
                Age: {activePet.age || 'Not specified'}
              </Text>

              <Text style={styles.profileCount}>
                {petRecords.length} Health Record
                {petRecords.length !== 1 ? 's' : ''}
              </Text>
            </View>
          )}

          <Text style={styles.sectionHeading}>
            {activePet?.name}'s Health History
          </Text>

          {petRecords.length === 0 ? (
            <Text style={styles.emptyText}>
              No health records found for this pet.
            </Text>
          ) : (
            petRecords.map(renderRecord)
          )}
        </>
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
  formHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#25334A',
    marginBottom: 8,
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
  dropdown: {
    backgroundColor: '#F3F5F7',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    color: '#25334A',
    fontSize: 14,
  },
  dropdownArrow: {
    color: '#25334A',
  },
  dropdownOptions: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 5,
    overflow: 'hidden',
  },
  dropdownOption: {
    padding: 13,
    backgroundColor: '#F7F8FA',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownOptionText: {
    color: '#25334A',
    fontSize: 14,
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
    marginTop: 10,
  },
  profileCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIcon: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: '#E0F2EC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIconText: {
    fontSize: 28,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 13,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#25334A',
  },
  profileDetails: {
    fontSize: 13,
    color: '#777',
    marginTop: 4,
  },
  profileCount: {
    fontSize: 13,
    color: '#4B9B83',
    fontWeight: '600',
    marginTop: 6,
  },
  arrow: {
    fontSize: 28,
    color: '#4B9B83',
    marginLeft: 8,
  },
  backButton: {
    paddingVertical: 12,
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B9B83',
  },
  petProfile: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  largeProfileIcon: {
    width: 85,
    height: 85,
    borderRadius: 43,
    backgroundColor: '#E0F2EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  largeProfileIconText: {
    fontSize: 45,
  },
  profileTitle: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#25334A',
    marginBottom: 4,
  },
  recordCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  recordType: {
    color: '#4B9B83',
    fontWeight: 'bold',
    fontSize: 16,
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
    marginBottom: 20,
  },
});
