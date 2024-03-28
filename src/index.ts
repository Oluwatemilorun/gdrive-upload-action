import * as core from '@actions/core';
import { getInputs } from './inputs';
import { createDriveFolder, getDrive, uploadFile } from './drive';
import { findFilesToUpload } from './search';
import { NoFileOptions } from './enums';

async function run(): Promise<void> {
  const {
    credentials,
    name,
    path,
    folderId,
    overwrite,
    ifNoFilesFound,
    recreateDirStructure,
  } = getInputs();

  const drive = getDrive(credentials);
  const searchResult = await findFilesToUpload(path);

  if (searchResult.filesToUpload.length === 0) {
    // No files were found, different use cases warrant different types of behavior if nothing is found
    switch (ifNoFilesFound) {
      case NoFileOptions.warn: {
        core.warning(
          `No files were found with the provided path: ${path}. No artifacts will be uploaded.`,
        );
        break;
      }
      case NoFileOptions.error: {
        core.setFailed(
          `No files were found with the provided path: ${path}. No artifacts will be uploaded.`,
        );
        break;
      }
      case NoFileOptions.ignore: {
        core.info(
          `No files were found with the provided path: ${path}. No artifacts will be uploaded.`,
        );
        break;
      }
    }
  } else {
    const s = searchResult.filesToUpload.length === 1 ? '' : 's';
    core.info(
      `With the provided path, there will be ${searchResult.filesToUpload.length} file${s} uploaded`,
    );
    core.debug(`Root artifact directory is ${searchResult.rootDirectory}`);

    // TODO: Check if number of files is greater than the maximum number of files that can be uploaded to Google Drive

    for (const file of searchResult.filesToUpload) {
      console.log(`Processing file ${file}`);

      let newFolderId = folderId;
      if (recreateDirStructure) {
        for (const dir of path.split('/')) {
          newFolderId = await createDriveFolder(drive, newFolderId, dir);
        }
      }

      await uploadFile(drive, file, newFolderId, name, overwrite);
    }
  }
}

run().catch((error) => {
  core.setFailed(error.message);
});
