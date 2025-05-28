/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ImageOperation } from './ImageOperation';
export type UpdateTextFromImagesRequest = {
    /**
     * The Id of the user who owns the story
     */
    userId: string;
    /**
     * The Id of the story to update
     */
    storyId: string;
    /**
     * Array of operations performed on images
     */
    imageOperations: Array<ImageOperation>;
};

