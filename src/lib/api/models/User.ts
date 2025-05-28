/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { StoryHead } from './StoryHead';
export type User = {
    /**
     * Unique identifier for the user
     */
    userId: string;
    /**
     * Name of the user
     */
    userName?: string | null;
    /**
     * Full name of the user
     */
    name?: string | null;
    /**
     * Stories the user has created
     */
    stories?: Array<StoryHead> | null;
    /**
     * Timestamp when the user was created
     */
    accountCreated?: string | null;
};

