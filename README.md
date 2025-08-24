# Google Calendar Availability Suggester

This is a Next.js application that allows you to find available time slots among multiple Google Calendar users.

## Features

- Securely log in with your Google account.
- Automatically fetches a list of calendars you have access to.
- Select multiple attendees from the list to check their schedules.
- Displays available time slots based on the selected date range and duration.
- Provides a timeline visualization of each user's schedule to show how suggestions were determined.
- All times are handled in Japan Standard Time (JST).

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/)

---

## 1. Setup and Installation

### Step 1: Install Dependencies

Clone the repository and install the necessary packages.

```bash
npm install
```

### Step 2: Google Cloud Platform Setup

To use the Google Calendar API, you need to create a project on Google Cloud Platform (GCP) and get API credentials.

1.  **Create a GCP Project:** Go to the [Google Cloud Console](https://console.cloud.google.com/) and create a new project.
2.  **Enable API:** In your new project, navigate to "APIs & Services" > "Library" and enable the **Google Calendar API**.
3.  **Create OAuth 2.0 Client ID:**
    - Go to "APIs & Services" > "Credentials".
    - Click "+ CREATE CREDENTIALS" and select "OAuth 2.0 Client ID".
    - For "Application type", choose **Web application**.
    - Under "Authorized JavaScript origins", add `http://localhost:3000`.
    - Under "Authorized redirect URIs", add `http://localhost:3000/api/auth/callback/google`.
    - Click "CREATE" and copy the **Client ID** and **Client Secret**.

### Step 3: Environment Variable Setup

Create a new file named `.env.local` in the root of the project directory.

First, generate a secret key for NextAuth.js by running the following command in your terminal:

```bash
openssl rand -base64 32
```

Copy the output from the command. Then, copy and paste the following block into your `.env.local` file, filling in all the required values.

```
# Google Credentials
GOOGLE_CLIENT_ID="YOUR_CLIENT_ID_HERE"
GOOGLE_CLIENT_SECRET="YOUR_CLIENT_SECRET_HERE"

# NextAuth.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="PASTE_YOUR_GENERATED_SECRET_HERE"
```

### Step 4: Add Test Users (for Development)

While your GCP project is in "Testing" mode, you must add authorized users.

1.  In the GCP Console, go to "APIs & Services" > "OAuth consent screen".
2.  Under "Test users", click "+ ADD USERS".
3.  Enter the Google email address(es) you will use to log into the app during development.

---

## 2. Running the Application

Once the setup is complete, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 3. How to Use

1.  **Sign In:** Click the "Sign in with Google" button and log in with an authorized test user account.
2.  **Select Attendees:** After logging in, a list of calendars you have access to will appear. Check the boxes next to the people whose schedules you want to check.
3.  **Set Date Range & Duration:** Choose the start and end dates for your search, and specify the desired meeting duration in minutes.
4.  **Find Times:** Click the "Find Times" button.
5.  **View Results:** The application will display:
    - A list of suggested available time slots.
    - A timeline visualization showing the busy schedules for each selected person, so you can see the basis for the suggestions.
