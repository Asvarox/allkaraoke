// Credit to original author: @dikarel
// https://gist.github.com/dikarel/38a12ce263199a41ad67c15eac7f4b45

// Not quite there yet, but better than nothing
// TODO: JSDoc, based on website documentation
// TODO: Interface/class types for each of these ML algorithm instances
// TODO: Break this apart into multiple files for readability
// TODO: Test autocomplete in a vanilla JS project
// TODO: Test autocomplete in a TypeScript project

declare module 'ml5' {
    import { MediaElement } from 'p5';
    type PoseNetOptions = {
      detectionType: 'single' | 'multiple';
      flipHorizontal: boolean;
      imageScaleFactor: number;
      maxPoseDetections: number;
      minConfidence: number;
      multiplier: number;
      nmsRadius: number;
      outputStride: number;
      scoreThreshold: number;
    };
  
    type ImageClassifierOptions = {
      alpha: number;
      topk: number;
      version: number;
    };
  
    type YoloOptions = {
      classProbThreshold: number;
      filterBoxesThreshold: number;
      IOUThreshold: number;
    };
  
    type SketchRnnModel =
      | 'alarm_clock'
      | 'ambulance'
      | 'angel'
      | 'ant'
      | 'antyoga'
      | 'backpack'
      | 'barn'
      | 'basket'
      | 'bear'
      | 'bee'
      | 'beeflower'
      | 'bicycle'
      | 'bird'
      | 'book'
      | 'brain'
      | 'bridge'
      | 'bulldozer'
      | 'bus'
      | 'butterfly'
      | 'cactus'
      | 'calendar'
      | 'castle'
      | 'cat'
      | 'catbus'
      | 'catpig'
      | 'chair'
      | 'couch'
      | 'crab'
      | 'crabchair'
      | 'crabrabbitfacepig'
      | 'cruise_ship'
      | 'diving_board'
      | 'dog'
      | 'dogbunny'
      | 'dolphin'
      | 'duck'
      | 'elephant'
      | 'elephantpig'
      | 'eye'
      | 'face'
      | 'fan'
      | 'fire_hydrant'
      | 'firetruck'
      | 'flamingo'
      | 'flower'
      | 'floweryoga'
      | 'frog'
      | 'frogsofa'
      | 'garden'
      | 'hand'
      | 'hedgeberry'
      | 'hedgehog'
      | 'helicopter'
      | 'kangaroo'
      | 'key'
      | 'lantern'
      | 'lighthouse'
      | 'lion'
      | 'lionsheep'
      | 'lobster'
      | 'map'
      | 'mermaid'
      | 'monapassport'
      | 'monkey'
      | 'mosquito'
      | 'octopus'
      | 'owl'
      | 'paintbrush'
      | 'palm_tree'
      | 'parrot'
      | 'passport'
      | 'peas'
      | 'penguin'
      | 'pig'
      | 'pigsheep'
      | 'pineapple'
      | 'pool'
      | 'postcard'
      | 'power_outlet'
      | 'rabbit'
      | 'rabbitturtle'
      | 'radio'
      | 'radioface'
      | 'rain'
      | 'rhinoceros'
      | 'rifle'
      | 'roller_coaster'
      | 'sandwich'
      | 'scorpion'
      | 'sea_turtle'
      | 'sheep'
      | 'skull'
      | 'snail'
      | 'snowflake'
      | 'speedboat'
      | 'spider'
      | 'squirrel'
      | 'steak'
      | 'stove'
      | 'strawberry'
      | 'swan'
      | 'swing_set'
      | 'the_mona_lisa'
      | 'tiger'
      | 'toothbrush'
      | 'toothpaste'
      | 'tractor'
      | 'trombone'
      | 'truck'
      | 'whale'
      | 'windmill'
      | 'yoga'
      | 'yogabicycle'
      | 'everything';
  
    export function imageClassifier(
      model: 'MobileNet' | 'Darknet' | 'Darknet-tiny' | string,
      callback?: (error: any, result: any) => void
    ): undefined | Promise<any>;
  
    export function imageClassifier(
      model: 'MobileNet' | 'Darknet' | 'Darknet-tiny' | string,
      options?: ImageClassifierOptions,
      callback?: (error: any, result: any) => void
    ): undefined | Promise<any>;
  
    export function imageClassifier(
      model: 'MobileNet' | 'Darknet' | 'Darknet-tiny' | string,
      video?: MediaElement | HTMLVideoElement,
      options?: ImageClassifierOptions,
      callback?: (error: any, result: any) => void
    ): undefined | Promise<any>;
  
    export function poseNet(
      video?: MediaElement | HTMLVideoElement,
      type?: 'single' | 'multiple',
      callback?: (error: any, result: any) => void
    ): undefined | Promise<any>;
  
    export function poseNet(
      video?: MediaElement | HTMLVideoElement,
      options?: PoseNetOptions,
      callback?: (error: any, result: any) => void
    ): undefined | Promise<any>;
  
    export function poseNet(
      callback?: (error: any, result: any) => void,
      options?: PoseNetOptions
    ): undefined | Promise<any>;
  
    export function bodyPix(
      video?: MediaElement | HTMLVideoElement,
      type?: 'single' | 'multiple',
      callback?: (error: any, result: any) => void,
      options?: any
    ): undefined | Promise<any>;
  
    export function uNet(
      model: string,
      callback?: (error: any, result: any) => void
    ): undefined | Promise<any>;
  
    export function styleTransfer(
      model: string,
      callback?: (error: any, result: any) => void
    ): undefined | Promise<any>;
  
    export function styleTransfer(
      model: string,
      video?: MediaElement | HTMLVideoElement,
      callback?: (error: any, result: any) => void
    ): undefined | Promise<any>;
  
    export function pix2pix(
      model: string,
      callback?: (error: any, result: any) => void
    ): undefined | Promise<any>;
  
    export function CVAE(
      model: string,
      callback?: (error: any, result: any) => void
    ): undefined | Promise<any>;
  
    export function DCGAN(
      modelPath: string,
      callback?: (error: any, result: any) => void
    ): undefined | Promise<any>;
  
    export function YOLO(
      video?: MediaElement | HTMLVideoElement,
      options?: YoloOptions,
      callback?: (error: any, result: any) => void
    ): undefined | Promise<any>;
  
    export function YOLO(
      options?: YoloOptions,
      callback?: (error: any, result: any) => void
    ): undefined | Promise<any>;
  
    export function soundClassifier(
      model: string,
      options?: { probabilityThreshold: number },
      callback?: (error: any, result: any) => void
    ): undefined | Promise<any>;
  
    export function pitchDetection(
      model: 'CREPE',
      audioContext: AudioContext,
      stream: MediaStream,
      callback?: (error: any, result: any) => void
    ): undefined | Promise<any>;
  
    export function charRNN(
      model: string,
      callback?: (error: any, result: any) => void
    ): undefined | Promise<any>;
  
    export function sentiment(
      model: string,
      callback?: (error: any, result: any) => void
    ): undefined | Promise<any>;
  
    export function word2vec(
      model: string,
      callback?: (error: any, result: any) => void
    ): undefined | Promise<any>;
  
    export function SketchRNN(
      model: string,
      callback?: (error: any, result: any) => void
    ): undefined | Promise<any>;
  
    export function SketchRNN(
      model: SketchRnnModel | string,
      callback?: (error: any, result: any) => void
    ): undefined | Promise<any>;
  }
  