import { API } from "@/services/config";

export interface Category {
    id: number;
    name: string;
    createdAt: string;
    createdBy: number;
    updatedAt: string;
    updatedBy: number;
}

const API_URL = `${API}/category`;
  
export const categoryService = {
    async getCategories(): Promise<Category[]> {
        try {
            const response = await fetch(`${API_URL}/`);
            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }
            const data: Category[] = await response.json();
            console.log(data);
            return data;
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw new Error('Failed to fetch categories');
        }
    },
};
