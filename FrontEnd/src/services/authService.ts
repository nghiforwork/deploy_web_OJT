import { http } from '@/utils/config';
import { User } from 'next-auth';
import { AdapterUser } from 'next-auth/adapters';

export async function loginUser(
  provider: string | undefined,
  token: string | undefined,
  user: User | AdapterUser
): Promise<boolean> {
  try {

    const response = await http.post(`/auth/login/${provider}/`, {
      token: token
    });

    user.access = response.data.access;
    user.userId = response.data.userId;
    console.log('Successfully logged in:', response.data);
    return true;
  } catch (error: any) {
    console.error('Error during login:', error.message);
    return false;
  }
}
