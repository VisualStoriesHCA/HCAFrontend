/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SketchFromScratchOperation = {
    type: SketchFromScratchOperation.type;
    /**
     * Base64 encoded canvas data for drawings
     */
    canvasData: string;
    /**
     * Alternative text for new or modified images
     */
    alt?: (string | null);
};
export namespace SketchFromScratchOperation {
    export enum type {
        SKETCH_FROM_SCRATCH = 'sketchFromScratch',
    }
}

