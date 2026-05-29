export interface User {
  id: string;
  displayName: string;
  email: string;
  department: Department;
  role: UserRole;
  permissions: Permission[];
  avatar?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

export interface UserRole {
  id: string;
  name: string;
  departmentId: string;
  permissions: string[];
}

export interface Permission {
  resource: string;
  actions: ("CREATE" | "READ" | "UPDATE" | "DELETE" | "MANAGE")[];
  scope: "OWN" | "DEPARTMENT" | "ALL";
}

export interface UserPermissions {
  userId: string;
  departmentId: string;
  departmentName: string;
  role: string;
  permissions: Permission[];
  allowedIncidentTypes: string[];
  allowedActions: string[];
}
