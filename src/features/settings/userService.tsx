import api from '@/utils/axios';

// User Interfaces
export interface User {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    profile_picture?: string;
    role_id: number;
    role_name?: string;
    status: 'Active' | 'Inactive' | 'Suspended';
    is_archived: number | string; // Change to accept both number and string
    created_at?: string;
    updated_at?: string;
}

export interface UserFormData {
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    password?: string;
    profile_picture?: File | null;
    role_id: number;
    status: 'Active' | 'Inactive' | 'Suspended';
}

export interface ApiResponse<T> {
    isSuccess: boolean;
    message?: string;
    error?: string;
    data?: T;
}

export interface UserListResponse {
    isSuccess: boolean;
    message?: any;
    users: User[];
    pagination: {
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
    };
}

export interface UserResponse {
    isSuccess: boolean;
    user: User;
    message?: any;
}

export interface PaginationParams {
    per_page?: number;
    page?: number;
    search?: string;
    status?: string;
    role_id?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface Role {
    id: number;
    name: string;
    description?: string;
    permissions?: string[];
}

// Main User Service Class
class UserService {
    // Get all users with pagination and filters
    async getAllUsers(params?: PaginationParams): Promise<UserListResponse> {
        try {
            const response = await api.get('/users', { params });
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    // Get user by ID
    async getUserById(id: number): Promise<UserResponse> {
        try {
            const response = await api.get(`/users/${id}`);
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    // Create new user
    async createUser(userData: UserFormData): Promise<UserResponse> {
        try {
            const formData = this.createFormData(userData);

            const response = await api.post('/users/create', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    // Update user
    async updateUser(id: number, userData: Partial<UserFormData>): Promise<UserResponse> {
        try {
            const formData = this.createFormData(userData);

            const response = await api.post(`/update/users/${id}`, formData, {
                headers: {
                    'Accept': 'application-json',
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    // Archive user (soft delete)
    async archiveUser(id: number): Promise<ApiResponse<null>> {
        try {
            const response = await api.post(`/users/${id}/archive`);
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    // Restore archived user
    async restoreUser(id: number): Promise<ApiResponse<null>> {
        try {
            const response = await api.post(`/users/${id}/restore`);
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    // Get archived users
    async getArchivedUsers(params?: PaginationParams): Promise<UserListResponse> {
        try {
            const response = await api.get('/users/archived', { params });
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    // Get roles dropdown
    async getRolesDropdown(): Promise<ApiResponse<Role[]>> {
        try {
            const response = await api.get('/dropdown/roles');
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    // Search users
    async searchUsers(query: string, params?: PaginationParams): Promise<UserListResponse> {
        try {
            const response = await api.get('/users/search', {
                params: { ...params, q: query }
            });
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    // Export users to CSV
    async exportUsers(params?: PaginationParams): Promise<Blob> {
        try {
            const response = await api.get('/users/export', {
                params,
                responseType: 'blob'
            });
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    // Bulk archive users
    async bulkArchiveUsers(userIds: number[]): Promise<ApiResponse<null>> {
        try {
            const response = await api.post('/users/bulk-archive', { user_ids: userIds });
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    // Helper method to create FormData
    private createFormData(data: any): FormData {
        const formData = new FormData();

        Object.keys(data).forEach(key => {
            const value = data[key];
            if (value !== undefined && value !== null && value !== '') {
                if (key === 'profile_picture' && value instanceof File) {
                    formData.append(key, value);
                } else {
                    formData.append(key, String(value));
                }
            }
        });

        return formData;
    }

    // Helper method to handle errors
    private handleError(error: any): Error {
        if (error.response) {
            const { data, status } = error.response;

            if (data?.errors) {
                const errorMessages = Object.values(data.errors).flat().join(', ');
                return new Error(errorMessages);
            }

            if (data?.message) {
                return new Error(data.message);
            }

            return new Error(`Request failed with status ${status}`);
        }

        if (error.request) {
            return new Error('No response received from server. Please check your connection.');
        }

        return new Error(error.message || 'An unexpected error occurred');
    }

    // Utility methods
    static getFullName(user: User): string {
        return `${user.first_name} ${user.last_name}`;
    }

    static getInitials(user: User): string {
        return `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`.toUpperCase();
    }

    // In userService.tsx, update the getRoleName method:
    static getRoleName(roleId: number | string): string {
        const id = typeof roleId === 'string' ? parseInt(roleId) : roleId;
        const roles: Record<number, string> = {
            1: 'Super Admin',
            2: 'Admin',
            3: 'HR Manager',
            4: 'Manager',
            5: 'Employee'
        };
        return roles[id] || 'Unknown Role';
    }

    static isActive(user: User): boolean {
        return user.status === 'Active' && user.is_archived === 0;
    }

    static getStatusColor(status: string): string {
        const colors: Record<string, string> = {
            'Active': 'bg-green-100 text-green-800 hover:bg-green-100',
            'Inactive': 'bg-gray-100 text-gray-800 hover:bg-gray-100',
            'Suspended': 'bg-red-100 text-red-800 hover:bg-red-100'
        };
        return colors[status] || 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }

    static formatDate(dateString?: string): string {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    static formatDateTime(dateString?: string): string {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Create and export a singleton instance
export const userService = new UserService();

// Export hooks
export const useUsers = () => {
    // Your hook implementation here
    return {
        // Hook return values
    };
};