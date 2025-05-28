/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Image } from '../models/Image';
import type { StoryBody } from '../models/StoryBody';
import type { StoryHead } from '../models/StoryHead';
import type { UpdateImagesFromTextRequest } from '../models/UpdateImagesFromTextRequest';
import type { UpdateTextFromImagesRequest } from '../models/UpdateTextFromImagesRequest';
import type { UserDetailsResponse } from '../models/UserDetailsResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DefaultService {
    /**
     * Create a new user
     * Create a new user with a name, return the users details
     * @param requestBody
     * @returns UserDetailsResponse Successfully created new user
     * @throws ApiError
     */
    public static postCreateNewUser(
        requestBody: {
            /**
             * Name of the user
             */
            userName: string;
            /**
             * Full name of the user
             */
            name: string | null;
        },
    ): CancelablePromise<UserDetailsResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/createNewUser',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request parameters`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Delete a user
     * Delete a user by Id
     * @param userId The Id of the user to delete
     * @returns void
     * @throws ApiError
     */
    public static deleteDeleteUser(
        userId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/deleteUser',
            query: {
                'userId': userId,
            },
            errors: {
                400: `Invalid request parameters`,
                404: `User not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Get user information by username
     * Retrieve detailed information about a user by their username
     * @param userName The username of the user whose information to retrieve
     * @returns UserDetailsResponse Successfully retrieved user details
     * @throws ApiError
     */
    public static getGetUserInformationByUserName(
        userName: string,
    ): CancelablePromise<UserDetailsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/getUserInformationByUserName',
            query: {
                'userName': userName,
            },
            errors: {
                400: `Invalid request parameters`,
                404: `User not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * List preview stories
     * Retrieve a list of preview stories for a specific user
     * @param userId The Id of the user whose stories to retrieve
     * @param maxEntries Maximum number of stories to return
     * @returns StoryHead Successfully retrieved preview stories
     * @throws ApiError
     */
    public static getGetUserStories(
        userId: string,
        maxEntries: number = 50,
    ): CancelablePromise<Array<StoryHead>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/getUserStories',
            query: {
                'userId': userId,
                'maxEntries': maxEntries,
            },
            errors: {
                400: `Invalid request parameters`,
                404: `User not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Get story details by Id
     * Retrieve detailed information for a specific story
     * @param userId The Id of the user who owns the story
     * @param storyId The Id of the story to retrieve
     * @returns StoryBody Successfully retrieved story details
     * @throws ApiError
     */
    public static getGetStoryById(
        userId: string,
        storyId: string,
    ): CancelablePromise<StoryBody> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/getStoryById',
            query: {
                'userId': userId,
                'storyId': storyId,
            },
            errors: {
                400: `Invalid request parameters`,
                404: `Story not found or user does not have access`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Get user information by Id
     * Retrieve detailed information about the user
     * @param userId The Id of the user whose information to retrieve
     * @returns UserDetailsResponse Successfully retrieved user details
     * @throws ApiError
     */
    public static getGetUserInformation(
        userId: string,
    ): CancelablePromise<UserDetailsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/getUserInformation',
            query: {
                'userId': userId,
            },
            errors: {
                400: `Invalid request parameters`,
                404: `User not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Update images based on text content
     * Update or generate images for a story based on updated text content
     * @param requestBody
     * @returns StoryBody Successfully updated images
     * @throws ApiError
     */
    public static postUpdateImagesFromText(
        requestBody: UpdateImagesFromTextRequest,
    ): CancelablePromise<StoryBody> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/updateImagesFromText',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request parameters`,
                404: `Story not found or user does not have access`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Update text content based on altered images
     * Generate or update story text based on modified or new images
     * @param requestBody
     * @returns StoryBody Successfully updated text content
     * @throws ApiError
     */
    public static postUpdateTextFromImages(
        requestBody: UpdateTextFromImagesRequest,
    ): CancelablePromise<StoryBody> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/updateTextFromImages',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request parameters`,
                404: `Story not found or user does not have access`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Create a new, empty story
     * Create a new story with an empty body and no images
     * @param requestBody
     * @returns StoryHead Successfully created new story
     * @throws ApiError
     */
    public static postCreateNewStory(
        requestBody: {
            /**
             * The Id of the user creating the story
             */
            userId: string;
            /**
             * The name of the new story
             */
            storyName?: string;
        },
    ): CancelablePromise<StoryHead> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/createNewStory',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request parameters`,
                404: `User not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Delete a story
     * Delete a story by Id
     * @param userId The Id of the user who owns the story
     * @param storyId The Id of the story to delete
     * @returns void
     * @throws ApiError
     */
    public static deleteDeleteStory(
        userId: string,
        storyId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/deleteStory',
            query: {
                'userId': userId,
                'storyId': storyId,
            },
            errors: {
                400: `Invalid request parameters`,
                404: `Story not found or user does not have access`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Upload an image for a story
     * Upload an image to be associated with a story. If the storyId is not provided, a new story will be created.
     * @param formData
     * @returns any Successfully uploaded image
     * @throws ApiError
     */
    public static postUploadImage(
        formData: {
            /**
             * The Id of the user uploading the image
             */
            userId: string;
            /**
             * The Id of the story to associate the image with
             */
            storyId: string | null;
            /**
             * The image file to upload
             */
            imageFile: Blob;
        },
    ): CancelablePromise<{
        /**
         * The Id of the story associated with the uploaded image
         */
        storyId?: string;
        image?: Image;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/uploadImage',
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                400: `Invalid request parameters or file type`,
                404: `Story not found or user does not have access`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Set or update the name of a story
     * Update the name of an existing story
     * @param requestBody
     * @returns StoryHead Successfully updated story name
     * @throws ApiError
     */
    public static postSetStoryName(
        requestBody: {
            /**
             * The Id of the user who owns the story
             */
            userId: string;
            /**
             * The Id of the story to update
             */
            storyId: string;
            /**
             * The new name for the story
             */
            storyName: string;
        },
    ): CancelablePromise<StoryHead> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/setStoryName',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request parameters`,
                404: `Story not found or user does not have access`,
                500: `Internal server error`,
            },
        });
    }
}
