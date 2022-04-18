import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './dto/jwt-payload.interface';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UsersRepository) private usersRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    return this.usersRepository.createUser(authCredentialsDto);
  }

  async signIn(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<AuthResponseDto> {
    const { username, password } = authCredentialsDto;
    const user = await this.usersRepository.findOne({
      where: { username },
    });
    if (user) {
      const result = await bcrypt.compare(password, user.password);
      if (result) {
        const payload: JwtPayload = { username };
        const accessToken: string = await this.jwtService.sign(payload);
        return { accessToken };
      }
    }
    throw new UnauthorizedException('Incorrect username or password');
  }
}