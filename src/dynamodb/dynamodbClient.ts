import {
  DynamoDBClient
} from "@aws-sdk/client-dynamodb";


const config = {
  region: process.env.DYNAMODB_REGION!,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_KEY!,
    accessKeyId: process.env.AWS_ACCESS_KEY!,
  },
};

export const client = new DynamoDBClient(config);

