import {IconFile} from '@codexteam/icons';
import { make } from './utils/dom';
import type { API } from '@editorjs/editorjs';
import type { AudioToolData, AudioConfig } from './types/types';

/**
 * Enumeration representing the different states of the UI.
 */
enum UiState {
  /**
   * The UI is in an empty state, with no audio loaded or being uploaded.
   */
  Empty = 'empty',

  /**
   * The UI is in an uploading state, indicating an audio is currently being uploaded.
   */
  Uploading = 'uploading',

  /**
   * The UI is in a filled state, with an audio successfully loaded.
   */
  Filled = 'filled'
};

/**
 * Nodes interface representing various elements in the UI.
 */
interface Nodes {
  /**
   * Wrapper element in the UI.
   */
  wrapper: HTMLElement;

  /**
   * Container for the audio element in the UI.
   */
  audioContainer: HTMLElement;

  /**
   * Button for selecting files.
   */
  fileButton: HTMLElement;

  /**
   * Represents the audio element in the UI, if one is present; otherwise, it's undefined.
   */
  audioEl?: HTMLElement;

  /**
   * Preloader element for the audio.
   */
  audioPreloader: HTMLElement;
}

/**
 * ConstructorParams interface representing parameters for the Ui class constructor.
 */
interface ConstructorParams {
  /**
   * Editor.js API.
   */
  api: API;
  /**
   * Configuration for the audio.
   */
  config: AudioConfig;
  /**
   * Callback function for selecting a file.
   */
  onSelectFile: () => void;
  /**
   * Flag indicating if the UI is in read-only mode.
   */
  readOnly: boolean;
}

/**
 * Class for working with UI:
 *  - rendering base structure
 *  - show/hide preview
 *  - apply tune view
 */
export default class Ui {
  /**
   * Nodes representing various elements in the UI.
   */
  public nodes: Nodes;

  /**
   * API instance for Editor.js.
   */
  private api: API;

  /**
   * Configuration for the audio tool.
   */
  private config: AudioConfig;

  /**
   * Callback function for selecting a file.
   */
  private onSelectFile: () => void;

  /**
   * Flag indicating if the UI is in read-only mode.
   */
  private readOnly: boolean;

  /**
   * @param ui - audio tool Ui module
   * @param ui.api - Editor.js API
   * @param ui.config - user config
   * @param ui.onSelectFile - callback for clicks on Select file button
   * @param ui.readOnly - read-only mode flag
   */
  constructor({ api, config, onSelectFile, readOnly }: ConstructorParams) {
    this.api = api;
    this.config = config;
    this.onSelectFile = onSelectFile;
    this.readOnly = readOnly;
    this.nodes = {
      wrapper: make('div', [this.CSS.baseClass, this.CSS.wrapper]),
      audioContainer: make('div', [this.CSS.audioContainer]),
      fileButton: this.createFileButton(),
      audioEl: undefined,
      audioPreloader: make('div', this.CSS.audioPreloader),
    };

    /**
     * Create base structure
     *  <wrapper>
     *    <audio-container>
     *      <audio-preloader />
     *    </audio-container>
     *    <select-file-button />
     *  </wrapper>
     */
    this.nodes.audioContainer.appendChild(this.nodes.audioPreloader);
    this.nodes.wrapper.appendChild(this.nodes.audioContainer);
    this.nodes.wrapper.appendChild(this.nodes.fileButton);
  }

  /**
   * Apply visual representation of activated tune
   * @param tuneName - one of available tunes {@link Tunes.tunes}
   * @param status - true for enable, false for disable
   */
  public applyTune(tuneName: string, status: boolean): void {
    if (tuneName === "canDownload"){
       const controlListValue = status ? "" : "nodownload";
       this.nodes.audioEl?.setAttribute("controlsList", controlListValue);
    }
    this.nodes.wrapper.classList.toggle(`${this.CSS.wrapper}--${tuneName}`, status);
  }

  /**
   * Renders tool UI
   * @param toolData - saved tool data
   */
  public render(toolData: AudioToolData): HTMLElement {
    if (toolData.file === undefined || Object.keys(toolData.file).length === 0) {
      this.toggleStatus(UiState.Empty);
    } else {
      this.toggleStatus(UiState.Uploading);
    }

    return this.nodes.wrapper;
  }

  /**
   * Shows uploading preloader
   */
  public showPreloader(): void {
    this.toggleStatus(UiState.Uploading);
  }

  /**
   * Hide uploading preloader
   */
  public hidePreloader(): void {
    this.toggleStatus(UiState.Empty);
  }

  /**
   * Shows an audio
   * @param url - audio source
   */
  public fillAudio(url: string): void {
    /**
     * Check for a source extension to compose element correctly: video tag for mp4, img — for others
     */
    const attributes: { [key: string]: string | boolean } = {
        src: url,
        controls: true,
        controlsList: "nodownload",
    };

    /**
     * Compose tag with defined attributes
     */
    this.nodes.audioEl = make("AUDIO", this.CSS.audioEl, attributes);

    /**
     * Add load event listener
     */
    this.nodes.audioEl.addEventListener('loadeddata', () => {
      this.toggleStatus(UiState.Filled);
    });

    this.nodes.audioContainer.appendChild(this.nodes.audioEl);
  }

  /**
   * CSS classes
   */
  private get CSS(): Record<string, string> {
    return {
      baseClass: this.api.styles.block,
      loading: this.api.styles.loader,
      input: this.api.styles.input,
      button: this.api.styles.button,

      /**
       * Tool's classes
       */
      wrapper: 'audio-tool',
      audioContainer: 'audio-tool__audio',
      audioPreloader: 'audio-tool__audio-preloader',
      audioEl: 'audio-tool__audio-player',
    };
  };

  /**
   * Creates upload-file button
   */
  private createFileButton(): HTMLElement {
    const button = make('div', [this.CSS.button]);

    button.innerHTML = this.config.buttonContent ?? `${IconFile} ${this.api.i18n.t('Select an audio file')}`;

    button.addEventListener('click', () => {
      this.onSelectFile();
    });

    return button;
  }

  /**
   * Changes UI status
   * @param status - see {@link Ui.status} constants
   */
  private toggleStatus(status: UiState): void {
    for (const statusType in UiState) {
      if (Object.prototype.hasOwnProperty.call(UiState, statusType)) {
        this.nodes.wrapper.classList.toggle(`${this.CSS.wrapper}--${UiState[statusType as keyof typeof UiState]}`, status === UiState[statusType as keyof typeof UiState]);
      }
    }
  }
}
