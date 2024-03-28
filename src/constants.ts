export const Scopes = ['https://www.googleapis.com/auth/drive.metadata.readonly'];

export const Inputs = {
  /**
   * Base64 encoded Google service account credentials
   */
  Credentials: 'credentials',
  /**
   * Google Drive folder ID to upload the file to
   */
  FolderId: 'folder-id',
  /**
   * A file, directory or wildcard pattern that describes what to upload
   */
  Path: 'path',
  /**
   * Optional name for the target file
   */
  Name: 'name',
  /**
   * Whether to overwrite an existing file with the same name.
   */
  Overwrite: 'overwrite',
  /**
   * The desired behavior if no files are found using the provided path.
   * Available Options:
   * - `warn`: Output a warning but do not fail the action
   * - `error`: Fail the action with an error message
   * - `ignore`: Do not output any warnings or errors, the action does not fail
   */
  IfNoFilesFound: 'if-no-files-found',
  /**
   * If true, recreate the directory structure of the source file relative to the folderId
   */
  RecreateDirectoryStructure: 'recreate-directory-structure',
} as const;
