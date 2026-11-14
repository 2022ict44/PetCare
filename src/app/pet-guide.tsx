
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import {
  initDatabase,
  getAllGuides,
  GuideItem,
} from '../database/petDatabase';

const categories = [
  { name: 'All', icon: '✨' },
  { name: 'Care Tips', icon: '💚' },
  { name: 'Food Guide', icon: '🥗' },
  { name: 'Grooming', icon: '🛁' },
  { name: 'Training', icon: '🎓' },
  { name: 'Health & Safety', icon: '🏥' },
];

const petTypes = [
  { name: 'All', icon: '🐾' },
  { name: 'Dog', icon: '🐶' },
  { name: 'Cat', icon: '🐱' },
  { name: 'Bird', icon: '🐦' },
  { name: 'Others', icon: '🐰' },
];

export default function PetGuideScreen() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPetType, setSelectedPetType] = useState('All');
  const [selectedGuide, setSelectedGuide] = useState<GuideItem | null>(null);
  const [guides, setGuides] = useState<GuideItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      initDatabase();
      const savedGuides = getAllGuides();
      setGuides(savedGuides);
    } catch (error) {
      console.error('Error loading pet guides:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredGuides = guides.filter((item) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      item.title.toLowerCase().includes(searchText) ||
      item.description.toLowerCase().includes(searchText);

    const matchesCategory =
      selectedCategory === 'All' ||
      item.category === selectedCategory;

    const matchesPetType =
      selectedPetType === 'All'
        ? true
        : item.petType === selectedPetType;

    return matchesSearch && matchesCategory && matchesPetType;
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {!selectedGuide ? (
        <>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.heading}>Pet Care Guide 🐾</Text>
            <Text style={styles.subtitle}>
              Everything you need to keep your pets happy, healthy and safe.
            </Text>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search pet care tips..."
              placeholderTextColor="#929D94"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {/* Pet Type */}
          <Text style={styles.sectionTitle}>Choose Your Pet</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {petTypes.map((type) => {
              const active = selectedPetType === type.name;

              return (
                <TouchableOpacity
                  key={type.name}
                  style={[
                    styles.petTypeButton,
                    active && styles.activePetTypeButton,
                  ]}
                  onPress={() => setSelectedPetType(type.name)}
                >
                  <Text style={styles.petTypeIcon}>{type.icon}</Text>
                  <Text
                    style={[
                      styles.petTypeButtonText,
                      active && styles.activeButtonText,
                    ]}
                  >
                    {type.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Categories */}
          <Text style={styles.sectionTitle}>Explore Categories</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {categories.map((category) => {
              const active = selectedCategory === category.name;

              return (
                <TouchableOpacity
                  key={category.name}
                  style={[
                    styles.categoryButton,
                    active && styles.activeCategoryButton,
                  ]}
                  onPress={() => setSelectedCategory(category.name)}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text
                    style={[
                      styles.categoryButtonText,
                      active && styles.activeButtonText,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Guide List */}
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>Pet Care Guides</Text>
            <Text style={styles.resultCount}>
              {filteredGuides.length} guides
            </Text>
          </View>

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#347A55"
              style={styles.loader}
            />
          ) : filteredGuides.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🐾</Text>
              <Text style={styles.emptyTitle}>No Guides Found</Text>
              <Text style={styles.emptyText}>
                Try another search or select a different filter.
              </Text>
            </View>
          ) : (
            filteredGuides.map((item) => (
              <View key={item.id} style={styles.guideCard}>
                <View style={styles.cardTop}>
                  <View style={styles.iconContainer}>
                    <Text style={styles.guideIcon}>{item.icon}</Text>
                  </View>

                  <View style={styles.cardHeading}>
                    <Text style={styles.guideTitle}>{item.title}</Text>
                    <Text style={styles.guideCategory}>
                      {item.category}
                    </Text>
                  </View>
                </View>

                <View style={styles.petBadge}>
                  <Text style={styles.petBadgeText}>
                    🐾 {item.petType}
                  </Text>
                </View>

                <Text style={styles.description}>
                  {item.description}
                </Text>

                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => setSelectedGuide(item)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.viewButtonText}>Read Guide</Text>
                  <Text style={styles.buttonArrow}>→</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </>
      ) : (
        /* Guide Details */
        <View style={styles.detailContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedGuide(null)}
          >
            <Text style={styles.backButtonText}>←  Back to Guides</Text>
          </TouchableOpacity>

          <View style={styles.detailCard}>
            <View style={styles.detailIconContainer}>
              <Text style={styles.detailIcon}>
                {selectedGuide.icon}
              </Text>
            </View>

            <Text style={styles.detailTitle}>
              {selectedGuide.title}
            </Text>

            <View style={styles.detailBadges}>
              <Text style={styles.detailCategory}>
                {selectedGuide.category}
              </Text>

              <Text style={styles.detailPetType}>
                🐾 {selectedGuide.petType}
              </Text>
            </View>

            <View style={styles.detailDivider} />

            <Text style={styles.detailHeading}>About This Guide</Text>

            <Text style={styles.detailText}>
              {selectedGuide.description}
            </Text>

            <Text style={styles.detailHeading}>Helpful Information</Text>

            <Text style={styles.detailText}>
              {selectedGuide.details}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F8F4',
  },

  content: {
    padding: 20,
    paddingBottom: 45,
  },

  header: {
    marginTop: 20,
    marginBottom: 22,
  },

  heading: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#285943',
  },

  subtitle: {
    fontSize: 14,
    color: '#718078',
    marginTop: 8,
    lineHeight: 21,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E0E9E1',
    elevation: 2,
  },

  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 14,
    color: '#285943',
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#285943',
    marginTop: 25,
    marginBottom: 13,
  },

  horizontalScroll: {
    flexGrow: 0,
  },

  petTypeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E9E1',
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 17,
    marginRight: 10,
    minWidth: 76,
  },

  activePetTypeButton: {
    backgroundColor: '#347A55',
    borderColor: '#347A55',
  },

  petTypeIcon: {
    fontSize: 23,
    marginBottom: 5,
  },

  petTypeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#52705C',
  },

  activeButtonText: {
    color: '#FFFFFF',
  },

  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F0E9',
    borderRadius: 22,
    paddingVertical: 11,
    paddingHorizontal: 15,
    marginRight: 9,
  },

  activeCategoryButton: {
    backgroundColor: '#347A55',
  },

  categoryIcon: {
    fontSize: 15,
    marginRight: 6,
  },

  categoryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#347A55',
  },

  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  resultCount: {
    color: '#718078',
    fontSize: 12,
    marginTop: 12,
  },

  guideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E6EEE7',
    elevation: 2,
  },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconContainer: {
    width: 55,
    height: 55,
    borderRadius: 15,
    backgroundColor: '#EAF3EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  guideIcon: {
    fontSize: 29,
  },

  cardHeading: {
    flex: 1,
  },

  guideTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#285943',
  },

  guideCategory: {
    fontSize: 12,
    color: '#347A55',
    fontWeight: '600',
    marginTop: 5,
  },

  petBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EDF5EE',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 11,
    marginTop: 13,
  },

  petBadgeText: {
    color: '#347A55',
    fontSize: 12,
    fontWeight: '600',
  },

  description: {
    fontSize: 14,
    color: '#718078',
    marginTop: 12,
    lineHeight: 21,
  },

  viewButton: {
    backgroundColor: '#347A55',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 11,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },

  viewButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },

  buttonArrow: {
    color: '#FFFFFF',
    fontSize: 18,
    marginLeft: 8,
  },

  loader: {
    marginTop: 35,
  },

  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 25,
    alignItems: 'center',
    marginTop: 10,
  },

  emptyIcon: {
    fontSize: 40,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#285943',
    marginTop: 10,
  },

  emptyText: {
    fontSize: 13,
    color: '#718078',
    textAlign: 'center',
    marginTop: 7,
    lineHeight: 20,
  },

  detailContainer: {
    marginTop: 15,
  },

  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#E5EFE7',
    borderRadius: 10,
    marginBottom: 17,
  },

  backButtonText: {
    color: '#347A55',
    fontSize: 14,
    fontWeight: 'bold',
  },

  detailCard: {
    backgroundColor: '#FFFFFF',
    padding: 21,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#E6EEE7',
  },

  detailIconContainer: {
    width: 75,
    height: 75,
    borderRadius: 20,
    backgroundColor: '#EAF3EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 17,
  },

  detailIcon: {
    fontSize: 42,
  },

  detailTitle: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#285943',
    lineHeight: 30,
  },

  detailBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 13,
  },

  detailCategory: {
    backgroundColor: '#E8F3EA',
    color: '#347A55',
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: '600',
    marginRight: 8,
    marginBottom: 7,
  },

  detailPetType: {
    backgroundColor: '#F0F2E9',
    color: '#64734D',
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 7,
  },

  detailDivider: {
    height: 1,
    backgroundColor: '#E5ECE6',
    marginVertical: 20,
  },

  detailHeading: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#285943',
    marginTop: 13,
    marginBottom: 9,
  },

  detailText: {
    fontSize: 15,
    color: '#59665D',
    lineHeight: 25,
  },
});
