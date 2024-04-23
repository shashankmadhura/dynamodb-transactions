import "dotenv/config";
import { transact } from "./transactions/transact.ts";
import { retrieveUserBalance } from './users/retrieveUserBalance.ts';


const main = async() => {
  try{
    const {balance} = await retrieveUserBalance({ userId: "1" })
    console.log("balance before transaction", balance)
    const transactionRes = await transact({
      idempotentKey: "abc7", //each transaction must include an unique key
      userId: "1", 
      amount: 10, //amount in usd
      type: "debit", //debit or credit
    })
    console.log("transaction res", transactionRes)
  
    const {balance: balance2} = await retrieveUserBalance({ userId: "1" })
    console.log("balance before transaction", balance2)
  }catch(err){
    console.log("something went wrong")
  }

}



main()
