/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Image } from './Image';
export type Story = {
    /**
     * Unique identifier for the story
     */
    storyId: string;
    /**
     * URL to the cover image for the story
     */
    coverImage?: string | null;
    /**
     * Name of the story
     */
    storyName: string;
    /**
     * Timestamp when the story was last edited
     */
    lastEdited: string;
    /**
     * The text content of the story
     */
    storyText?: string | null;
    /**
     * Array of images associated with the story
     */
    storyImages?: Array<Image> | null;
};

