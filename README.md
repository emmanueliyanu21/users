# User Management Application

## Overview
This is a single-page application built with Angular, allowing users to register, log in, and manage their profiles. The application simulates an admin approval process and CRUD operations.

## Default Admin Information
- **Username:** admin
- **Role:** admin

## Completed Features
- User registration
- Admin approval for the first user
- Temporary key generation for login
- User login for approved users
- CRUD operations for admin users
- Data persistence using LocalStorage/SessionStorage
- Mock API integration for user management

## Issues Encountered
- Initially faced difficulties with RxJS observables when handling user data.
- Encountered errors with Angular's dependency injection while integrating HttpClient.
- Adjusted API response handling to support both mock and real API calls.

## Running the Application
### Prerequisites
- Node.js installed on your machine.
- Angular CLI installed globally.

### Installation Steps
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <project-directory>
