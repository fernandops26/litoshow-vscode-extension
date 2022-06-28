import fs from 'fs';
const fsExtra = require('fs-extra');

export const ensureFilepath = (filePath: string): void => {
  if (!fs.existsSync(filePath)) {
    fsExtra.ensureFileSync(filePath);
  }
};
