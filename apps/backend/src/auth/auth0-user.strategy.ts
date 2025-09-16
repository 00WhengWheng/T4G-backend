import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-auth0';
import auth0Config from './auth0.config';

@Injectable()
export class Auth0UserStrategy extends PassportStrategy(Strategy, 'auth0-user') {
  constructor(
    @Inject(auth0Config.KEY)
    private config: ConfigType<typeof auth0Config>,
  ) {
    super({
      domain: config.userDomain,
      clientID: config.userClientId,
      clientSecret: config.userClientSecret,
      callbackURL: config.callbackUrlUser,
    });
  }

  async validate(accessToken: string, refreshToken: string, extraParams: any, profile: any) {
    return {
      id: profile.id,
      email: profile.emails?.[0]?.value || profile.email,
      name: profile.displayName || profile.name,
      picture: profile.picture,
      accessToken,
      refreshToken,
      type: 'user',
      domain: 't4g.fun',
    };
  }
}