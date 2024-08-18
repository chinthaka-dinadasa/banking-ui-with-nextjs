# Banking SaaS MVP - UI with NextJS 14

This project is a Banking SaaS MVP (Minimum Viable Product) UI built using Next.js 14 and TypeScript. The application is designed to integrate with Plaid and Dwolla for financial data aggregation and payment processing. It also includes Shadcdn for asset delivery and Sentry for error tracking and monitoring.

## Features

- **Next.js 14**
- **TypeScript**
- **Shadcdn**
- **Tailwind CSS**
- **Plaid Integration**: Securely connects bank accounts and retrieves financial data.
- **Dwolla Integration**: Manages and processes ACH transfers, bank account verifications, and more.
- **Sentry**: Error tracking and monitoring for real-time application diagnostics.

## Screenshots

### Dashboard Overview
![Sign In](screenshots/Screenshot%202024-08-18%20at%2015.10.10.png)
![Sign Up](screenshots/Screenshot%202024-08-18%20at%2015.16.02.png)
![Dashboard](screenshots/Screenshot%202024-08-18%20at%2015.11.38.png)
![Connect Bank Accounts with Plaid](screenshots/Screenshot%202024-08-18%20at%2015.11.54.png)
![My Bank Accounts](screenshots/Screenshot%202024-08-18%20at%2015.12.33.png)
![Transaction History](screenshots/Screenshot%202024-08-18%20at%2015.12.53.png)

## Getting Started

### Prerequisites

Ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (v18.x or higher)
- [Plaid Sandbox API credentials](https://plaid.com/docs/quickstart/)
- [Dwolla Sandbox API credentials](https://developers.dwolla.com/guides/)

### Steps to Run

```bash
$ git clone https://github.com/chinthaka-dinadasa/banking-ui-with-nextjs.git

$ cd banking-ui-with-nextjs

$ cp env-sample .env

$ npm run dev
```
