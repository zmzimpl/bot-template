/**
 * User API Service
 * Example service demonstrating API usage
 */

import request from '../api/index.js';
import type { LoginData, UserInfo } from '../types/index.js';

/**
 * User login
 * @param data - Login credentials
 */
export async function login(data: LoginData): Promise<{ token: string; user: UserInfo }> {
  return request({
    url: '/user/login',
    method: 'POST',
    data,
  });
}

/**
 * Get current user info
 */
export async function getUserInfo(): Promise<UserInfo> {
  return request({
    url: '/user/info',
    method: 'GET',
  });
}

/**
 * Update user info
 * @param data - User data to update
 */
export async function updateUserInfo(data: Partial<UserInfo>): Promise<UserInfo> {
  return request({
    url: '/user/info',
    method: 'PUT',
    data,
  });
}

/**
 * User logout
 */
export async function logout(): Promise<void> {
  return request({
    url: '/user/logout',
    method: 'POST',
  });
}

/**
 * Register new user
 * @param data - Registration data
 */
export async function register(data: {
  username: string;
  password: string;
  email: string;
}): Promise<UserInfo> {
  return request({
    url: '/user/register',
    method: 'POST',
    data,
  });
}

/**
 * Reset password
 * @param email - User email
 */
export async function resetPassword(email: string): Promise<void> {
  return request({
    url: '/user/reset-password',
    method: 'POST',
    data: { email },
  });
}

/**
 * Change password
 * @param oldPassword - Current password
 * @param newPassword - New password
 */
export async function changePassword(
  oldPassword: string,
  newPassword: string
): Promise<void> {
  return request({
    url: '/user/change-password',
    method: 'POST',
    data: { oldPassword, newPassword },
  });
}
