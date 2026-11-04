# 🐾 PetCare – Pet Care Management App

## 📌 Project Overview

PetCare is a mobile application developed using React Native to help pet owners manage their pets and their daily care activities.

The application allows users to store pet information, manage activities, and schedule reminders. It uses a local SQLite database to store information on the device and supports offline functionality.

## ✨ Main Features

### 🐶 Pet Management
- Add new pets.
- View saved pet details.
- Search pets by name, type, and breed.
- Filter pets by category.
- Delete pet records.

### 📋 Activity Management
- Add pet care activities.
- View saved activities.
- Delete activities.

### ⏰ Reminder Management
- Create reminders with dates and times.
- Schedule local notifications.
- View saved reminders.
- Delete reminders and cancel their scheduled notifications.
- Validate date and time inputs.

### 🏠 Home Dashboard
- View a summary of pet information.
- Display activity and reminder counts.
- Navigate between application screens.

### 📶 Offline Functionality
- Uses a local SQLite database.
- Stores application data on the device.
- Supports the main application features without an active internet connection after the app has loaded.

## 🛠️ Technologies Used

- React Native
- Expo
- TypeScript
- Expo Router
- Expo SQLite
- Expo Notifications
- JavaScript
- Visual Studio Code

## 💾 Database

PetCare uses SQLite as its local database.

The database contains the following tables:

- `pets` – Stores pet information.
- `activities` – Stores pet care activities.
- `reminders` – Stores reminder details and notification IDs.

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- Visual Studio Code
- Expo Go (for testing on a mobile device)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/2022ict44/PetCare.git
   ```

2. Navigate to the project folder:

   ```bash
   cd PetCare
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the Expo development server:

   ```bash
   npx expo start
   ```

5. Scan the QR code using Expo Go to open the application on your mobile device.

## 🧪 Testing

The following functionalities have been tested:

- Adding and deleting pets.
- Searching and filtering pets.
- Managing pet activities.
- Creating and deleting reminders.
- Local notification scheduling.
- Navigation between screens.
- Offline functionality with Airplane Mode enabled while the app was running.
- Data persistence after closing and reopening the app.

## 👩‍💻 Developer

**Project Name:** PetCare

**GitHub Repository:** https://github.com/2022ict44/PetCare

---

*PetCare – Making pet care easier!* 🐾