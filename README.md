# Clinic Reservation System

## Brief Overview of the Flow Implemented

### Authentication for User & Doctor

- **Register**: Sends a verification link via email. On clicking the link, the user is successfully created.  
- **Doctor Registration**: Doctors can also add their available slots during registration.  
- **Login**: Authenticated using a password.

### Slot Management (Doctor)

- **Create Slot**: Doctors can create additional time slots post-registration.  
- **Get Slots**: Retrieve all available slots for a specific doctor.

### Reservation Flow (User)

- **Book Slot**: Users can reserve an available slot with a doctor.  
- **Get Slots**: Fetch both upcoming and past appointments of the user.  
- **Cancel Slot**: Cancel an existing reservation.

### Logout

- Logs out the authenticated user or doctor.

---


# Technologies Used

- **Node.js**: Backend runtime environment.

---

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v18 or later) and **npm** (v10 or later). [Download Node.js](https://nodejs.org/)
2. A `.env` file with environment-specific credentials (e.g., AWS keys, database URLs,etc) is required. Ensure it is securely placed in the project root and not shared publicly.
3. A code editor or IDE (e.g., **Visual Studio Code**) is recommended for development.
   - [Download VS Code](https://code.visualstudio.com/)

---

## Getting Started

### Step 1: Clone the Repository

Clone the repository using the following command:
git clone https://github.com/Marufa-Mukadam/Clinic-Reservation-System-.git
or
git remote add origin https://github.com/Marufa-Mukadam/Clinic-Reservation-System-.git

### Step 2: Install Dependencies

npm install or npm i

---

## Running the project

### Step 1: Start the Development Server

npm run dev

---

## Start the app in production

### step 1 - build the project

npm run build - this will create a production ready build in the dist folder.

### step 2 - start the app

npm start
