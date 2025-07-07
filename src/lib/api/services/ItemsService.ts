/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateNewStoryRequest } from '../models/CreateNewStoryRequest';
import type { CreateUserRequest } from '../models/CreateUserRequest';
import type { DeleteStoryRequest } from '../models/DeleteStoryRequest';
import type { DeleteUserRequest } from '../models/DeleteUserRequest';
import type { SetStoryNameRequest } from '../models/SetStoryNameRequest';
import type { StoryBasicInfoResponse } from '../models/StoryBasicInfoResponse';
import type { StoryDetailsResponse } from '../models/StoryDetailsResponse';
import type { UpdateImagesByTextRequest } from '../models/UpdateImagesByTextRequest';
import type { UpdateTextByImagesRequest } from '../models/UpdateTextByImagesRequest';
import type { UploadImageRequest } from '../models/UploadImageRequest';
import type { UserAchievementsResponse } from '../models/UserAchievementsResponse';
import type { UserResponse } from '../models/UserResponse';
import type { UserStoriesResponse } from '../models/UserStoriesResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ItemsService {
    /**
     * Create New User
     * @param requestBody
     * @returns UserResponse Successful Response
     * @throws ApiError
     */
    public static createNewUser(
        requestBody: CreateUserRequest,
    ): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/items/createNewUser',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Not found`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete User
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static deleteUser(
        requestBody: DeleteUserRequest,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/items/deleteUser',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Not found`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get User Information
     * @param userId
     * @returns UserResponse Successful Response
     * @throws ApiError
     */
    public static getUserInformation(
        userId: string,
    ): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/items/getUserInformation',
            query: {
                'userId': userId,
            },
            errors: {
                404: `Not found`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get User Information By User Name
     * @param userName
     * @returns UserResponse Successful Response
     * @throws ApiError
     */
    public static getUserInformationByUserName(
        userName: string,
    ): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/items/getUserInformationByUserName',
            query: {
                'userName': userName,
            },
            errors: {
                404: `Not found`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create New Story
     * @param requestBody
     * @returns StoryBasicInfoResponse Successful Response
     * @throws ApiError
     */
    public static createNewStory(
        requestBody: CreateNewStoryRequest,
    ): CancelablePromise<StoryBasicInfoResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/items/createNewStory',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Not found`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Set Story Name
     * @param requestBody
     * @returns StoryBasicInfoResponse Successful Response
     * @throws ApiError
     */
    public static setStoryName(
        requestBody: SetStoryNameRequest,
    ): CancelablePromise<StoryBasicInfoResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/items/setStoryName',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Not found`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Story
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static deleteStory(
        requestBody: DeleteStoryRequest,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/items/deleteStory',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Not found`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get User Stories
     * @param userId
     * @param maxEntries
     * @returns UserStoriesResponse Successful Response
     * @throws ApiError
     */
    public static getUserStories(
        userId: string,
        maxEntries: number = 50,
    ): CancelablePromise<UserStoriesResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/items/getUserStories',
            query: {
                'userId': userId,
                'maxEntries': maxEntries,
            },
            errors: {
                404: `Not found`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Story By Id
     * @param userId
     * @param storyId
     * @returns StoryDetailsResponse Successful Response
     * @throws ApiError
     */
    public static getStoryById(
        userId: string,
        storyId: string,
    ): CancelablePromise<StoryDetailsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/items/getStoryById',
            query: {
                'userId': userId,
                'storyId': storyId,
            },
            errors: {
                404: `Not found`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get User Achievements
     * Get all achievements and user progress for gamification features.
     *
     * This is a placeholder implementation that returns static example data.
     * TODO: Implement actual database queries when Achievement and UserAchievement tables are created.
     * @param userId
     * @returns UserAchievementsResponse Successful Response
     * @throws ApiError
     */
    public static getUserAchievements(
        userId: string,
    ): CancelablePromise<UserAchievementsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/items/getUserAchievements',
            query: {
                'userId': userId,
            },
            errors: {
                404: `Not found`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Images By Text
     * @param requestBody
     * @returns StoryDetailsResponse Successful Response
     * @throws ApiError
     */
    public static updateImagesByText(
        requestBody: UpdateImagesByTextRequest,
    ): CancelablePromise<StoryDetailsResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/items/updateImagesByText',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Not found`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Text By Images
     * @param requestBody
     * @returns StoryDetailsResponse Successful Response
     * @throws ApiError
     */
    public static updateTextByImages(
        requestBody: UpdateTextByImagesRequest,
    ): CancelablePromise<StoryDetailsResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/items/updateTextByImages',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Not found`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Upload Image
     * @param requestBody
     * @returns StoryDetailsResponse Successful Response
     * @throws ApiError
     */
    public static uploadImage(
        requestBody: UploadImageRequest,
    ): CancelablePromise<StoryDetailsResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/items/uploadImage',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Not found`,
                422: `Validation Error`,
            },
        });
    }
}
