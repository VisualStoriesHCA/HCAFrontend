/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ImageResponse } from './ImageResponse';
import type { StoryState } from './StoryState';
export type StoryDetailsResponse = {
    storyId: string;
    storyName: string;
    storyText: string;
    state: StoryState;
    storyImages: Array<ImageResponse>;
    audioUrl?: (string | null);
};

