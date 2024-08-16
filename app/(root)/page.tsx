import HeaderBox from "@/components/HeaderBox";
import RightSidebar from "@/components/RightSidebar";
import TotalBalanceBox from "@/components/TotalBalanceBox";
import { getAccount, getAccounts } from "@/lib/actions/bank.actions";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import React from "react";

const Home = async ({searchParams: {id, page}} : SearchParamProps) => {

  const loggedIn = await getLoggedInUser();
  console.log(`Reading logged in user ${JSON.stringify(loggedIn)}`)
  const accounts = await getAccounts({userId: loggedIn.$id});
  
  if (!accounts) return;
  const accountsData = accounts?.data;
  console.log(accountsData)
  const appWriteItemId = accountsData[0].appwriteItemId
  console.log(appWriteItemId)
  // const account = await getAccount({appwriteItemId: appWriteItemId})

  return (
    <section className="home">
      <div className="home-content">
        <header className="home-header">
          <HeaderBox
            type="greeting"
            title="Welcome"
            user={loggedIn?.name || "Guest"}
            subtext="Access and manage your account and transactions efficiently."
          />
          <TotalBalanceBox
            accounts={accountsData}
            totalBanks={accounts?.totalBanks}
            totalCurrentBalance={accounts?.totalCurrentBalance}
          />
        </header>
        RECENT TRANSACTIONS
      </div>
      <RightSidebar user={loggedIn} 
      transactions= {[]}
      banks={[{currentBalance: 123.50}, {currentBalance: 12.00}]}/>
    </section>
  );
};

export default Home;
