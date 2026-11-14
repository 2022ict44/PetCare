
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('petcare.db');

// INITIALIZE DATABASE TABLES
export const initDatabase = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS pets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      breed TEXT,
      age TEXT
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      notificationId TEXT,
      completed INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS health_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      petId INTEGER NOT NULL,
      recordType TEXT NOT NULL,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS pet_guides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      details TEXT NOT NULL,
      icon TEXT NOT NULL,
      petType TEXT NOT NULL DEFAULT 'All'
    );
  `);

  // Remove the unused activities table
  db.execSync('DROP TABLE IF EXISTS activities;');

  // Existing database migrations
  try {
    db.execSync(
      'ALTER TABLE reminders ADD COLUMN notificationId TEXT'
    );
  } catch (error) {}

  try {
    db.execSync(
      'ALTER TABLE reminders ADD COLUMN completed INTEGER NOT NULL DEFAULT 0'
    );
  } catch (error) {}

  try {
    db.execSync(
      "ALTER TABLE pet_guides ADD COLUMN petType TEXT NOT NULL DEFAULT 'All'"
    );
  } catch (error) {}

  seedDefaultGuides();

  console.log('PetCare database initialized successfully');
};

// PET FUNCTIONS

export const addPetToDatabase = (
  name: string,
  type: string,
  breed: string,
  age: string
) => {
  db.runSync(
    'INSERT INTO pets (name, type, breed, age) VALUES (?, ?, ?, ?)',
    [name, type, breed, age]
  );
};

export const getAllPets = () => {
  return db.getAllSync<{
    id: number;
    name: string;
    type: string;
    breed: string;
    age: string;
  }>('SELECT * FROM pets ORDER BY id DESC');
};

export const deletePetFromDatabase = (id: number) => {
  db.runSync('DELETE FROM pets WHERE id = ?', [id]);
};

// REMINDER FUNCTIONS

export type Reminder = {
  id: number;
  title: string;
  date: string;
  time: string;
  notificationId: string | null;
  completed: number;
};

export const addReminderToDatabase = (
  title: string,
  date: string,
  time: string,
  notificationId: string
) => {
  db.runSync(
    `INSERT INTO reminders
    (title, date, time, notificationId)
    VALUES (?, ?, ?, ?)`,
    [title, date, time, notificationId]
  );
};

export const getAllReminders = () => {
  return db.getAllSync<Reminder>(
    'SELECT * FROM reminders ORDER BY date ASC, time ASC'
  );
};

export const updateReminderCompletion = (
  id: number,
  completed: boolean
) => {
  db.runSync(
    'UPDATE reminders SET completed = ? WHERE id = ?',
    [completed ? 1 : 0, id]
  );
};

export const getReminderNotificationId = (id: number) => {
  const reminder = db.getFirstSync<{
    notificationId: string | null;
  }>(
    'SELECT notificationId FROM reminders WHERE id = ?',
    [id]
  );

  return reminder?.notificationId ?? null;
};

export const deleteReminderFromDatabase = (id: number) => {
  db.runSync('DELETE FROM reminders WHERE id = ?', [id]);
};

// HEALTH RECORD FUNCTIONS

export type HealthRecord = {
  id: number;
  petId: number;
  petName?: string;
  recordType: string;
  date: string;
  description: string;
  notes: string | null;
};

export const addHealthRecordToDatabase = (
  petId: number,
  recordType: string,
  date: string,
  description: string,
  notes: string
) => {
  db.runSync(
    `INSERT INTO health_records
    (petId, recordType, date, description, notes)
    VALUES (?, ?, ?, ?, ?)`,
    [petId, recordType, date, description, notes]
  );
};

export const getAllHealthRecords = () => {
  return db.getAllSync<HealthRecord>(`
    SELECT
      health_records.*,
      pets.name AS petName
    FROM health_records
    LEFT JOIN pets ON health_records.petId = pets.id
    ORDER BY health_records.id DESC
  `);
};

export const deleteHealthRecordFromDatabase = (id: number) => {
  db.runSync(
    'DELETE FROM health_records WHERE id = ?',
    [id]
  );
};

// PET GUIDE FUNCTIONS

export type GuideItem = {
  id: number;
  title: string;
  category: string;
  description: string;
  details: string;
  icon: string;
  petType: string;
};

// SEED DEFAULT PET GUIDES

export const seedDefaultGuides = () => {
  const defaultGuides = [
    // DOG GUIDES
    {
      title: 'Dog Daily Care',
      category: 'Care Tips',
      description: 'Learn the daily care needs of dogs.',
      details: 'Provide fresh drinking water, suitable dog food, daily exercise, playtime, and a clean resting area. Maintain a regular daily routine.',
      icon: '🐕',
      petType: 'Dog',
    },
    {
      title: 'Dog Food Guide',
      category: 'Food Guide',
      description: 'Understand healthy food choices for dogs.',
      details: 'Choose complete dog food suitable for your dog’s age, size, and health. Keep fresh water available and avoid foods that may be harmful to dogs. Ask a veterinarian about special dietary needs.',
      icon: '🥣',
      petType: 'Dog',
    },
    {
      title: 'Dog Grooming Guide',
      category: 'Grooming',
      description: 'Keep your dog clean and comfortable.',
      details: 'Brush your dog according to its coat type. Check its ears, paws, skin, and nails regularly. Bathe when needed using suitable pet products.',
      icon: '🛁',
      petType: 'Dog',
    },
    {
      title: 'Dog Training Guide',
      category: 'Training',
      description: 'Teach dogs basic commands and good habits.',
      details: 'Use positive reinforcement to teach commands such as sit, stay, and come. Keep training sessions short and consistent. Reward good behaviour and be patient.',
      icon: '🎾',
      petType: 'Dog',
    },
    {
      title: 'Dog Health and Safety',
      category: 'Health & Safety',
      description: 'Protect dogs from common health and safety risks.',
      details: 'Keep vaccinations and veterinary checkups up to date. Use a leash in appropriate public areas and keep harmful foods, medicines, and chemicals away from your dog. Contact a veterinarian if you notice unusual symptoms.',
      icon: '🩺',
      petType: 'Dog',
    },

    // CAT GUIDES
    {
      title: 'Cat Daily Care',
      category: 'Care Tips',
      description: 'Learn the daily care needs of cats.',
      details: 'Provide fresh water, suitable food, a clean litter box, comfortable resting places, and daily play opportunities. Give your cat a safe environment.',
      icon: '🐈',
      petType: 'Cat',
    },
    {
      title: 'Cat Food Guide',
      category: 'Food Guide',
      description: 'Choose suitable food for your cat.',
      details: 'Provide nutritionally complete cat food suitable for your cat’s age and health. Cats have specific nutritional needs, so do not replace their regular food with unsuitable human foods. Ask a veterinarian about dietary changes.',
      icon: '🥣',
      petType: 'Cat',
    },
    {
      title: 'Cat Grooming Guide',
      category: 'Grooming',
      description: 'Learn how to maintain your cat’s coat.',
      details: 'Brush your cat according to its coat length and needs. Keep its litter area clean and check its coat, ears, and nails regularly. Use gentle handling during grooming.',
      icon: '🧼',
      petType: 'Cat',
    },
    {
      title: 'Cat Training Guide',
      category: 'Training',
      description: 'Encourage positive habits in cats.',
      details: 'Provide a suitable litter box and scratching post. Reward positive behaviour with praise or appropriate treats. Use patience and avoid punishment.',
      icon: '🐾',
      petType: 'Cat',
    },
    {
      title: 'Cat Health and Safety',
      category: 'Health & Safety',
      description: 'Keep your cat safe and healthy.',
      details: 'Arrange regular veterinary checkups and vaccinations. Keep dangerous household products and unsuitable plants away from your cat. Provide a safe indoor environment and contact a veterinarian when you notice unusual behaviour.',
      icon: '🩺',
      petType: 'Cat',
    },

    // BIRD GUIDES
    {
      title: 'Bird Daily Care',
      category: 'Care Tips',
      description: 'Understand the daily needs of pet birds.',
      details: 'Provide fresh water, suitable food, a clean cage, and enough space for movement. Give your bird regular attention and a calm, safe environment.',
      icon: '🐦',
      petType: 'Bird',
    },
    {
      title: 'Bird Food Guide',
      category: 'Food Guide',
      description: 'Learn about suitable food for pet birds.',
      details: 'Choose a balanced diet suitable for your bird species. Different birds have different nutritional needs. Provide clean drinking water and ask an avian veterinarian about suitable foods.',
      icon: '🌾',
      petType: 'Bird',
    },
    {
      title: 'Bird Grooming Guide',
      category: 'Grooming',
      description: 'Understand basic bird grooming needs.',
      details: 'Keep the cage and perches clean. Provide suitable bathing opportunities according to your bird species. Do not trim wings or nails without guidance from a qualified professional.',
      icon: '🪶',
      petType: 'Bird',
    },
    {
      title: 'Bird Training Guide',
      category: 'Training',
      description: 'Build trust and encourage positive behaviour.',
      details: 'Use gentle interaction and short training sessions. Reward calm and positive behaviour. Allow your bird time to become comfortable with people and its surroundings.',
      icon: '🎵',
      petType: 'Bird',
    },
    {
      title: 'Bird Health and Safety',
      category: 'Health & Safety',
      description: 'Protect pet birds from environmental hazards.',
      details: 'Keep birds away from smoke, strong fumes, and overheated non-stick cookware. Maintain a clean cage and arrange checkups with an avian veterinarian. Seek veterinary advice if your bird behaves unusually.',
      icon: '🩺',
      petType: 'Bird',
    },

    // OTHER PET GUIDES
    {
      title: 'Other Pets Daily Care',
      category: 'Care Tips',
      description: 'Learn basic daily care for other small pets.',
      details: 'Provide a clean living space, fresh water, suitable food, and a comfortable environment. Research the specific needs of your animal species.',
      icon: '🐾',
      petType: 'Others',
    },
    {
      title: 'Other Pets Food Guide',
      category: 'Food Guide',
      description: 'Understand food requirements for different small pets.',
      details: 'Choose food specifically designed for your pet species. Rabbits, hamsters, fish, and reptiles have different dietary needs. Consult a veterinarian who treats your type of pet.',
      icon: '🥕',
      petType: 'Others',
    },
    {
      title: 'Other Pets Grooming Guide',
      category: 'Grooming',
      description: 'Maintain cleanliness according to your pet species.',
      details: 'Grooming requirements vary between animals. Keep your pet’s living space clean and use only suitable grooming methods. Seek professional guidance when necessary.',
      icon: '🧽',
      petType: 'Others',
    },
    {
      title: 'Other Pets Training Guide',
      category: 'Training',
      description: 'Encourage suitable habits in other small pets.',
      details: 'Training methods depend on the animal species. Use gentle handling, patience, and positive reinforcement where appropriate. Avoid forcing your pet to perform uncomfortable activities.',
      icon: '🐾',
      petType: 'Others',
    },
    {
      title: 'Other Pets Health and Safety',
      category: 'Health & Safety',
      description: 'Create a safe environment for other small pets.',
      details: 'Maintain suitable temperature, housing, hygiene, and living conditions for your pet species. Keep harmful substances away and consult a veterinarian experienced with your animal.',
      icon: '🩺',
      petType: 'Others',
    },
  ];

  // Remove old default guide records
  db.runSync(`
    DELETE FROM pet_guides
    WHERE title IN (
      'Daily Pet Care',
      'Healthy Food Choices',
      'Basic Grooming',
      'Basic Training',
      'Exercise and Play',
      'Clean Living Space',
      'Cat Grooming',
      'Bird Care Basics',
      'Other Pet Care',
      'Health Warning Signs',
      'Safe Home Environment',
      'Vaccination and Checkups',
      'Emergency Safety'
    )
  `);

  // Insert the 20 updated guides
  defaultGuides.forEach((guide) => {
    db.runSync(
      `INSERT OR IGNORE INTO pet_guides
      (title, category, description, details, icon, petType)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        guide.title,
        guide.category,
        guide.description,
        guide.details,
        guide.icon,
        guide.petType,
      ]
    );
  });
};

// GET ALL GUIDES

export const getAllGuides = () => {
  return db.getAllSync<GuideItem>(
    'SELECT * FROM pet_guides ORDER BY id ASC'
  );
};
