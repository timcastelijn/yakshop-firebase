export function hasRights(authUser, permissions){
  if (authUser.roles.ADMIN === true) {
    return true
  }

  if(permissions){
    for (let [permission,permissionvalue] of Object.entries(permissions)) {
      if(authUser.roles){
        for (let [userRole, userRoleValue] of Object.entries(authUser.roles)) {

          if (userRole === permission && userRoleValue === true && permissionvalue === true) {
            console.log(userRole, userRoleValue);
            return true
          }
        }
      }
    }
  }

}
