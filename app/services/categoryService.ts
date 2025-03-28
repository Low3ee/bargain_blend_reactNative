export interface Category {
    id: number;
    name: string;
    createdAt: string;
    createdBy: number;
    updatedAt: string;
    updatedBy: number;
}

const BASE_URL = 'http://localhost:3000/api/category'; // Replace with your actual API URL

export const categoryService = {
    async getCategories(): Promise<Category[]> {
        try {
            const response = await fetch(`${BASE_URL}/`);
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
