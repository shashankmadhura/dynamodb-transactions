import {
  CreateTableCommand,
  CreateTableCommandInput,
  DynamoDBClient
} from "@aws-sdk/client-dynamodb";
import "dotenv/config";


const dynamoClient = new DynamoDBClient({
  region: process.env.DYNAMODB_REGION!,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_KEY!,
    accessKeyId: process.env.AWS_ACCESS_KEY!
  },
});

// users table creation function
const createUsersTable = async (): Promise<void> => {
  const params: CreateTableCommandInput = {
    TableName: process.env.DYNAMODB_USERS_TABLE_NAME!,
    KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
    AttributeDefinitions: [
      { AttributeName: "userId", AttributeType: "S" }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "UserIdIndex",
        KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
        Projection: {
          ProjectionType: "ALL",
        }
      },
    ],
    BillingMode: "PAY_PER_REQUEST",
  };
  try {
    const userTableCmd = new CreateTableCommand(params);
    const data = await dynamoClient.send(userTableCmd);
  } catch (error) {
    console.log(error);
  }
};

//transactions table creation function
async function createTransactionsTable(): Promise<void> {
  const params: CreateTableCommandInput = {
    TableName: process.env.DYNAMODB_TRANSACTIONS_TABLE_NAME!,
    KeySchema: [
      { AttributeName: "id", KeyType: "HASH" }, // Primary key: Hash key
      { AttributeName: "createdAt", KeyType: "RANGE" }, // Sort key
    ],
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" }, // String (Id)
      { AttributeName: "createdAt", AttributeType: "N" }, // Number (Unix timestamp)
      { AttributeName: "idempotentKey", AttributeType: "S" }, // String (idempotentKey)
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "idempotentKeyIndex",
        KeySchema: [
          { AttributeName: "idempotentKey", KeyType: "HASH" }, // GSI partition
        ],
        Projection: {
          ProjectionType: "ALL", // ProjectionType determines which attributes are copied to the index
        }
      },
    ],

    BillingMode: "PAY_PER_REQUEST", // Use on-demand billing mode
  };

  try {
    const command = new CreateTableCommand(params);
    await dynamoClient.send(command);
    console.log("Table created successfully.");
  } catch (error) {
    console.error("Error creating table:", error);
  }
}

createUsersTable();
createTransactionsTable();
