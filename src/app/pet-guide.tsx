
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';

type GuideItem = {
  id: number;
  title: string;
  category: string;
  description: string;
  details: string;
  icon: string;
};

const guideData: GuideItem[] = [
  {
    id: 1,
    title: 'Daily Pet Care',
    category: 'Care Tips',
    description: 'Learn the basic daily care needs of pets.',
    details:
      'Provide clean drinking water, suitable food, a clean living area, and regular attention. Follow a routine that matches your pet’s needs.',
    icon: '🐾',
  },
  {
    id: 2,
    title: 'Healthy Food Choices',
    category: 'Food Guide',
    description: 'Understand the importance of balanced pet food.',
    details:
      'Choose food suitable for your pet’s species, age, and health needs. Avoid giving unfamiliar human foods without checking whether they are safe for your pet.',
    icon: '🥣',
  },
  {
    id: 3,
    title: 'Basic Grooming',
    category: 'Grooming',
    description: 'Keep your pet clean and comfortable.',
    details:
      'Brush your pet when appropriate for its coat, keep its living area clean, and check its ears, paws, and coat regularly. Ask a veterinarian about special grooming needs.',
    icon: '🛁',
  },
  {
    id: 4,
    title: 'Basic Training',
    category: 'Training',
    description: 'Build good habits through positive training.',
    details:
      'Use short and consistent training sessions. Reward good behaviour with praise or suitable treats. Be patient and avoid punishment.',
    icon: '🎾',
  },
  {
    id: 5,
    title: 'Exercise and Play',
    category: 'Care Tips',
    description: 'Help your pet stay active and engaged.',
    details:
      'Provide suitable play and activity based on your pet’s species, age, and ability. Give your pet enough rest and access to fresh water.',
    icon: '🐕',
  },
  {
    id: 6,
    title: 'Clean Living Space',
    category: 'Care Tips',
    description: 'Maintain a clean and comfortable environment.',
    details:
      'Clean food and water bowls regularly. Keep bedding and living spaces clean, dry, and comfortable for your pet.',
    icon: '🏡',
  },
];

const categories = [
  'All',
  'Care Tips',
  'Food Guide',
  'Grooming',
  'Training',
];

export default function PetGuideScreen() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedGuide, setSelectedGuide] = useState<GuideItem | null>(null);

  const filteredGuides = guideData.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' ||
      item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.heading}>Pet Care Guide 🐾</Text>

      <Text style={styles.subtitle}>
        Helpful information to keep your pets happy and healthy.
      </Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search pet care tips..."
        value={search}
        onChangeText={setSearch}
      />

      <Text style={styles.sectionTitle}>Categories</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category &&
                styles.activeCategory,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category &&
                  styles.activeCategoryText,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedGuide ? (
        <View style={styles.detailCard}>
          <Text style={styles.detailIcon}>
            {selectedGuide.icon}
          </Text>

          <Text style={styles.detailTitle}>
            {selectedGuide.title}
          </Text>

          <Text style={styles.detailCategory}>
            {selectedGuide.category}
          </Text>

          <Text style={styles.detailText}>
            {selectedGuide.details}
          </Text>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedGuide(null)}
          >
            <Text style={styles.backButtonText}>
              Back to Guides
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Pet Care Tips</Text>

          {filteredGuides.length === 0 ? (
            <Text style={styles.emptyText}>
              No guides found. Try another search.
            </Text>
          ) : (
            filteredGuides.map((item) => (
              <View key={item.id} style={styles.guideCard}>
                <Text style={styles.guideIcon}>
                  {item.icon}
                </Text>

                <Text style={styles.guideTitle}>
                  {item.title}
                </Text>

                <Text style={styles.guideCategory}>
                  {item.category}
                </Text>

                <Text style={styles.description}>
                  {item.description}
                </Text>

                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => setSelectedGuide(item)}
                >
                  <Text style={styles.viewButtonText}>
                    View Details
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </>
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

  heading: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#285943',
    marginTop: 20,
  },

  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 6,
    marginBottom: 20,
  },

  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5DED5',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#285943',
    marginTop: 22,
    marginBottom: 12,
  },

  categoryScroll: {
    flexGrow: 0,
  },

  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#E5EEE7',
    marginRight: 8,
  },

  activeCategory: {
    backgroundColor: '#347A55',
  },

  categoryText: {
    color: '#347A55',
    fontWeight: '600',
  },

  activeCategoryText: {
    color: '#FFFFFF',
  },

  guideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    padding: 17,
    marginBottom: 14,
  },

  guideIcon: {
    fontSize: 30,
    marginBottom: 8,
  },

  guideTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#285943',
  },

  guideCategory: {
    color: '#347A55',
    fontWeight: '600',
    marginTop: 5,
  },

  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    lineHeight: 21,
  },

  viewButton: {
    backgroundColor: '#347A55',
    padding: 11,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 13,
  },

  viewButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  detailCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 13,
    marginTop: 20,
  },

  detailIcon: {
    fontSize: 45,
    marginBottom: 12,
  },

  detailTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#285943',
  },

  detailCategory: {
    color: '#347A55',
    fontWeight: '600',
    marginTop: 8,
  },

  detailText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 24,
    marginTop: 15,
  },

  backButton: {
    backgroundColor: '#347A55',
    padding: 13,
    borderRadius: 9,
    alignItems: 'center',
    marginTop: 22,
  },

  backButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  emptyText: {
    color: '#777',
    textAlign: 'center',
    marginTop: 25,
  },
});
