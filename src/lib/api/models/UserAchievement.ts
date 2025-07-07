/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AchievementReward } from './AchievementReward';
import type { AchievementState } from './AchievementState';
import type { AchievementType } from './AchievementType';
export type UserAchievement = {
    achievementId: number;
    title: string;
    description: string;
    category: string;
    type: AchievementType;
    imageUrl: string;
    state: AchievementState;
    currentValue: number;
    targetValue: number;
    unit: string;
    completedAt?: (string | null);
    reward?: (AchievementReward | null);
    unlockCondition?: (string | null);
};

