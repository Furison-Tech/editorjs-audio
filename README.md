![](https://badgen.net/badge/Editor.js/v2.0/blue)

# Audio Tool

Audio Block for the [Editor.js](https://editorjs.io).

> [!NOTE]  
> This tool is basically a copy of the [editor-js/image](https://github.com/editor-js/image) tool, rewritten to work with audio files, producing a HTML audio element.

## Features

- Uploading file from the device
- Pasting copied content from the web
- Pasting audios by drag-n-drop
- Pasting files from Clipboard
- Allows configuring if an audio file can be downloaded

**Notes**

This Tool requires server-side implementation for the file uploading. See [backend response format](#server-format) for more details.


## Installation

Get the package

```shell
yarn add @furison-tech/editorjs-audio
```

Include module at your application

```javascript
import AudioTool from '@furison-tech/editorjs-audio';
```

## Usage

Add a new Tool to the `tools` property of the Editor.js initial config.

```javascript
import AudioTool from '@furison-tech/editorjs-audio';

// or if you inject AudioTool via standalone script
const AudioTool = window.AudioTool;

var editor = EditorJS({
  ...

  tools: {
    ...
    audio: {
      class: AudioTool,
      config: {
        endpoints: {
          byFile: 'http://localhost:8008/uploadFile', // Your backend file uploader endpoint
          byUrl: 'http://localhost:8008/fetchUrl', // Your endpoint that provides uploading by Url
        }
      }
    }
  }

  ...
});
```

## Config Params

Audio Tool supports these configuration parameters:

| Field | Type     | Description        |
| ----- | -------- | ------------------ |
| endpoints | `{byFile: string, byUrl: string}` | Endpoints for file uploading. <br> Contains 2 fields: <br> __byFile__ - for file uploading <br> __byUrl__ - for uploading by URL |
| field | `string` | (default: `audio`) Name of uploaded audio field in POST request |
| types | `string` | (default: `audio/*`) Mime-types of files that can be [accepted with file selection](https://github.com/codex-team/ajax#accept-string).|
| additionalRequestData | `object` | Object with any data you want to send with uploading requests |
| additionalRequestHeaders | `object` | Object with any custom headers which will be added to request. [See example](https://github.com/codex-team/ajax/blob/e5bc2a2391a18574c88b7ecd6508c29974c3e27f/README.md#headers-object) |
| buttonContent | `string` | Allows to override HTML content of «Select file» button |
| uploader | `{{uploadByFile: function, uploadByUrl: function}}` | Optional custom uploading methods. See details below. |
| actions | `array` | Array with custom actions to show in the tool's settings menu. See details below. |

Note that if you don't implement your custom uploader methods, the `endpoints` param is required.

## Tool's settings

There is 1 block tune for configuring if an audio file can be downloaded or not.

> [!IMPORTANT]  
> A html audio element is downloadable by default. 
> The audio element the editor produces is NOT downloadable by default. 
> But, the restriction of downloading is done via the [controlList](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/controlsList) attribute, which is not universally supported yet.
> Also note that this setting just determines if a download button should be shown or not on the audio element. 
> A malicious visitor can always steal audio that is referenced in HTML.

Add extra setting-buttons by adding them to the `actions`-array in the configuration:
```js
actions: [
    {
        name: 'new_button',
        icon: '<svg>...</svg>',
        title: 'New Button',
        toggle: true,
        action: (name) => {
            alert(`${name} button clicked`);
        }
    }
]
```

**_NOTE:_**  return value of `action` callback for settings whether action button should be toggled or not is *deprecated*. Consider using `toggle` option instead.

## Output data

This Tool returns `data` with following format

| Field       | Type      | Description                                                                               |
|-------------| --------- |-------------------------------------------------------------------------------------------|
| file        | `object`  | Uploaded file data. Any data got from backend uploader. Always contain the `url` property |
| canDownload | `boolean` | Indicates if the audio is downloadable or not                                             |


```json
{
    "type" : "audio",
    "data" : {
        "file": {
            "url" : "https://bangerly.com/community-content/samples/1-kick.mp3"
        },
        "canDownload" : true
    }
}
```

## Backend response format <a name="server-format"></a>

This Tool works by one of the following schemes:

1. Uploading files from the device
2. Uploading by URL (handle audio-like URL's pasting)
3. Uploading by drag-n-drop file
4. Uploading by pasting from Clipboard

### Uploading files from device <a name="from-device"></a>

Scenario:

1. User select file from the device
2. Tool sends it to **your** backend (on `config.endpoints.byFile` route)
3. Your backend should save file and return file data with JSON at specified format.
4. Audio tool shows saved audio and stores server answer

So, you can implement backend for file saving by your own way. It is a specific and trivial task depending on your
environment and stack.

The tool executes the request as [`multipart/form-data`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST), with the key as the value of `field`  in configuration.

The response of your uploader **should**  cover the following format:

```json5
{
    "success" : 1,
    "file": {
        "url" : "https://www.tesla.com/tesla_theme/assets/img/_vehicle_redesign/roadster_and_semi/roadster/hero.jpg",
        // ... and any additional fields you want to store, such as width, height, color, extension, etc
    }
}
```

**success** - uploading status. 1 for successful, 0 for failed

**file** - uploaded file data. **Must** contain an `url` field with full public path to the uploaded audio.
Also, can contain any additional fields you want to store. For example, width, height, id etc.
All additional fields will be saved at the `file` object of output data.

### Uploading by pasted URL

Scenario:

1. User pastes an URL of the audio file to the Editor
2. Editor pass pasted string to the Audio Tool
3. Tool sends it to **your** backend (on `config.endpoints.byUrl` route) via 'url' in request body
4. Your backend should accept URL, **download and save the original file by passed URL** and return file data with JSON at specified format.
5. Audio tool shows saved audio and stores server answer

The tool executes the request as `application/json` with the following request body:

```json5
{
  "url": "<pasted URL from the user>",
  "additionalRequestData": "<additional request data from configuration>"
}
```

Response of your uploader should be at the same format as described at «[Uploading files from device](#from-device)» section


### Uploading by drag-n-drop or from Clipboard

Your backend will accept file as FormData object in field name, specified by `config.field` (by default, «`audio`»).
You should save it and return the same response format as described above.

## Providing custom uploading methods

As mentioned at the Config Params section, you have an ability to provide own custom uploading methods.
It is a quite simple: implement `uploadByFile` and `uploadByUrl` methods and pass them via `uploader` config param.
Both methods must return a Promise that resolves with response in a format that described at the [backend response format](#server-format) section.


| Method         | Arguments | Return value | Description |
| -------------- | --------- | -------------| ------------|
| uploadByFile   | `File`    | `{Promise.<{success, file: {url}}>}` | Upload file to the server and return an uploaded audio data |
| uploadByUrl    | `string`  | `{Promise.<{success, file: {url}}>}` | Send URL-string to the server, that should load audio by this URL and return an uploaded audio data |

Example:

```js
import AudioTool from '@editorjs/audio';

var editor = EditorJS({
  ...

  tools: {
    ...
    audio: {
      class: AudioTool,
      config: {
        /**
         * Custom uploader
         */
        uploader: {
          /**
           * Upload file to the server and return an uploaded audio data
           * @param {File} file - file selected from the device or pasted by drag-n-drop
           * @return {Promise.<{success, file: {url}}>}
           */
          uploadByFile(file){
            // your own uploading logic here
            return MyAjax.upload(file).then(() => {
              return {
                success: 1,
                file: {
                  url: 'https://bangery.com/community-content/samples/1-kick.mp3',
                  // any other audio data you want to store, such as width, height, color, extension, etc
                }
              };
            });
          },

          /**
           * Send URL-string to the server. Backend should load audio by this URL and return an uploaded audio data
           * @param {string} url - pasted audio URL
           * @return {Promise.<{success, file: {url}}>}
           */
          uploadByUrl(url){
            // your ajax request for uploading
            return MyAjax.upload(file).then(() => {
              return {
                success: 1,
                file: {
                  url: 'https://bangery.com/community-content/samples/1-kick.mp3',
                  // any other audio data you want to store, such as width, height, color, extension, etc
                }
              }
            })
          }
        }
      }
    }
  }

  ...
});
```