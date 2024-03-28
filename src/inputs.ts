import * as core from '@actions/core';
import { Inputs } from './constants';
import { NoFileOptions } from './enums';

export interface UploadInputs {
  credentials: Record<string, string>;
  folderId: string;
  path: string;
  name: string;
  overwrite: boolean;
  ifNoFilesFound: NoFileOptions;
  recreateDirStructure: boolean;
}

/**
 * Helper to get all the inputs for the action
 */
export function getInputs(): UploadInputs {
  const credentialsBase64 = core.getInput(Inputs.Credentials, { required: true });
  const folderId = core.getInput(Inputs.FolderId, { required: true });
  const path = core.getInput(Inputs.Path, { required: true });
  const name = core.getInput(Inputs.Name, { required: false });
  const overwrite = core.getInput(Inputs.Overwrite, { required: false });
  const ifNoFilesFound = core.getInput(Inputs.IfNoFilesFound, { required: false });
  const recreateDirStructure = core.getInput(Inputs.RecreateDirectoryStructure, {
    required: false,
  });

  const credentials = JSON.parse(
    Buffer.from(credentialsBase64, 'base64').toString('utf-8'),
  );

  const noFileBehavior: NoFileOptions = NoFileOptions[ifNoFilesFound];

  if (!noFileBehavior) {
    core.setFailed(
      `Unrecognized ${
        Inputs.IfNoFilesFound
      } input. Provided: ${ifNoFilesFound}. Available options: ${Object.keys(
        NoFileOptions,
      )}`,
    );
  }

  return {
    credentials,
    folderId,
    path,
    name: name || path.split('/').pop() || 'file',
    overwrite: overwrite === 'true',
    ifNoFilesFound: noFileBehavior,
    recreateDirStructure: recreateDirStructure === 'true',
  };
}
