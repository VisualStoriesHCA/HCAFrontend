/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Expected behavior based on the type:
 * - nochange: No changes made to the image, only update the story text.
 * - sketchFromScratch: A new sketch has been drawn with no image background. Generate the story and a sketch.
 * - sketchOnImage: A sketch has been created on an existing image. Generate the story and a sketch.
 *
 */
export type ImageOperation = {
    /**
     * The type of operation performed on the image
     */
    type: ImageOperation.type;
    /**
     * Id of the existing image (required for nochange and sketchOnImage operations)
     */
    imageId?: string | null;
    /**
     * Base64 encoded canvas data for drawings (required for sketchFromScratch and sketchOnImage operations)
     */
    canvasData?: string | null;
    /**
     * Alternative text for new or modified images
     */
    alt?: string | null;
};
export namespace ImageOperation {
    /**
     * The type of operation performed on the image
     */
    export enum type {
        NOCHANGE = 'nochange',
        SKETCH_FROM_SCRATCH = 'sketchFromScratch',
        SKETCH_ON_IMAGE = 'sketchOnImage',
    }
}

