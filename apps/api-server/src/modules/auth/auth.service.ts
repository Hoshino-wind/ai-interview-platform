import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async validateUser(email: string, password: string): Promise<any> {
    return {
      id: `user_${email}`,
      email,
      passwordValidated: password.length >= 8,
    };
  }

  async login(user: any) {
    return {
      access_token: `dev-token-${user.id}`,
      user,
    };
  }
}
