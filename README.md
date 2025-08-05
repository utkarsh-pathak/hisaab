# Hisaab: A Full-Stack Expense Management Platform

<p align="center">
  <img src="https://img.shields.io/badge/python-3.9-blue.svg" alt="Python">
  <img src="https://img.shields.io/badge/react-18-blue.svg" alt="React">
  <img src="https://img.shields.io/badge/FastAPI-0.100-green.svg" alt="FastAPI">
  <img src="https://img.shields.io/badge/license-MIT-lightgrey.svg" alt="License">
</p>

Hisaab is a sophisticated, full-stack web application engineered to simplify expense tracking for both individuals and groups. Inspired by Splitwise, it provides a robust platform for managing shared finances, ensuring clarity and fairness in every transaction.

**This project demonstrates a comprehensive understanding of modern web development, from RESTful API design to building a dynamic, component-based frontend.**

---

### 🔴 Live Demo & Screenshots

**[View the Live Application](https://d1cgs476ndgxzf.cloudfront.net/)**

---

## ✨ Core Features

- **🔐 Secure User Authentication:** Seamless and secure user sign-on using Google OAuth 2.0.
- **👥 Collaborative Group Management:** Create, modify, and delete groups to manage expenses with friends and family.
- **💸 Intelligent Expense Tracking:** Log shared expenses with details on who paid and how the cost is split (equally or custom amounts).
- **📊 Simplified Debt Reconciliation:** An optimized algorithm calculates the simplest way to settle all debts within a group, minimizing the number of transactions required.
- **🏷️ Personal Expense Tagging:** Go beyond group spending with a private dashboard where users can categorize personal expenses using custom tags.
- **📜 Real-Time Activity Feed:** A chronological log of all significant actions, providing a transparent history of group activities and settlements.
- **🤝 Friend Management:** Easily add friends to the platform to begin sharing expenses.

---

## 🛠️ Tech Stack & Architectural Decisions

This application is built with a decoupled, client-server architecture to ensure scalability and maintainability.

### Backend

| Technology                | Purpose & Rationale                                                                                                                                                                                       |
| :------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Python**                | Chosen for its robust ecosystem and readability, making it ideal for complex business logic.                                                                                                              |
| **FastAPI**               | A modern, high-performance web framework selected for its asynchronous capabilities, automatic OpenAPI/Swagger documentation, and dependency injection system, which streamlines development and testing. |
| **SQLAlchemy & SQLModel** | Provides a powerful ORM layer for type-safe, Pythonic database interactions. This choice ensures data integrity and validation from the API down to the database schema.                                  |
| **Poetry**                | Manages Python dependencies and virtual environments to guarantee deterministic and reproducible builds.                                                                                                  |

### Frontend

| Technology        | Purpose & Rationale                                                                                                                                                     |
| :---------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **React**         | A declarative, component-based library used to build a dynamic and responsive user interface.                                                                           |
| **Redux Toolkit** | Implemented for predictable and centralized state management, which is crucial for handling complex application states like user sessions and shared data.              |
| **Vite**          | A next-generation build tool that offers a significantly faster development experience through features like Hot Module Replacement (HMR) and efficient asset bundling. |
| **Tailwind CSS**  | A utility-first CSS framework that enables rapid, custom UI development without leaving the HTML, resulting in a consistent and maintainable design system.             |
| **Axios**         | A promise-based HTTP client used for all communication with the backend REST API.                                                                                       |

---

## 🚀 Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

- Node.js (v18+)
- Python (v3.9+) & Poetry

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create a .env file with your database URL
# Example: DATABASE_URL="mysql+pymysql://user:password@localhost/hisaab"
cp .env.example .env

# Install dependencies
poetry install

# Run the development server
poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be live at `http://localhost:8000/docs` with interactive documentation.

### 2. Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend

# Create a .env file with the backend API URL
# Example: VITE_API_BASE_URL=http://localhost:8000
cp .env.example .env

# Install dependencies
npm install

# Run the development server
npm run dev
```

The application will be available at `http://localhost:5173`.
