import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { DbService } from 'src/db/db.service';

@Injectable()
export class UserService {
  @Inject(DbService)
  private readonly dbService: DbService;

  async register(registerUserDto: RegisterUserDto) {
    const user = new User();

    user.username = registerUserDto.username;
    user.password = registerUserDto.password;

    await this.dbService.write(user);

    return user;
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
