/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NoChangeOperation } from './NoChangeOperation';
import type { SketchFromScratchOperation } from './SketchFromScratchOperation';
import type { SketchOnImageOperation } from './SketchOnImageOperation';
export type UpdateTextByImagesRequest = {
    userId: string;
    storyId: string;
    /**
     * List of image operations to perform
     */
    imageOperations: Array<(NoChangeOperation | SketchFromScratchOperation | SketchOnImageOperation)>;
};

