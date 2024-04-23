import {
  GetItemCommand,
  GetItemCommandInput,
} from "@aws-sdk/client-dynamodb";
import { client } from "../dynamodb/dynamodbClient.ts";


export async function getUser(userId: string): Promise<any> {
  const params: GetItemCommandInput = {
    TableName: process.env.DYNAMODB_USERS_TABLE_NAME,
    Key: { userId: { S: userId } },
  };
  const cmd = new GetItemCommand(params);
  const data = await client.send(cmd);
  return data;
}