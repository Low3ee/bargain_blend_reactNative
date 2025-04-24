import { getProfileDetails, getToken, getUserInfoField } from '@/utils/profileUtil';
import { API } from "@/services/config";

const BASE_URL = `${API}/wishlist`;

export async function getWishlist(): Promise<any[]> {
  try {
    const userInfo = await getProfileDetails();
    const token = await getToken();

    if (!userInfo || !token) throw new Error('User not logged in');

    const userId = userInfo.id;

    const response = await fetch(`${BASE_URL}/favorites/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch wishlist');

    const data = await response.json();
    console.log('Fetched wishlist:', data);

    return data || [];
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return [];
  }
}

export async function isProductInFavorites(productId: number): Promise<boolean> {
  try {
    const userInfo = await getProfileDetails();
    const token = await getToken();

    if (!userInfo || !token) throw new Error('User not logged in');

    const userId = userInfo.id;
     const response = await fetch(`${BASE_URL}/favorites/check/${productId}/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      } });

    if (!response.ok) throw new Error('Failed to check favorite status');
    const data = await response.json();
    console.log('Favorite status:', data);
    return data;
  } catch (error) {
    console.error('Error checking favorites:', error);
    return false;
  }
}

export async function addToFavorite(productId: number): Promise<void> {
  try {
    const userInfo = await getProfileDetails();
    const token = await getToken();

    if (!userInfo || !token) throw new Error('User not logged in');

    const userId = userInfo.id;

    const response = await fetch(`${BASE_URL}/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, userId }),
    });

    if (!response.ok) throw new Error('Failed to add to favorites');
  } catch (error) {
    console.error('Error adding to favorites:', error);
  }
}

export async function removeFromFavorite(productId: number): Promise<void> {
  try {
    const userInfo = await getProfileDetails();
    const token = await getToken();

    if (!userInfo || !token) throw new Error('User not logged in');

    const userId = userInfo.id;

    const response = await fetch(`${BASE_URL}/favorites`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id: productId, userId }),
    });

    if (!response.ok) throw new Error('Failed to remove from favorites');
  } catch (error) {
    console.error('Error removing from favorites:', error);
  }
}
