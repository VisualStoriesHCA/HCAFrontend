/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SketchOnImageOperation = {
    type: SketchOnImageOperation.type;
    /**
     * Id of the existing image
     */
    imageId: string;
    /**
     * Base64 encoded canvas data for drawings
     */
    canvasData: string;
    /**
     * Alternative text for new or modified images
     */
    alt?: (string | null);
};
export namespace SketchOnImageOperation {
    export enum type {
        SKETCH_ON_IMAGE = 'sketchOnImage',
    }
}

