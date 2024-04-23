import {
  QueryCommand,
  QueryCommandInput,
} from "@aws-sdk/client-dynamodb";
import { client } from "../dynamodb/dynamodbClient.ts";


export async function getTransaction(idempotentKey: string): Promise<any> {
  const params: QueryCommandInput = {
    TableName: process.env.DYNAMODB_TRANSACTIONS_TABLE_NAME,
    IndexName: "idempotentKeyIndex", // Specify the GSI name
    KeyConditionExpression: "idempotentKey = :key", // Define the key condition expression
    ExpressionAttributeValues: {
      ":key": { S: idempotentKey }, // Provide the value for the key
    },
  };
  const cmd = new QueryCommand(params);
  const data = await client.send(cmd);
  return data;
}
