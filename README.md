# gdrive-upload-action

Github action for uploading files to Google Drive using a service account credential to authenticate

## Before you Begin
- You need to create a Google Cloud service account from the [credentials dashboard](https://console.cloud.google.com/apis/credentials)
- Click on the keys tab of the created service account and generate a JSON key. The key will be automatically downloaded.
- Convert the downloaded JSON key file into a base64 string and paste the copied string into your account secret entry tab
    ```sh
    base64 -i service-account-key.json | pbcopy
    ```
- Share the Google Drive (folder) with the service account. To achieve this, share the folder like you would normally with a friend, except you share it with the service account email address.
- Enable the [Google Drive API](https://console.developers.google.com/apis/api/drive.googleapis.com/overview) for the project with the service account created. Find more info about that [here](https://support.google.com/googleapi/answer/7014113?hl=en).

## Available Inputs

| Field | Required | Description |
| - |:-:| - |
| ``credentials`` | **YES** | A base64 encoded string with the [Google Service Account credentials](https://stackoverflow.com/questions/46287267/how-can-i-get-the-file-service-account-json-for-google-translate-api/46290808). |
| ``folder-id`` | **YES** | The [ID of the folder](https://ploi.io/documentation/database/where-do-i-get-google-drive-folder-id) you want to upload to. |
| ``path`` | **YES** | A file, directory or wildcard pattern that describes what to upload |
| ``name`` | **NO** | The name you want the file to have in Google Drive. If this input is not provided, it will use only the filename of the source path. It will be ignored if there are more than one file to be uploaded. |
| ``overwrite`` | **NO** | If you want to overwrite the filename with existing file, it will use the target filename. |
| ``if-no-files-found`` | **NO** | The desired behaviour if no files are found using the provided path. Available Options:<br>  `warn`: Output a warning but do not fail the action<br>`error`: Fail the action with an error message<br>`ignore`: Do not output any warnings or errors, the action does not fail |
| ``recreate-directory-structure`` | **NO** | If true, the directory structure of the source file will be recreated relative to ``folder-id``. |


## Usage Example Workflow
In this example we stored the folder-id and credentials as action secrets. This is highly recommended as leaking your credentials key will allow anyone to use your service account.
```yaml
# .github/workflows/main.yml
name: Main
on: [push]

jobs:
  my_job:
    runs-on: ubuntu-latest

    steps:

      - name: Checkout code
        uses: actions/checkout@v2

      - name: Archive files
        run: |
          sudo apt-get update
          sudo apt-get install zip
          zip -r archive.zip *

      - name: Upload to gdrive
        uses: Oluwatemilorun/gdrive-upload-action@main
        with:
          credentials: ${{ secrets.GDRIVE_SERVICE_ACCOUNT }}
          folder-id: ${{ secrets.GDRIVE_FOLDER_ID }}
          path: archive.zip
          name: "documentation.zip" # optional string
          overwrite: "true" # optional boolean
          
```