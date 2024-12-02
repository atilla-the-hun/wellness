import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const Users = () => {
    const { backendUrl, aToken } = useContext(AdminContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [totalUsers, setTotalUsers] = useState(0);

    // Custom debounce function
    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    // Fetch users with search
    const fetchUsers = async (search = '') => {
        setLoading(true);
        try {
            const { data } = await axios.get(
                `${backendUrl}/api/admin/users${search ? `?search=${search}` : ''}`,
                { headers: { aToken } }
            );

            if (data.success) {
                setUsers(data.users);
                setTotalUsers(data.total);
            } else {
                toast.error(data.message || 'Failed to load users');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce((term) => {
            fetchUsers(term);
        }, 500),
        []
    );

    // Handle search input change
    const handleSearchChange = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        debouncedSearch(term);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Registered Users</h1>
                <div className="text-gray-600">
                    Total Users: {totalUsers}
                </div>
            </div>

            {/* Search Box */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search by name or phone number..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            {/* Users List */}
            {loading ? (
                <div className="text-center py-4">Loading users...</div>
            ) : (
                <div className="grid gap-4">
                    {users.length > 0 ? (
                        users.map((user) => (
                            <div
                                key={user._id}
                                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold">{user.name}</h3>
                                        <p className="text-gray-600">{user.phone}</p>
                                        {user.address && (
                                            <p className="text-gray-500 text-sm mt-1">
                                                {user.address.line1}, {user.address.line2}
                                            </p>
                                        )}
                                        {user.dob && (
                                            <p className="text-gray-500 text-sm">
                                                DOB: {new Date(user.dob).toLocaleDateString()}
                                            </p>
                                        )}
                                        {user.gender && (
                                            <p className="text-gray-500 text-sm">
                                                Gender: {user.gender}
                                            </p>
                                        )}
                                    </div>
                                    {user.image && (
                                        <img
                                            src={user.image}
                                            alt={user.name}
                                            className="w-16 h-16 rounded-full object-cover"
                                        />
                                    )}
                                </div>
                                <div className="mt-2 text-sm text-gray-500">
                                    Registered: {new Date(user.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-4 text-gray-500">
                            {searchTerm ? 'No users found matching your search' : 'No users registered yet'}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Users;
