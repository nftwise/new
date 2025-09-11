import NextAuth from 'next-auth/next'
import CredentialsProvider from 'next-auth/providers/credentials'
import fs from 'fs'
import path from 'path'

const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔐 NextAuth authorize called with:', { email: credentials?.email });
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials');
          return null;
        }

        try {
          // Read clients from JSON file (development authentication)
          const filePath = path.join(process.cwd(), 'src', 'data', 'clients.json');
          console.log('📁 Reading clients from:', filePath);
          
          const fileContents = fs.readFileSync(filePath, 'utf8');
          const clientsData = JSON.parse(fileContents);
          
          console.log('📊 Total clients loaded:', clientsData.clients?.length || 0);
          
          // Find user by email and validate password
          const user = clientsData.clients.find((client: any) => client.email === credentials.email);
          
          if (!user) {
            console.log('❌ User not found for email:', credentials.email);
            return null;
          }
          
          console.log('👤 User found:', { id: user.id, email: user.email, company: user.companyName });
          
          // Simple password validation (for JSON file auth)
          const isPasswordValid = credentials.password === user.password;
          
          if (!isPasswordValid) {
            console.log('❌ Invalid password for user:', credentials.email);
            return null;
          }
          
          console.log('✅ Authentication successful for:', credentials.email);
          
          // Return user object for session
          return {
            id: user.id,
            email: user.email,
            name: user.companyName,
            companyName: user.companyName,
            googleAnalyticsPropertyId: user.googleAnalyticsPropertyId,
            googleAdsCustomerId: user.googleAdsCustomerId,
            callrailAccountId: user.callrailAccountId
          };
        } catch (error) {
          console.error('🚨 Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.companyName = user.companyName;
        token.googleAnalyticsPropertyId = user.googleAnalyticsPropertyId;
        token.googleAdsCustomerId = user.googleAdsCustomerId;
        token.callrailAccountId = user.callrailAccountId;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.companyName = token.companyName as string;
        session.user.googleAnalyticsPropertyId = token.googleAnalyticsPropertyId as string;
        session.user.googleAdsCustomerId = token.googleAdsCustomerId as string;
        session.user.callrailAccountId = token.callrailAccountId as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt' as const,
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }