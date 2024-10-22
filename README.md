# EXPENSE TRACKER

This project is a simple Expense Tracker Api built using Node.js, Express and SQLite.It allows users to register, log in , and manage their financial transactions (both income and expenses). Each user can add, view, update, delete and get summaries of their transactions.

## Features
- User registration and login with password hashing.
- JWT-based authentication for secure transactions
- CRUD operations for transactions (add, view, update, delete)
- Summary of income and expenses with filters for date (start date and end date)

## requirements to test this project
- Node.js
- SQLite3
- Postman (I used  VScode extension)

## Setup 
### 1. Clone the repository

- git clone https://github.com/upenderdeshaboina/flow.ai-backend-assignment.git
- cd flow.ai-assignment

### 2. Install Dependencies
- npm install

### 3. Set Up Environment Variables
Create a new file named `.env` in the root directory and add the following variables:

- PORT=3000        
- SECRET_TOKEN=my_secret_token

### 4. Run the Server
To start the server, run:
- npm start

Or if you're using nodemon for development
- nodemon server.js

Once the server is running, you'll see the message:
- server running on {port}
## API Endpoints
### Base URL
All API requests should be made to:
- http://localhost:3005

## Endpoints used to test apis in postman
### 1. User Registration
- Endpoint: /register
- Method: POST
-Description: Registers a new user
- Request Body: { "name": "John Doe", "email": "john@example.com","password": "password123" }
- Responses:
- 201: User registration successful.
- 400: User already exists.

### 2. User Login
- Endpoint: /login
- Method: POST
-Description: Logs in an existing user
- Request Body: { "email": "john@example.com", "password": "password123"
- Responses:
- 201: User logged in successfully and return a jwt token.
- 403: Invalid user
- 404: Invalid password.

### 3. Add Transaction
- Endpoint: /add-transaction
- Method: POST
-Description: Adds a new transaction(income or expense). Requires JWT authentication.
- Request Headers: {
    "Authorization": "Bearer jwt_token_string"
}
- Request Body: {
    "type": "income",
    "category": 1,
    "amount": 500.50,
    "date": "2024-10-22",
    "description": "Salary"
}
- Responses:
- 201: Transaction added successfully.
- 400: Error adding transaction.

### 4. Get Transactions
- Endpoint: /all-transactions
- Method: GET
- Description: Retrieves all transactions for the authenticated user.
- Request Headers: {
    "Authorization": "Bearer jwt_token_string"
}
- Response:
[
    {
        "id": "7fy8afc-7fnahv-fns758",
        "user_id": "356hfdg-98njbhva-hbfj3t",
        "type": "income",
        "category": 1,
        "amount": 500.50,
        "date": "2024-10-22",
        "description": "Salary"
    }
]

### 5.Get Single Transaction by ID
- Endpoint: /transaction/:id
- Method: GET
- Description: Retrieves a single transaction by its ID.
- Request Headers: {
    "Authorization": "Bearer jwt_token_string"
    }
- Response:
{
    "id": "transaction_id",
    "user_id": "user_id",
    "type": "income",
    "category": 1,
    "amount": 500.50,
    "date": "2024-10-22",
    "description": "Salary"
}

### 6. Update Transaction by ID
- Endpoint: /transaction/:id
- Method: PUT
- Description: Updates a transaction by its ID.
- Request Headers: {
    "Authorization": "Bearer jwt_token_string"
    }
- Request Body: {
    "type": "income",
    "category": 1,
    "amount": 5000.50,
    "date": "2024-10-22",
    "description": "Salary"
}

### 7. Delete Transaction by ID
- Endpoint: /transaction/:id
- Method: DELETE
- Description: Deletes a transaction by its ID.
- Request Headers: {
    "Authorization": "Bearer jwt_token_string"
    }
- Responses:
- 200: Transaction deleted successfully.
- 404: Transaction not found.

### 8. Get Transaction Summary
- Endpoint: /summary
- Method: GET
- Description: Retrieves a summary of income, expense, and balance for the authenticated user. Allows filtering by category and date range.

- Request Headers:{
    "Authorization": "Bearer jwt_token_string"
}
- Query Parameters:

- category: (Optional) Filter by category.
- startDate: (Optional) Filter transactions starting from this date.
- endDate: (Optional) Filter transactions until this date.
- Response: {
    "totalIncome": 5000,
    "totalExpense": 2000,
    "balance": 3000
    }

## Technologies used In this Assignment
- Node.js
- Express.js
- SQLite3
- bcrypt
- path
- jwt for authentication
- dotenv for environment variables
- CORS for cross-origin requests