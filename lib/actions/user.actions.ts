'use server'

import { ID, Query } from "node-appwrite"
import { createAdminClient, createSessionClient } from "../appwrite"
import { cookies } from "next/headers"
import { encryptId, extractCustomerIdFromUrl, parseStringify } from "../utils"
import { CountryCode, ProcessorTokenCreateRequest, ProcessorTokenCreateRequestProcessorEnum, Products } from "plaid"
import { plaidClient } from "../plaid"
import { addFundingSource, createDwollaCustomer } from "./dwolla.actions"
import { revalidatePath } from "next/cache"

const {
    APPWRITE_DATABASE_ID: DATABASE_ID,
    APPWRITE_USER_COLLECTION_ID: USER_COLLECTION_ID,
    APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID
} = process.env

export const signIn = async (userData: signInProps) => {
    try {
        const { account } = await createAdminClient();
        const session = await account.createEmailPasswordSession(userData.email, userData.password);
        cookies().set("banking-core-session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });
        return parseStringify(session)
    } catch (error) {
        console.log(error)
    }
}

export const signUp = async ({password, ...userData}: SignUpParams) => {

    let newUserAccount;

    try {
        //Mutation / Database / Make fetch
        const { account, database } = await createAdminClient();
        const { email, firstName, lastName } = userData
        
        const newUserAccount = await account.create(ID.unique(), email, password, `${firstName} ${lastName}`);

        if (!newUserAccount) throw new Error("Error creating user");
        
        const dwollaCustomerUrl = await createDwollaCustomer({
            ...userData,
            type: 'personal'
        });

        if (!dwollaCustomerUrl) throw new Error("Error creating dwolla customer");
        
        const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl)
        
        const newUser = await database.createDocument(
            DATABASE_ID!,
            USER_COLLECTION_ID!,
            ID.unique(),
            {
                ...userData,
                userId: newUserAccount.$id,
                dwollaCustomerId,
                dwollaCustomerUrl
            }
        )

        console.log(`User creation response ${newUserAccount}`)

        const session = await account.createEmailPasswordSession(email, password);

        cookies().set("banking-core-session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });
        return parseStringify(newUser);
    } catch (error) {
        console.log(error)
    }
}

export async function getLoggedInUser() {
    try {
        const { account } = await createSessionClient();
        const userData = await account.get();
        return parseStringify(userData)
    } catch (error) {
        console.log(error);
        return null;
    }
}

export const logoutAccount = async () => {
    try {
        const { account } = await createSessionClient();
        cookies().delete('banking-core-session')
        return await account.deleteSession('current');
    } catch (error) {
        return null
    }
}

export const createLinkToken = async (user: User) => {
    try {
        const tokenParams = {
            user: {
                client_user_id: user.$id
            },
            client_name: `${user.firstName} ${user.lastName}`,
            products: ['auth'] as Products[],
            language: 'en',
            country_codes: ['US'] as CountryCode[]
        }
        const response = await plaidClient.linkTokenCreate(tokenParams);
        return parseStringify({ linkToken: response.data.link_token });
    } catch (error) {
        console.error(error);
    }
}

export const createBankAccount = async ({
    userId,
    bankId,
    accountId,
    accessToken,
    fundingSourceUrl,
    shareableId
}: createBankAccountProps) => {
    try {
        const { database } = await createAdminClient();
        const account = await database.createDocument(
            DATABASE_ID!,
            BANK_COLLECTION_ID!,
            ID.unique(),
            {
                userId,
                bankId,
                accountId,
                accessToken,
                fundingSourceUrl,
                shareableId
            }
        );
    } catch (error) {
        console.log(error);
    }
}

export const exchangePublicToken = async ({ publicToken, user }: exchangePublicTokenProps) => {
    try {
        //Get public token for access token and item id
        const response = await plaidClient.itemPublicTokenExchange({
            public_token: publicToken
        })
        const accessToken = response.data.access_token;
        const itemId = response.data.item_id;
        console.log(`Public access token ${accessToken} - ${itemId}`)

        // Get account information from plaid using the access token
        const accountResponse = await plaidClient.accountsGet({
            access_token: accessToken
        })

        const accountData = accountResponse.data.accounts[0]
        console.log(`Account ${accountData}`)

        // Create a processor token for Dwolla using the access token and account ID
    const request: ProcessorTokenCreateRequest = {
        access_token: accessToken,
        account_id: accountData.account_id,
        processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum,
      };
  
      const processorTokenResponse = await plaidClient.processorTokenCreate(request);
      const processorToken = processorTokenResponse.data.processor_token;
  
       // Create a funding source URL for the account using the Dwolla customer ID, processor token, and bank name
       const fundingSourceUrl = await addFundingSource({
        dwollaCustomerId: user.dwollaCustomerId,
        processorToken,
        bankName: accountData.name,
      });
      
      // If the funding source URL is not created, throw an error
      if (!fundingSourceUrl) throw Error;
  
      // Create a bank account using the user ID, item ID, account ID, access token, funding source URL, and shareableId ID
      await createBankAccount({
        userId: user.userId,
        bankId: itemId,
        accountId: accountData.account_id,
        accessToken,
        fundingSourceUrl,
        shareableId: encryptId(accountData.account_id),
      });
  
      // Revalidate the path to reflect the changes
      revalidatePath("/");
  
      // Return a success message
      return parseStringify({
        publicTokenExchange: "complete",
      });
    } catch (error) {
        console.error(error)
    }
}

export const getBanks = async ({userId}: getBanksProps) => {
    console.log(`Requesting user id ${userId}`)
    try {
        const {database} = await createAdminClient()
        const banks = await database.listDocuments(
            DATABASE_ID!,
            BANK_COLLECTION_ID!,
            [Query.equal('userId', [userId])]
        )
        return parseStringify(banks.documents)
    } catch (error) {
        console.log(error)
    }
}

export const getBank = async ({documentId}: getBankProps) => {
    try {
        const {database} = await createAdminClient()
        const bank = await database.listDocuments(
            DATABASE_ID!,
            BANK_COLLECTION_ID!,
            [Query.equal('$id', [documentId])]
        )
        return parseStringify(bank.documents[0])
    } catch (error) {
        console.log(error)
    }
}