import type { Model } from 'model-one'
//update the interfaces, and schema
//update the user creation thing

export interface UserDataI {
  id?: string
  discord_user_id?: string
  discord_access_token?: string
  discord_refresh_token?: string
  discord_expires_at?: string
// stellar_expires_at?: string
//  public_key?: string
}
export interface UserI extends Model {
  data: UserDataI
}

export interface StellarAccountsDataI{
  id?: string
  discord_user_id?: string
  public_key?: string
  access_token?: string
  refresh_token?: string
}

export interface StellarAccountsI extends Model {
  data: StellarAccountsDataI
}

export interface BalanceDataI {
  id?: string
  asset_id?: string
  account_id?: string
  balance?: string
  date_acquired?: string
  verified_ownership?: string
}
export interface BalanceI extends Model {
  data: BalanceDataI
}

export interface CursorDataI {
  id?: string
  url?: string
  cursor?: string
  query?: string
}
export interface CursorI extends Model {
  data: CursorDataI
}