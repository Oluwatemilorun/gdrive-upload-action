import * as fs from 'fs';
import { google, drive_v3 } from 'googleapis';

import { Scopes } from './constants';

export function getDrive(credentials: Record<string, string>): drive_v3.Drive {
  const auth = new google.auth.GoogleAuth({
    scopes: Scopes,
    credentials,
  });
  const drive = google.drive({ version: 'v3', auth });

  return drive;
}

export async function createDriveFolder(
  drive: drive_v3.Drive,
  folderId: string,
  name: string,
): Promise<string> {
  try {
    console.log(`Checking for existing folder ${name}`);
    const {
      data: { files },
    } = await drive.files.list({
      q: `name='${name}' and mimeType='application/vnd.google-apps.folder'`,
      fields: 'files(name,id,mimeType,parents)',
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      corpora: 'allDrives',
    });

    let foundFolders = 0;
    let nextFolderId = '';

    for (const file of files || []) {
      for (const parentId of file.parents || []) {
        if (parentId === folderId) {
          foundFolders++;
          console.log(`Found existing folder ${name}.`);
          nextFolderId = file.id || '';
        }
      }
    }

    if (foundFolders === 0) {
      console.log(`Creating folder: ${name}`);

      const response = await drive.files.create({
        resource: {
          name,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [folderId],
        },
        fields: 'id',
        supportsAllDrives: true,
      } as unknown as drive_v3.Params$Resource$Files$Create);

      nextFolderId = response.data.id || '';
    }

    return nextFolderId;
  } catch (error) {
    console.error('Unable to create/check folder:', error);
    throw new Error('Unable to create/check folder');
  }
}

export async function uploadFile(
  drive: drive_v3.Drive,
  path: string,
  folderId: string,
  name: string,
  overwriteFlag: boolean,
  mimeType?: string,
): Promise<void> {
  console.log(`target file name: ${name}`);

  if (overwriteFlag) {
    try {
      const r = await drive.files.list({
        fields: 'files(name,id,mimeType,parents)',
        q: `name='${name}'`,
        includeItemsFromAllDrives: true,
        corpora: 'allDrives',
        supportsAllDrives: true,
      });

      console.log(`Files: ${r.data.files ? r.data.files.length : 0}`);
      let currentFile: drive_v3.Schema$File | null = null;

      for (const file of r.data.files || []) {
        let found = false;

        if (name === file.name) {
          currentFile = file;

          for (const parentId of file.parents || []) {
            if (parentId === folderId) {
              console.log('file found in expected folder');
              found = true;
              break;
            }
          }
        }

        if (found) {
          break;
        }
      }

      if (!currentFile) {
        console.log('No similar files found. Creating a new file');
        await uploadToDrive(drive, path, folderId, null, name, mimeType);
      } else {
        console.log(`Overwriting file: ${currentFile.name} (${currentFile.id})`);
        await uploadToDrive(drive, path, folderId, currentFile, name, mimeType);
      }
    } catch (err) {
      console.error('Unable to retrieve files:', err);
      throw new Error('Unable to retrieve files');
    }
  } else {
    await uploadToDrive(drive, path, folderId, null, name, mimeType);
  }
}

async function uploadToDrive(
  drive: drive_v3.Drive,
  path: string,
  folderId: string,
  driveFile: drive_v3.Schema$File | null,
  name: string,
  mimeType?: string,
): Promise<void> {
  try {
    const stats = fs.lstatSync(path);

    if (stats.isDirectory()) {
      console.log(`${path} is a directory. Skipping upload.`);
      return;
    }

    const fileStream = fs.createReadStream(path);

    if (driveFile) {
      const fileMetadata: Partial<drive_v3.Schema$File> = {
        name,
        mimeType,
      };

      await drive.files.update({
        fileId: driveFile.id || '',
        resource: fileMetadata,
        addParents: [folderId],
        media: {
          body: fileStream,
          mimeType,
        },
        supportsAllDrives: true,
      } as unknown as drive_v3.Params$Resource$Files$Update);
    } else {
      const fileMetadata: Partial<drive_v3.Schema$File> = {
        name,
        mimeType,
        parents: [folderId],
      };

      await drive.files.create({
        resource: fileMetadata,
        media: {
          body: fileStream,
          mimeType,
        },
        supportsAllDrives: true,
      } as unknown as drive_v3.Params$Resource$Files$Create);
    }

    console.log('File uploaded/updated successfully.');
  } catch (err) {
    console.error('Creating/updating file failed:', err);
    throw new Error('Creating/updating file failed');
  }
}
