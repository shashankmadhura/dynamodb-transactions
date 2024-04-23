import {
  PutItemCommand,
  PutItemCommandInput,
  TransactWriteItemsCommand,
  TransactWriteItemsCommandInput,
  TransactWriteItemsCommandOutput
} from "@aws-sdk/client-dynamodb";
import "dotenv/config";
import { v4 as uuidv4 } from "uuid";
import { client } from "../dynamodb/dynamodbClient.ts";
import { getUser } from "../users/getUser.ts";
import { getTransaction } from "./getTransaction.ts";



//interfaces

interface TransactInput {
  idempotentKey: string;
  userId: string;
  amount: number;
  type: "credit" | "debit";
}

interface TransactOutput {
  message: string;
  transactionId: string;
}

export const transact = async ({
  idempotentKey,
  userId,
  amount,
  type,
}: TransactInput): Promise<TransactOutput> => {

    // Check if idempotentKey is provided
    if (!idempotentKey) {
      return { message: "Idempotent key is required", transactionId: "" };
    }
  
    // Check if userId is provided
    if (!userId) {
      return { message: "User ID is required", transactionId: "" };
    }
  
    // Check if amount is a valid number and greater than zero
    if (isNaN(amount) || amount <= 0) {
      return { message: "Invalid amount", transactionId: "" };
    }
  
    // Check if type is either "credit" or "debit"
    if (type !== "credit" && type !== "debit") {
      return { message: "Invalid transaction type", transactionId: "" };
    }
  
  //check if user exists or not
  const userResult = await getUser(userId);
  if (!userResult.Item) {
    console.log("user doesnot exists");
    return { message: "User not found", transactionId: "" };
  }

  //check transaction exists or not
  const transactionInfo = await getTransaction(idempotentKey);
  if (transactionInfo.Items.length) {
    return {
      message: "Transaction already processed",
      transactionId: transactionInfo.Items[0].id.S,
    };
  }

  const transactionId = uuidv4();
  const currentTime = new Date().getTime();
  //start the transaction
  const transactionParams: TransactWriteItemsCommandInput = {
    TransactItems: [
      {
        Update: {
          TableName: process.env.DYNAMODB_USERS_TABLE_NAME,
          Key: { userId: { S: userId } },
          UpdateExpression:
            type === "debit"
              ? "SET balance = balance - :amount"
              : "SET balance = balance + :amount",
          ExpressionAttributeValues: {
            ":amount": { N: String(Math.abs(amount)) },
          },
          ConditionExpression:
            type === "debit"
              ? "attribute_exists(balance) AND balance >= :amount"
              : undefined,
        },
      },
      {
        Put: {
          TableName: process.env.DYNAMODB_TRANSACTIONS_TABLE_NAME,
          Item: {
            id: { S: transactionId },
            idempotentKey: { S: idempotentKey },
            userId: { S: userId },
            amount: { S: String(Math.abs(amount)) },
            type: { S: type },
            status: { S: "success" },
            createdAt: { N: currentTime.toString() },
            updatedAt: { N: currentTime.toString() },
          },
          ConditionExpression: "attribute_not_exists(id)",
        },
      },
    ],
  };

  //write the transaction
  try {
    const transactionCommand = new TransactWriteItemsCommand(transactionParams);
    const transactionResult: TransactWriteItemsCommandOutput =
      await client.send(transactionCommand);
    return { message: "Transaction successful", transactionId };
  } catch (err) {
    console.error("Transaction failed:", err);

    //update transaction as fail
    const putItemParams: PutItemCommandInput = {
      TableName: process.env.DYNAMODB_TRANSACTIONS_TABLE_NAME,
      Item: {
        id: { S: transactionId },
        userId: { S: userId },
        idempotentKey: { S: idempotentKey },
        amount: { N: String(Math.abs(amount)) },
        type: { S: type },
        createdAt: { N: currentTime.toString() },
        updatedAt: { N: currentTime.toString() },
        status: { S: "fail" },
      },
    };
    const putItemCommand = new PutItemCommand(putItemParams);
    await client.send(putItemCommand);
    // Check if the error is due to insufficient funds
    if (
      err.message  &&
      err.message.includes("ConditionalCheckFailed")
    ) {
      return {
        message: "Insufficient funds for debit transaction",
        transactionId: "",
      };
    }
    return { message: "Transaction failed", transactionId: "" };
  }
};



