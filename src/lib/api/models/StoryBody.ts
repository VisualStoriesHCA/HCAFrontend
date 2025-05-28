/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Image } from './Image';
export type StoryBody = {
    /**
     * Unique identifier for the story
     */
    storyId: string;
    /**
     * Name of the story
     */
    storyName: string;
    /**
     * The text content of the story
     */
    storyText: string | null;
    /**
     * Array of images associated with the story
     */
    storyImages: Array<Image> | null;
};

