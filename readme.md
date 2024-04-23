# DynamoDB Transaction Implementation

## Author: Shashank

This project is an implementation of retrieving user balance and performing user credit and debit transactions using DynamoDB and TypeScript.

### Prerequisites

- TypeScript v5.4
- Node.js v20.11
- npm v10.2

### Getting Started

1. Clone the repository:

    ```bash
    git clone <repository-url>
    ```

2. Navigate to the project directory:

    ```bash
    cd dynamodb-transactions
    ```

3. Replace the placeholders for your DynamoDB full access keys in the `.env` file, along with the region of your DynamoDB.

4. Install dependencies:

    ```bash
    npm install
    ```

5. Spin up the DynamoDB table by running:

    ```bash
    npm run spininfra
    ```

6. Start the project:

    ```bash
    npm start
    ```

### Usage

- `index.ts` is the entry point where you can explore and test the implemented functions.

### Note

Ensure to replace your DynamoDB full access keys and region in the `.env` file before running the project.

