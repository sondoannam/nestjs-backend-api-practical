import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UploadedFiles,
  Query,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { storage } from './oss';
import * as path from 'path';
import * as fs from 'fs';
import { Response } from 'express';
import { MyLogger } from 'src/logger/my.logger';

@Controller('user')
export class UserController {
  private readonly logger = new MyLogger();
  constructor(private readonly userService: UserService) {}

  @Post('new')
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.userService.register(registerUserDto);
  }

  @Get('merge-file')
  mergeFile(@Query('file') fileName: string, @Res() res: Response) {
    const nameDir = 'uploads/' + fileName;
    const files = fs.readdirSync(nameDir);

    let startPos = 0,
      countFile = 0;

    files.forEach((file) => {
      const filePath = nameDir + '/' + file;
      console.log('filePath: ', filePath);
      const streamFile = fs.createReadStream(filePath);
      streamFile
        .pipe(
          fs.createWriteStream('uploads/merge/' + fileName, {
            start: startPos,
          }),
        )
        .on('finish', () => {
          countFile++;
          if (countFile === files.length) {
            fs.rm(nameDir, { recursive: true }, () => {});
            console.log('all files merged and deleted');
          }
        });

      startPos += fs.statSync(filePath).size;
    });

    return res.json({
      link: `http://localhost:3000/uploads/merge/${fileName}`,
      fileName,
    });
  }

  @Post('upload/large-file')
  @UseInterceptors(FilesInterceptor('files', 20, { dest: 'uploads' }))
  uploadLargeFile(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body,
  ) {
    console.log('body', body);
    console.log('files', files);

    const fileName = body.name.match(/(.*)\.part\d+/)?.[1] ?? body.name;
    const nameDir = 'uploads/chunks-' + fileName;

    if (!fs.existsSync(nameDir)) {
      fs.mkdirSync(nameDir);
    }

    fs.cpSync(files[0].path, nameDir + '/' + body.name);

    fs.rmSync(files[0].path);
  }

  @Post('upload/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: 'uploads/avatar',
      storage: storage,
      limits: {
        fileSize: 1024 * 1024 * 5, // 5MB
      },
      fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(
          path.extname(file.originalname).toLowerCase(),
        );

        if (mimetype && extname) {
          return cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Error: File upload only supports the following filetypes - ' +
                filetypes,
            ),
            false,
          );
        }
      },
    }),
  )
  uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    return file.path;
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
