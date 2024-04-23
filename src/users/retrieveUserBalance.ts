import {
  GetItemCommand,
  GetItemCommandInput,
  GetItemCommandOutput
} from "@aws-sdk/client-dynamodb";
import { client } from "../dynamodb/dynamodbClient.ts";

interface RetrieveUserBalanceInput {
  userId: string;
}

interface RetrieveUserBalanceOutput {
  balance: number | null;
}

export const retrieveUserBalance = async ({
  userId,
}: RetrieveUserBalanceInput): Promise<RetrieveUserBalanceOutput> => {
  if (!userId) {
    return { balance: null };
  }
  const input: GetItemCommandInput = {
    Key: { userId: { S: userId } },
    TableName: process.env.DYNAMODB_USERS_TABLE_NAME,
  };

  try {
    const command = new GetItemCommand(input);
    const response: GetItemCommandOutput = await client.send(command);

    // Check if the response contains an item
    if (response.Item) {
      // Check if the balance attribute exists and is of the correct type
      if (
        response.Item.balance &&
        typeof response.Item.balance.N === "string"
      ) {
        const balance = parseFloat(response.Item.balance.N);
        return { balance };
      } else {
        console.warn(
          "User balance not found or invalid type in DynamoDB response"
        );
        return { balance: null };
      }
    } else {
      console.warn("User not found in DynamoDB");
      return { balance: null };
    }
  } catch (error) {
    console.error("Error retrieving user balance from DynamoDB:", error);
    return { balance: null };
  }
};










