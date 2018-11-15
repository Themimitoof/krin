# Krin: Share instantaneously files and pictures
Krin is a simple server that host files and pictures for sharing instantaneously with your collegues or your friends built in _NodeJS_ and _SQLite_.
It can be used by multiple users by creating new _API key_ for each person.


## Prerequisites
You only need to have [Node.JS](https://nodejs.org/en/download/) installed on your machine.


## Docker installation
_WIP_

## Manual installation
_WIP_

## Usage
### Routes
#### `GET /files`
Headers:
 * `X-Api-Key`: _user's api key_
 * _(optionnal)_ `Content-type`: _return the error message in JSON if the value is `application/json`, otherwise is return in plain text._

Return: _Return the link to the file._

#### `POST /files`
Headers:
 * `X-Api-Key`: _user's api key_
 * _(optionnal)_ `Expires-At`: expiration date of the ressource in _`RFC2822` or `ISO8601` format_.

Return: _Return the list of user's files._

#### `GET /files/:filename`
Headers:
 * _(optionnal)_ `Content-type`: _return the error message in JSON if the value is `application/json`, otherwise is return in plain text._

Return: _Return the requested file or error message._

#### `DELETE /files/:filename`
Headers:
 * `X-Api-Key`: _user's api key_
 * _(optionnal)_ `Content-type`: _return the error message in JSON if the value is `application/json`, otherwise is return in plain text._

Return: _Return validation message or error message._


### Examples
#### **Get users file list**
```bash
curl -H "X-Api-Key: <my_api_key>" http://<link_to_my_instance>/files
```

Return:
```json
[
    {
        "uuid": "2bfe71af-3ca5-4c2b-a148-da1eb1b88b36",
        "file": "2732b422634229d30187ea25a930af13.jpg",
        "owner": "4faa8b88-d63b-11e8-9f8b-f2801f1b9fd1",
        "expireAt": null,
        "createdAt": "2018-10-31 08:07:22.760 +00:00",
        "updatedAt": "2018-10-31 08:07:22.760 +00:00"
    },
    ...
]
```

#### **Uploading a file with cURL**
```bash
curl -X POST -H "X-Api-Key: <my_api_key>" -d @<file> http://<link_to_my_instance>/files
```

Return: `http://<link_to_my_instance>/files/fkjldsjlkdsjklsdjflkdsjklsdjfs`

#### Uploading a file with cURL and return in JSON:
```bash
curl -X POST -H "X-Api-Key: <my_api_key>" -H "Content-type: application/json" -d @<file> http://<link_to_my_instance>/files
```

Return:
```json
{
    "code": 200,
    "message": "http://<link_to_my_instance>/files/fkjldsjlkdsjklsdjflkdsjklsdjfs"
}
```

#### **Uploading a file with expiration date with cURL**
```bash
curl -X POST -H "X-Api-Key: <my_api_key>" -H "Expires-At: Mon, Dec 24 2018 23:59:59 GMT" -d @<file> http://<link_to_my_instance>/files
```

Return: `http://<link_to_my_instance>/files/enzjrkzenrezkjrnezjknrzjke`

#### **Delete a file with cURL**
```bash
curl -X DELETE -H "X-Api-Key: <my_api_key>" http://<link_to_my_instance>/files/<file_name>
```

Return: `File deleted`

#### **Delete a file with cURL and return in JSON**
```bash
curl -X DELETE -H "X-Api-Key: <my_api_key>" -H "Content-type: application/json" -d @<file> http://<link_to_my_instance>/files/<file_name>
```

Return:
```json
{
    "code": 200,
    "message": "File deleted"
}
```

## Command lines
_WIP_


## Limitation
Today, Krin uses _[file-type](https://www.npmjs.com/package/file-type) module_ to determine the MIME type and the extension of the file. If is not recognized by the module, it fallback automaticaly to _application/octet-stream_.


## Contribution
Feel free to contribute to the project by creating issues or merge request for implementing new features or patch bug.


## License
Krin is released with [MIT License](LICENSE).