import React from 'react';
import AuthUserContext from './context';


export function hasRights(authUser, permissions){
  if (authUser.roles.ADMIN === true) {
    return true
  }

  if(permissions){
    for (let [permission,permissionvalue] of Object.entries(permissions)) {
      if(authUser.roles){
        for (let [userRole, userRoleValue] of Object.entries(authUser.roles)) {

          if (userRole === permission && userRoleValue === true && permissionvalue === true) {
            return true
          }
        }
      }
    }
  }

}


export const AuthFilter = (props)  =>  {
  const {Component, auth} = props
  return (
        <AuthUserContext.Consumer>
          {authUser =>
            hasRights(authUser, auth) ? <Component {...props} /> : null
          }
        </AuthUserContext.Consumer>
      );
}
