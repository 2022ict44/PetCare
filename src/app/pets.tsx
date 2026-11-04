
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import {
  initDatabase,
  addPetToDatabase,
  getAllPets,
  deletePetFromDatabase,
} from '../database/petDatabase';

type Pet = {
  id: number;
  name: string;
  type: string;
  breed: string;
  age: string;
};

export default function PetsScreen() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petAge, setPetAge] = useState('');

  // Load pets from database
  const loadPets = () => {
    try {
      initDatabase();
      const savedPets = getAllPets();
      setPets(savedPets);
    } catch (error) {
      console.log('Database error:', error);
      Alert.alert('Error', 'Unable to load pets.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPets();
    }, [])
  );

  // Search and filter pets
  const filteredPets = pets.filter(pet => {
    const search = searchText.trim().toLowerCase();

    const matchesSearch =
      pet.name.toLowerCase().includes(search) ||
      pet.type.toLowerCase().includes(search) ||
      pet.breed.toLowerCase().includes(search);

    const matchesType =
      selectedType === 'All' ||
      (selectedType === 'Other'
        ? !['dog', 'cat', 'bird'].includes(
            pet.type.trim().toLowerCase()
          )
        : pet.type.trim().toLowerCase() ===
          selectedType.toLowerCase());

    return matchesSearch && matchesType;
  });

  // Add a new pet
  const addPet = () => {
    if (!petName.trim() || !petType.trim()) {
      Alert.alert(
        'Required Fields',
        'Please enter pet name and type.'
      );
      return;
    }

    try {
      addPetToDatabase(
        petName.trim(),
        petType.trim(),
        petBreed.trim(),
        petAge.trim()
      );

      setPetName('');
      setPetType('');
      setPetBreed('');
      setPetAge('');
      setShowForm(false);

      loadPets();

      Alert.alert('Success', 'Your pet has been saved!');
    } catch (error) {
      console.log('Add pet error:', error);
      Alert.alert('Error', 'Unable to save pet.');
    }
  };

  // Delete a pet
  const deletePet = (id: number) => {
    Alert.alert(
      'Delete Pet',
      'Are you sure you want to delete this pet?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            try {
              deletePetFromDatabase(id);

              if (selectedPet?.id === id) {
                setSelectedPet(null);
              }

              loadPets();
            } catch (error) {
              Alert.alert('Error', 'Unable to delete pet.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>My Pets 🐾</Text>

        <Text style={styles.subtitle}>
          Manage your lovely pets in one place.
        </Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowForm(true)}
        >
          <Text style={styles.addButtonText}>
            + ADD NEW PET
          </Text>
        </TouchableOpacity>

        {showForm && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>
              Pet Information
            </Text>

            <Text style={styles.label}>Pet Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter pet name"
              value={petName}
              onChangeText={setPetName}
            />

            <Text style={styles.label}>Pet Type</Text>
            <TextInput
              style={styles.input}
              placeholder="Example: Dog, Cat, Bird"
              value={petType}
              onChangeText={setPetType}
            />

            <Text style={styles.label}>Breed</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter breed"
              value={petBreed}
              onChangeText={setPetBreed}
            />

            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter age in years"
              value={petAge}
              onChangeText={setPetAge}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={addPet}
            >
              <Text style={styles.saveButtonText}>
                Save Pet
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowForm(false)}
            >
              <Text style={styles.cancelButtonText}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Search Bar */}
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search pets by name, type or breed..."
          placeholderTextColor="#888"
          value={searchText}
          onChangeText={setSearchText}
        />

        {/* Pet Type Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {['All', 'Dog', 'Cat', 'Bird', 'Other'].map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterButton,
                selectedType === type &&
                  styles.activeFilterButton,
              ]}
              onPress={() => setSelectedType(type)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedType === type &&
                    styles.activeFilterText,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>
          My Pet List ({filteredPets.length})
        </Text>

        {pets.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emoji}>🐶 🐱 🐦</Text>

            <Text style={styles.emptyTitle}>
              No Pets Added Yet
            </Text>

            <Text style={styles.description}>
              Add your first pet to manage its daily care.
            </Text>
          </View>
        ) : filteredPets.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emoji}>🔍</Text>

            <Text style={styles.emptyTitle}>
              No Pets Found
            </Text>

            <Text style={styles.description}>
              Try another search or select a different filter.
            </Text>
          </View>
        ) : (
          filteredPets.map(pet => (
            <View key={pet.id} style={styles.petCard}>
              <Text style={styles.petName}>
                🐾 {pet.name}
              </Text>

              <Text style={styles.petDetails}>
                Type: {pet.type}
              </Text>

              <Text style={styles.petDetails}>
                Breed: {pet.breed || 'Not provided'}
              </Text>

              <Text style={styles.petDetails}>
                Age: {pet.age ? `${pet.age} years` : 'Not provided'}
              </Text>

              {/* View Details Button */}
              <TouchableOpacity
                style={styles.detailsButton}
                onPress={() => setSelectedPet(pet)}
              >
                <Text style={styles.detailsButtonText}>
                  View Details
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deletePet(pet.id)}
              >
                <Text style={styles.deleteButtonText}>
                  Delete Pet
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Pet Details Modal */}
      <Modal
        visible={selectedPet !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPet(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEmoji}>🐾</Text>

            <Text style={styles.modalTitle}>
              Pet Details
            </Text>

            {selectedPet && (
              <>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Pet Name</Text>
                  <Text style={styles.detailValue}>
                    {selectedPet.name}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Pet Type</Text>
                  <Text style={styles.detailValue}>
                    {selectedPet.type}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Breed</Text>
                  <Text style={styles.detailValue}>
                    {selectedPet.breed || 'Not provided'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Age</Text>
                  <Text style={styles.detailValue}>
                    {selectedPet.age
                      ? `${selectedPet.age} years`
                      : 'Not provided'}
                  </Text>
                </View>
              </>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedPet(null)}
            >
              <Text style={styles.closeButtonText}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F2',
  },

  scrollContent: {
    paddingBottom: 30,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#386641',
    marginTop: 20,
    marginHorizontal: 20,
  },

  subtitle: {
    fontSize: 15,
    color: '#777',
    marginTop: 8,
    marginHorizontal: 20,
  },

  addButton: {
    backgroundColor: '#386641',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    margin: 20,
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },

  form: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 20,
  },

  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#386641',
    marginBottom: 20,
  },

  label: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#386641',
    marginBottom: 7,
  },

  input: {
    backgroundColor: '#F5F5F5',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 15,
    color: '#333333',
  },

  searchInput: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 5,
    marginBottom: 15,
    fontSize: 15,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },

  filterContainer: {
    marginHorizontal: 20,
    marginBottom: 15,
  },

  filterButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#386641',
  },

  activeFilterButton: {
    backgroundColor: '#386641',
  },

  filterButtonText: {
    color: '#386641',
    fontSize: 14,
    fontWeight: 'bold',
  },

  activeFilterText: {
    color: '#FFFFFF',
  },

  saveButton: {
    backgroundColor: '#E9A23B',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },

  cancelButton: {
    padding: 12,
    alignItems: 'center',
  },

  cancelButtonText: {
    color: '#777777',
    fontSize: 15,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#386641',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: 20,
  },

  emoji: {
    fontSize: 45,
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#386641',
  },

  description: {
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
    marginTop: 10,
  },

  petCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 15,
  },

  petName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#386641',
    marginBottom: 10,
  },

  petDetails: {
    fontSize: 15,
    color: '#666666',
    marginTop: 5,
  },

  detailsButton: {
    backgroundColor: '#E8F1E8',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },

  detailsButtonText: {
    color: '#386641',
    fontWeight: 'bold',
    fontSize: 15,
  },

  deleteButton: {
    backgroundColor: '#FCE8E6',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },

  deleteButtonText: {
    color: '#C62828',
    fontWeight: 'bold',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalCard: {
    width: '100%',
    backgroundColor: '#FFF9F2',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
  },

  modalEmoji: {
    fontSize: 45,
    marginBottom: 10,
  },

  modalTitle: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#386641',
    marginBottom: 20,
  },

  detailRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },

  detailLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#386641',
  },

  detailValue: {
    fontSize: 15,
    color: '#555555',
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: 15,
  },

  closeButton: {
    backgroundColor: '#386641',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginTop: 25,
  },

  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
