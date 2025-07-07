/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DefaultService {
    /**
     * Root
     * @returns any Successful Response
     * @throws ApiError
     */
    public static rootGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/',
        });
    }
    /**
     * Health Check
     * @returns any Successful Response
     * @throws ApiError
     */
    public static healthCheckHealthGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/health',
        });
    }
    /**
     * Get Image
     * @param userId
     * @param storyId
     * @param imageId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getImageImagesUserIdStoryIdImageIdGet(
        userId: string,
        storyId: string,
        imageId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/images/{user_id}/{story_id}/{image_id}',
            path: {
                'user_id': userId,
                'story_id': storyId,
                'image_id': imageId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Image
     * @param imageId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getImageAssetsLogosImageIdGet(
        imageId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/assets/logos/{image_id}',
            path: {
                'image_id': imageId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
