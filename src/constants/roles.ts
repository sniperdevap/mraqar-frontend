// define admin and user roles
const ROLES = {
  SUPER_ADMIN: 'super_admin',
  STAFF: 'staff',
  BUSINESS_OWNER: 'business_owner',
};
// freeze the roles object to prevent modifications
Object.freeze(ROLES);
export default ROLES;
