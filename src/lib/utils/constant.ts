export const PlanType = {
  OFFICE: 'office-plan',
  DAILY: 'daily-plan',
  NORMAL: 'normal-plan',
} as const;

export type PlanType = (typeof PlanType)[keyof typeof PlanType];
