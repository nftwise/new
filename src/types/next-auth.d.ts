import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      companyName: string;
      gaPropertyId?: string;
      adsCustomerId?: string;
      callrailAccountId?: string;
    }
  }

  interface User {
    id: string;
    email: string;
    name: string;
    companyName: string;
    gaPropertyId?: string;
    adsCustomerId?: string;
    callrailAccountId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    companyName?: string;
    gaPropertyId?: string;
    adsCustomerId?: string;
    callrailAccountId?: string;
  }
}