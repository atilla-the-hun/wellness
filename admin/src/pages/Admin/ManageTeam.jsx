import React, { useState, useEffect, useContext } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { toast } from 'react-toastify';
import axios from 'axios';

const ManageTeam = () => {
    const { backendUrl, aToken } = useContext(AdminContext);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [newMember, setNewMember] = useState({
        title: '',
        altText: '',
        file: null
    });

    // Fetch all team members
    const fetchMembers = async () => {
        try {
            console.log('Fetching team members from:', `${backendUrl}/api/team/members`);
            const { data } = await axios.get(`${backendUrl}/api/team/members`);
            if (data.success) {
                setMembers(data.members);
            } else {
                toast.error(data.message || 'Failed to load team members');
            }
        } catch (error) {
            console.error('Error fetching members:', error);
            toast.error('Failed to load team members');
        }
    };

    useEffect(() => {
        if (backendUrl) {
            fetchMembers();
        }
    }, [backendUrl]);

    // Validate file size and type
    const validateFile = (file) => {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

        if (!file) return { valid: false, error: 'Please select an image' };
        if (file.size > maxSize) return { valid: false, error: 'File size must be less than 10MB' };
        if (!allowedTypes.includes(file.type)) return { valid: false, error: 'Only JPG, PNG, GIF, and WebP images are allowed' };

        return { valid: true };
    };

    // Handle new member upload
    const handleNewMemberSubmit = async (e) => {
        e.preventDefault();

        const fileValidation = validateFile(newMember.file);
        if (!fileValidation.valid) {
            toast.error(fileValidation.error);
            return;
        }

        if (!newMember.title.trim() || !newMember.altText.trim()) {
            toast.error('Title and alt text are required');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('title', newMember.title.trim());
            formData.append('altText', newMember.altText.trim());
            formData.append('image', newMember.file);

            const { data } = await axios.post(
                `${backendUrl}/api/team/admin/add`,
                formData,
                { 
                    headers: {
                        'token': aToken,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (data.success) {
                toast.success('Team member added successfully');
                setNewMember({ title: '', altText: '', file: null });
                // Reset file input
                const fileInput = document.querySelector('input[type="file"]');
                if (fileInput) fileInput.value = '';
                fetchMembers();
            } else {
                toast.error(data.message || 'Failed to add team member');
            }
        } catch (error) {
            console.error('Error adding team member:', error);
            toast.error(error.response?.data?.message || 'Failed to add team member');
        } finally {
            setLoading(false);
        }
    };

    // Handle member update
    const handleUpdateMember = async (e) => {
        e.preventDefault();
        
        if (!editingMember.title.trim() || !editingMember.altText.trim()) {
            toast.error('Title and alt text are required');
            return;
        }

        if (editingMember.newFile) {
            const fileValidation = validateFile(editingMember.newFile);
            if (!fileValidation.valid) {
                toast.error(fileValidation.error);
                return;
            }
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('title', editingMember.title.trim());
            formData.append('altText', editingMember.altText.trim());
            if (editingMember.newFile) {
                formData.append('image', editingMember.newFile);
            }

            const { data } = await axios.put(
                `${backendUrl}/api/team/admin/update/${editingMember._id}`,
                formData,
                {
                    headers: {
                        'token': aToken,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (data.success) {
                toast.success('Team member updated successfully');
                setEditingMember(null);
                fetchMembers();
            } else {
                toast.error(data.message || 'Failed to update team member');
            }
        } catch (error) {
            console.error('Error updating team member:', error);
            toast.error(error.response?.data?.message || 'Failed to update team member');
        } finally {
            setLoading(false);
        }
    };

    // Handle member deletion
    const handleDeleteMember = async (id) => {
        if (!window.confirm('Are you sure you want to delete this team member?')) return;

        try {
            const { data } = await axios.delete(
                `${backendUrl}/api/team/admin/delete/${id}`,
                {
                    headers: { 'token': aToken }
                }
            );

            if (data.success) {
                toast.success('Team member deleted successfully');
                fetchMembers();
            } else {
                toast.error(data.message || 'Failed to delete team member');
            }
        } catch (error) {
            console.error('Error deleting team member:', error);
            toast.error(error.response?.data?.message || 'Failed to delete team member');
        }
    };

    // Handle drag and drop reordering
    const handleDragEnd = async (result) => {
        if (!result.destination) return;

        const items = Array.from(members);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setMembers(items);

        try {
            const { data } = await axios.put(
                `${backendUrl}/api/team/admin/reorder`,
                { memberIds: items.map(item => item._id) },
                {
                    headers: { 'token': aToken }
                }
            );

            if (!data.success) {
                toast.error(data.message || 'Failed to save new order');
                fetchMembers(); // Revert to original order
            }
        } catch (error) {
            console.error('Error reordering team members:', error);
            toast.error(error.response?.data?.message || 'Failed to save new order');
            fetchMembers(); // Revert to original order
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6">Manage Team</h1>

            {/* Add New Member Form */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <h2 className="text-xl font-semibold mb-4">Add New Team Member</h2>
                <form onSubmit={handleNewMemberSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1">Name</label>
                        <input
                            type="text"
                            value={newMember.title}
                            onChange={(e) => setNewMember({ ...newMember, title: e.target.value })}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Role/Description</label>
                        <input
                            type="text"
                            value={newMember.altText}
                            onChange={(e) => setNewMember({ ...newMember, altText: e.target.value })}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Photo (Max 10MB)</label>
                        <input
                            type="file"
                            onChange={(e) => setNewMember({ ...newMember, file: e.target.files[0] })}
                            className="w-full p-2 border rounded"
                            accept="image/*"
                            required
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Supported formats: JPG, PNG, GIF, WebP
                        </p>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                    >
                        {loading ? 'Adding...' : 'Add Team Member'}
                    </button>
                </form>
            </div>

            {/* Team Members List */}
            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="team">
                    {(provided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-4"
                        >
                            {members.map((member, index) => (
                                <Draggable
                                    key={member._id}
                                    draggableId={member._id}
                                    index={index}
                                >
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className="bg-white p-4 rounded-lg shadow"
                                        >
                                            <div className="items-start gap-4">
                                                <img
                                                    src={member.imageUrl}
                                                    alt={member.altText}
                                                    className="w-24 h-24 object-cover rounded"
                                                />
                                                <div className="flex-1">
                                                    <h3 className="font-semibold">{member.title}</h3>
                                                    <p className="text-gray-600">{member.altText}</p>
                                                </div>
                                            </div>
                                            {editingMember?._id === member._id ? (
                                                <form onSubmit={handleUpdateMember} className="mt-4 space-y-2">
                                                    <input
                                                        type="text"
                                                        value={editingMember.title}
                                                        onChange={(e) => setEditingMember({
                                                            ...editingMember,
                                                            title: e.target.value
                                                        })}
                                                        className="w-full p-2 border rounded"
                                                        required
                                                    />
                                                    <input
                                                        type="text"
                                                        value={editingMember.altText}
                                                        onChange={(e) => setEditingMember({
                                                            ...editingMember,
                                                            altText: e.target.value
                                                        })}
                                                        className="w-full p-2 border rounded"
                                                        required
                                                    />
                                                    <input
                                                        type="file"
                                                        onChange={(e) => setEditingMember({
                                                            ...editingMember,
                                                            newFile: e.target.files[0]
                                                        })}
                                                        className="w-full p-2 border rounded"
                                                        accept="image/*"
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="submit"
                                                            disabled={loading}
                                                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-green-300"
                                                        >
                                                            {loading ? 'Saving...' : 'Save'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingMember(null)}
                                                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <div className="mt-4 space-y-2">
                                                    <div>
                                                        <button
                                                            onClick={() => setEditingMember(member)}
                                                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                                        >
                                                            Edit
                                                        </button>
                                                    </div>
                                                    <div>
                                                        <button
                                                            onClick={() => handleDeleteMember(member._id)}
                                                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};

export default ManageTeam;
