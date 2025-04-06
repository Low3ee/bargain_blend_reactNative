const API_BASE_URL = "http://localhost:3000/api/addresses";

class AddressService {
  // Create a new address
  async createAddress(addressData: {
    userId: number;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    status: "active";
    primary?: boolean; // Optional primary field
  }) {
    try {
      // If the address is marked as primary, set others to not primary
      if (addressData.primary) {
        await this.updateOtherAddressesToNotPrimary(addressData.userId);
      }

      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addressData),
      });

      if (!response.ok) {
        throw new Error("Failed to create address");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating address:", error);
      throw error;
    }
  }

  // Helper method to update other addresses to not primary
  async updateOtherAddressesToNotPrimary(userId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/update-primary/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ primary: false }),
      });

      if (!response.ok) {
        throw new Error("Failed to update other addresses");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating other addresses:", error);
      throw error;
    }
  }

  // Get all addresses for a specific user
  async getAddressesByUserId(userId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${userId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch addresses");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching addresses:", error);
      throw error;
    }
  }

  // Get a specific address by ID
  async getAddressById(id: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch address");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching address:", error);
      throw error;
    }
  }

  // Update an existing address by ID
  async updateAddress(id: number, addressData: {
    userId: number;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    status: "PRIMARY" | "RESERVE";
    primary?: boolean;
  }) {
    try {
      // If the address is set to primary, update other addresses to not primary
      if (addressData.primary) {
        await this.updateOtherAddressesToNotPrimary(addressData.userId);
      }

      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addressData),
      });

      if (!response.ok) {
        throw new Error("Failed to update address");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating address:", error);
      throw error;
    }
  }

  // Delete an address by ID
  async deleteAddress(id: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete address");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error deleting address:", error);
      throw error;
    }
  }
}

export default new AddressService();
