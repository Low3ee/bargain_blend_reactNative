import { getUserInfoField } from "../utils/profileUtil";

const API_BASE_URL = "http://localhost:3000/api/address";

class AddressService {
  // Create a new address
  async createAddress(addressData: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    status: "PRIMARY";
    primary?: boolean;
  }) {
    try {
      const userId = await getUserInfoField("id");

      if (!userId) {
        throw new Error("User ID not found in storage.");
      }

      // If the address is marked as primary, update others to not primary
      if (addressData.primary) {
        await this.updateOtherAddressesToNotPrimary(userId);
      }

      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...addressData, userId }),
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

  

  async updateAddress(
    id: number,
    addressData: {
      userId?: number;
      street: string;
      city: string;
      state: string;
      zip: string;
      country: string;
      status: "PRIMARY" | "RESERVE";
      primary?: boolean;
    }
  ) {
    try {
      const userId = addressData.userId ?? (await getUserInfoField("id"));

      if (!userId) {
        throw new Error("User ID not found in storage.");
      }

      if (addressData.primary) {
        await this.updateOtherAddressesToNotPrimary(userId);
      }

      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...addressData, userId }),
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
