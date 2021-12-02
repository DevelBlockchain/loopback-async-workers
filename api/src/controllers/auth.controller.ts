import { authenticate, AuthenticationBindings } from "@loopback/authentication";
import { Getter, inject, service } from "@loopback/core";
import { Count, CountSchema, repository } from "@loopback/repository";
import { get, getModelSchemaRef, HttpErrors, param, post, requestBody, response } from "@loopback/rest";
import { PermissionsTypes, RoleTypes } from "../authorization/PermissionsTypes";
import { Users } from "../models";
import { UsersRepository } from "../repositories";
import { AuthProvider } from "../services";
import { CredentialsDTO, InfoJWT, MeDTO, NewPassword, TokenWithUserDTO, ValueBooleanDTO, ValueDTO } from "../types";

export class AuthController {
  constructor(
    @service(AuthProvider) private authProvider: AuthProvider,
    @repository(UsersRepository) private usersRepository: UsersRepository,
    @inject.getter(AuthenticationBindings.CURRENT_USER) public getCurrentUser: Getter<InfoJWT>,
  ) { }

  @post('/api/v1/auth/signin', {
    security: [],
    responses: {
      '200': {
        description: 'Token JWT',
        content: {
          'application/json': {
            schema: getModelSchemaRef(TokenWithUserDTO),
          }
        },
      },
    },
  })
  async signin(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CredentialsDTO, {
            exclude: ['partnersId']
          }),
        },
      },
    })
    credential: CredentialsDTO,
  ): Promise<TokenWithUserDTO> {
    try {
      let user = await this.usersRepository.findOne({
        where: {
          username: credential.username
        },
        include: [{
          relation: 'roles',
          scope: {
            include: ['permissions']
          }
        }]
      })
      if (user == null) throw new Error("User not found");

      let comparePassword = await this.authProvider.checkPassword(credential.password, user.password);
      if (!comparePassword) throw new Error("Wrong password");
      if (user.enable2FA) {
        if (!credential.code || !this.authProvider.verifyTwoFactor(user.secondFactor, credential.code)) {
          throw new Error("2FA");
        }
      }
      return await this.authProvider.createToken(user);
    } catch (err: any) {
      throw new HttpErrors.BadRequest(err.message);
    }
  }

  @authenticate({ strategy: 'basic', options: [PermissionsTypes.USER, true] })
  @post('/api/v1/auth/signup', {
    responses: {
      '204': {
        description: 'Registered Successfully'
      },
    },
  })
  async signup(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CredentialsDTO, {
            exclude: ['code', 'partnersId']
          }),
        },
      },
    })
    credential: CredentialsDTO,
  ): Promise<void> {
    try {
      let user = await this.usersRepository.findOne({
        where: {
          username: credential.username
        },
      })
      if (user !== null) throw new Error("Username already registered");

      let info = await this.getCurrentUser();
      user = await this.usersRepository.findById(info.id)
      if (user === null) throw new Error("User not found");
      if (!user.partnersId) throw new Error("Partner not found");
      let newUser = new Users({
        username: credential.username,
        password: await this.authProvider.cryptPassword(credential.password),
        rolesId: RoleTypes.PARTNER,
        partnersId: user.partnersId,
      });
      await this.usersRepository.create(newUser);
    } catch (err: any) {
      console.log(err);
      throw new HttpErrors.BadRequest(err.message);
    }
  }

  @authenticate({ strategy: 'basic', options: [PermissionsTypes.ADMIN, true] })
  @post('/api/v1/auth/signup/partner', {
    responses: {
      '204': {
        description: 'Registered Successfully'
      },
    },
  })
  async signupPartner(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CredentialsDTO, {
            exclude: ['code']
          }),
        },
      },
    })
    credential: CredentialsDTO,
  ): Promise<void> {
    try {
      let user = await this.usersRepository.findOne({
        where: {
          username: credential.username
        },
      })
      if (user !== null) throw new Error("Username already registered");

      let newUser = new Users({
        partnersId: credential.partnersId,
        username: credential.username,
        password: await this.authProvider.cryptPassword(credential.password),
        rolesId: RoleTypes.PARTNER,
      });
      await this.usersRepository.create(newUser);
    } catch (err: any) {
      console.log(err);
      throw new HttpErrors.BadRequest(err.message);
    }
  }

  @get('/api/v1/auth/2fa/has/{username}', {
    security: [],
    responses: {
      '200': {
        description: 'Enable 2FA',
        content: {
          'application/json': {
            schema: getModelSchemaRef(ValueBooleanDTO),
          }
        },
      },
    },
  })
  async has2FA(
    @param.path.string('username') username: string,
  ): Promise<ValueBooleanDTO> {
    try {
      let user = await this.usersRepository.findOne({
        where: {
          username: username
        }
      })
      if (user !== null && user.enable2FA) {
        return new ValueBooleanDTO({ value: true });
      };
      return new ValueBooleanDTO({ value: false });
    } catch (err: any) {
      console.log(err);
      throw new HttpErrors.BadRequest(err.message);
    }
  }

  @authenticate('basic')
  @get('/api/v1/auth/2fa/generate')
  @response(200, {
    description: 'generate new second factor secret',
    content: { 'application/json': { schema: getModelSchemaRef(ValueDTO) } },
  })
  async generateSecondFactor(): Promise<ValueDTO> {
    let info = await this.getCurrentUser();
    try {
      let user = await this.usersRepository.findById(info.id);
      if (user == null) throw new Error("User not found");
      if (!user.enable2FA) {
        if (!user.secondFactor) {
          user.secondFactor = this.authProvider.generateTwoFactorSecret(user.username);
          await this.usersRepository.update(user);
        }
        return new ValueDTO({ value: user.secondFactor });
      } else {
        throw new Error("2FA enabled");
      }
    } catch (err: any) {
      console.log(err);
      throw new HttpErrors.BadRequest(err.message);
    }
  }

  @authenticate('basic')
  @post('/api/v1/auth/2fa/enable')
  @response(204, {
    description: 'enable second factor',
  })
  async enableSecondFactor(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ValueDTO),
        },
      },
    })
    credential: ValueDTO,
  ): Promise<void> {
    let info = await this.getCurrentUser();
    try {
      let user = await this.usersRepository.findById(info.id);
      if (user == null) throw new Error("User not found");
      if (!this.authProvider.verifyTwoFactor(user.secondFactor, credential.value)) {
        throw new Error("2FA");
      }
      user.enable2FA = true;
      await this.usersRepository.update(user);
    } catch (err: any) {
      console.log(err);
      throw new HttpErrors.BadRequest(err.message);
    }
  }

  @authenticate('basic')
  @post('/api/v1/auth/2fa/disable')
  @response(204, {
    description: 'disable second factor',
  })
  async disableSecondFactor(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TokenWithUserDTO),
        },
      },
    })
    credential: TokenWithUserDTO,
  ): Promise<void> {
    let info = await this.getCurrentUser();
    try {
      let user = await this.usersRepository.findById(info.id);
      if (user == null) throw new Error("User not found");
      if (!this.authProvider.verifyTwoFactor(user.secondFactor, credential.token)) {
        throw new Error("2FA");
      }
      user.enable2FA = false;
      user.secondFactor = '';
      await this.usersRepository.update(user);
    } catch (err: any) {
      console.log(err);
      throw new HttpErrors.BadRequest(err.message);
    }
  }

  @authenticate('basic')
  @post('/api/v1/auth/change_password', {
    responses: {
      '204': {
        description: 'OK',
        content: {},
      },
    },
  })
  async changePassword(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(NewPassword),
        },
      },
    }) credential: NewPassword
  ): Promise<void> {
    let userInfo = await this.getCurrentUser();
    let user = await this.usersRepository.findById(userInfo.id);
    user.password = await this.authProvider.cryptPassword(credential.password);
    await this.usersRepository.update(user);
  }

  @authenticate('basic')
  @get('/api/v1/auth/me')
  @response(200, {
    description: 'User Info',
    content: { 'application/json': { schema: getModelSchemaRef(MeDTO) } },
  })
  async me(): Promise<MeDTO> {
    let infoUser = await this.getCurrentUser();
    let user = await this.usersRepository.findById(infoUser.id);
    return new MeDTO({
      infoUser,
      user
    });
  }

  @authenticate({ strategy: 'basic', options: [PermissionsTypes.USER, true] })
  @get('/api/v1/auth/users')
  @response(200, {
    description: 'User Array',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Users),
        }
      }
    },
  })
  async users(): Promise<Users[]> {
    let info = await this.getCurrentUser();
    try {
      let user = await this.usersRepository.findById(info.id);
      if (user == null) throw new Error("User not found");
      return await this.usersRepository.find({
        where: {
          partnersId: user.partnersId
        }
      });
    } catch (err: any) {
      console.log(err);
      throw new HttpErrors.BadRequest(err.message);
    }
  }

  @authenticate({ strategy: 'basic', options: [PermissionsTypes.ADMIN, true] })
  @get('/api/v1/auth/all-users')
  @response(200, {
    description: 'User Array',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Users),
        }
      }
    },
  })
  async allUsers(): Promise<Users[]> {
    return await this.usersRepository.find();
  }
}
