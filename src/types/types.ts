import type { HTMLPasteEventDetail } from '@editorjs/editorjs';

/**
 * Represents options for uploading, including a function to handle previewing.
 */
export interface UploadOptions {
  /**
   * Callback function to be called when the preview is ready.
   * @param src - The source of the preview as a string.
   * @returns void
   */
  onPreview: () => void;
}

/**
 * User configuration of Audio block tunes. Allows to add custom tunes through the config
 */
export interface ActionConfig {
  /**
   * The name of the tune.
   */
  name: string;

  /**
   * The icon for the tune. Should be an SVG string.
   */
  icon: string;

  /**
   * The title of the tune. This will be displayed in the UI.
   */
  title: string;

  /**
   * An optional flag indicating whether the tune is a toggle (true) or not (false).
   */
  toggle?: boolean;

  /**
   * An optional action function to be executed when the tune is activated.
   */
  action?: Function;
};

/**
 * UploadResponseFormat interface representing the response format expected from the backend on file uploading.
 */
export interface UploadResponseFormat<AdditionalFileData = {}> {
  /**
   * success - 1 for successful uploading, 0 for failure
   */
  success: number;

  /**
   * Object with file data.
   *             'url' is required,
   *             also can contain any additional data that will be saved and passed back
   */
  file: {
    /**
     * The URL of the uploaded audio.
     */
    url: string;
  } & AdditionalFileData;
}

/**
 * AudioToolData type representing the input and output data format for the audio tool, including optional custome actions.
 */
export type AudioToolData<Actions = {}, AdditionalFileData = {}> = {
  /**
   * Flag indicating whether the audio file can be downloaded.
   */
  canDownload: boolean;

  /**
   * Object containing the URL of the audio file.
   * Also can contain any additional data.
   */
  file: {
    /**
     * The URL of the audio.
     */
    url: string;
  } & AdditionalFileData;
} & (Actions extends Record<string, boolean> ? Actions : {});

/**
 *
 * @description Config supported by Tool
 */
export interface AudioConfig {
  /**
   * Endpoints for upload, whether using file or URL.
   */
  endpoints: {

    /**
     * Endpoint for file upload.
     */
    byFile?: string;

    /**
     * Endpoints for URL upload.
     */
    byUrl?: string;
  };

  /**
   * Field name for the uploaded audio.
   */
  field?: string;

  /**
   * Allowed mime-types for the uploaded audio.
   */
  types?: string;

  /**
   * Additional data to send with requests.
   */
  additionalRequestData?: object;

  /**
   * Additional headers to send with requests.
   */
  additionalRequestHeaders?: object;

  /**
   * Custom content for the select file button.
   */
  buttonContent?: string;

  /**
   * Optional custom uploader.
   */
  uploader?: {

    /**
     * Method to upload an audio by file.
     */
    uploadByFile?: (file: Blob) => Promise<UploadResponseFormat>;

    /**
     * Method to upload an audio by URL.
     */
    uploadByUrl?: (url: string) => Promise<UploadResponseFormat>;
  };

  /**
   * Additional actions for the tool.
   */
  actions?: ActionConfig[];
}

/**
 * Interface representing the details of a paste event for HTML elements.
 * Extends the `HTMLPasteEventDetail` interface to include additional data properties.
 */
export interface HTMLPasteEventDetailExtended extends HTMLPasteEventDetail {
  /**
   * The data property containing the source of the audio and HTML element details.
   */
  data: {
    /**
     * The source URL of the pasted audio.
     */
    src: string;
  } & HTMLElement;
}

/**
 * Parameter type of Audio setter function in AudioTool
 */
export type AudioSetterParam = {
  /**
   * url path of the audio
   */
  url: string;
};
