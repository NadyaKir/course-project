import { useState } from "react";
import axios from "axios";
import { SERVER_URL } from "../utils/config";

export const useFetchUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);

  const fetchUsers = async (currentPage, pageSize, searchText) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${SERVER_URL}/api/users/getUsers`, {
        params: {
          page: currentPage,
          pageSize: pageSize,
          search: searchText,
        },
      });

      const users = response.data.users;
      const totalUsers = response.data.totalUsers;

      setUsers(users);
      setTotalUsers(totalUsers);
      setIsLoading(false);
    } catch (error) {
      console.error("Error get users: ", error);
      setError(error);
      setIsLoading(false);
    }
  };

  return {
    users,
    setUsers,
    fetchUsers,
    totalUsers,
    isLoading,
    error,
  };
};
