
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('petcare.db');

// Initialize database tables
export const initDatabase = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS pets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      breed TEXT,
      age TEXT
    );

    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      activity TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      notificationId TEXT
    );
  `);

  // Add notificationId to existing reminders table
  // This keeps previously saved reminders.
  try {
    db.execSync(
      'ALTER TABLE reminders ADD COLUMN notificationId TEXT'
    );
  } catch (error) {
    // Column already exists. No action needed.
  }

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

// ACTIVITY FUNCTIONS

export const addActivityToDatabase = (
  activity: string,
  date: string,
  time: string
) => {
  db.runSync(
    'INSERT INTO activities (activity, date, time) VALUES (?, ?, ?)',
    [activity, date, time]
  );
};

export const getAllActivities = () => {
  return db.getAllSync<{
    id: number;
    activity: string;
    date: string;
    time: string;
  }>('SELECT * FROM activities ORDER BY id DESC');
};

export const deleteActivityFromDatabase = (id: number) => {
  db.runSync('DELETE FROM activities WHERE id = ?', [id]);
};

// REMINDER FUNCTIONS

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
  return db.getAllSync<{
    id: number;
    title: string;
    date: string;
    time: string;
    notificationId: string | null;
  }>('SELECT * FROM reminders ORDER BY id DESC');
};

// Get notification ID for a reminder
export const getReminderNotificationId = (id: number) => {
  const reminder = db.getFirstSync<{
    notificationId: string | null;
  }>(
    'SELECT notificationId FROM reminders WHERE id = ?',
    [id]
  );

  return reminder?.notificationId ?? null;
};

// Delete reminder from database
export const deleteReminderFromDatabase = (id: number) => {
  db.runSync('DELETE FROM reminders WHERE id = ?', [id]);
};
