export const PlanType = {
  OFFICE: 'office-plan',
} as const;

export type PlanType = (typeof PlanType)[keyof typeof PlanType];
