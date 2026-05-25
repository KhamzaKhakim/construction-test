export type Employee = {
  id: number;
  name: string;
  type: EmployeeType;
};

export const EMPLOYEE_VALUES = ["manager", "worker"] as const;

export type EmployeeType = (typeof EMPLOYEE_VALUES)[number];
