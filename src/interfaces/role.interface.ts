

export interface UserRole {
    role_id: string;
    role_name: string;
    description: string;
   
  }
  

export const Roles: { [key: string]: UserRole } = {
  attendee: {
    role_id: "1",
    role_name: "attendee",
    description: "Default role with basic access",
  },
  manager: {
    role_id: "2",
    role_name: "manager",
    description: "Manager role with additional permissions",
  },
  super_admin: {
    role_id: "3",
    role_name: "super_admin",
    description: "Super admin role with all permissions",
  },
};