# Open-Source Contribution Planner

**Discover Projects. Find Issues. Start Contributing.**

A personalized platform that helps developers discover open-source repositories and find suitable issues based on their skills, programming languages, experience, and interests.

## Overview

Many developers want to contribute to open-source projects but struggle to find repositories and issues that match their abilities.

Open-Source Contribution Planner simplifies this process by allowing developers to create profiles, explore public GitHub repositories, receive personalized recommendations, and discover relevant issues.

## Features

- **User Authentication:** Secure registration and login.
- **Developer Profiles:** Manage programming languages, skills, and experience.
- **Repository Discovery:** Search and explore public GitHub repositories.
- **Repository Filtering:** Filter repositories using relevant criteria.
- **Smart Recommendations:** Discover repositories based on developer profiles.
- **Issue Discovery:** Explore issues from public repositories.
- **Issue Recommendations:** Find issues relevant to your skills and experience.
- **GitHub Integration:** Access original repositories and issues through direct links.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Vite, JavaScript, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| API Integration | GitHub REST API |
| Authentication | JWT |
| Password Hashing | bcrypt |

## Project Structure

```text
open-source-contribution-planner/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── utils/
│   └── package.json
│
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Node.js
- npm
- MongoDB
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
```

### 2. Navigate to the Project

```bash
cd open-source-contribution-planner
```

### 3. Backend Setup

```bash
cd backend
npm install
```

Configure the required environment variables in your `.env` file.

Start the backend using the development script defined in `backend/package.json`.

### 4. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed in your terminal.

## Application Workflow

1. Register or log in to the application.
2. Create your developer profile.
3. Add your skills and programming languages.
4. Discover public GitHub repositories.
5. Explore personalized repository recommendations.
6. Find suitable open-source issues.
7. Visit the original GitHub repository or issue.

## Future Enhancements

- GitHub account integration.
- Pull request and contribution tracking.
- Contribution progress tracking.
- Improved personalized recommendations.

## Security

- Password hashing using bcrypt.
- JWT-based authentication.
- Protected backend routes.
- Environment variables for sensitive configuration.

---

**Open-Source Contribution Planner**  
*Making Open-Source Contributions Easier for Everyone.*