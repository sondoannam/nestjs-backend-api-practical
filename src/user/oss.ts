import * as multer from 'multer';
import * as fs from 'fs';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      fs.mkdirSync('uploads');
    } catch (error) {
      console.log(
        'Directory already exists or error creating directory:',
        error,
      );
    }

    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() +
      '-' +
      Math.round(Math.random() * 1e9) +
      '-' +
      file.originalname;

    cb(null, uniqueSuffix);
  },
});

// const upload = multer({ storage: storage });
export { storage };
