# User Management Application

## Overview
This is a single-page application built with Angular, allowing users to register, log in, and manage their profiles. The application simulates an admin approval process and CRUD operations.

## Default Admin Information
- **email:** admin@gmail.com
- **Temporary Key:** admin

## Completed Features
- User registration
- Admin approval for the first user
- Temporary key generation for login
- User login for approved users
- CRUD operations for admin users
- Data persistence using LocalStorage/SessionStorage
- Mock API integration for user management

## Issues Encountered
- The requirement specifies that a user can only approve and manage the next user in sequence. If an admin user is deleted, it prevents the subsequent user from being edited or deleted, creating a management limitation. 
Fixed this by reassigning the Admin Role to the next eligible user in the sequence before deleting.

## Running the Application
### Prerequisites
- Node.js installed on your machine.
- Angular CLI installed globally.

