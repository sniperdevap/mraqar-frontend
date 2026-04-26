export const PlanType = {
  OFFICE: 'office-plan',
  MONTH: 'month-plan',
} as const;

export type PlanType = (typeof PlanType)[keyof typeof PlanType];
