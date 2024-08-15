'use server'

import { ID } from "node-appwrite"
import { createAdminClient, createSessionClient } from "../appwrite"
import { cookies } from "next/headers"
import { parseStringify } from "../utils"

export const signIn = async (userData: signInProps) => {
    try {
        const { account } = await createAdminClient();
        const sessionData = await account.createEmailPasswordSession(userData.email, userData.password);
        return parseStringify(sessionData)
    } catch (error) {
        console.log(error)
    }
}

export const signUp = async (userData: SignUpParams) => {
    try {
        //Mutation / Database / Make fetch
        const { account } = await createAdminClient();
        const { email, password, firstName, lastName } = userData
        const newUserAccount = await account.create(ID.unique(), email, password, `${firstName} ${lastName}`);
        
        console.log(`User creation response ${newUserAccount}`)
        
        const session = await account.createEmailPasswordSession(email, password);

        cookies().set("banking-core-session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });
        return parseStringify(newUserAccount);
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
        return null;
    }
}

export const logoutAccount = async () => {
    try {
        const { account } = await createSessionClient();
        cookies().delete('banking-core-session')
        await account.deleteSession('current');
    } catch (error) {
        return null
    }
}