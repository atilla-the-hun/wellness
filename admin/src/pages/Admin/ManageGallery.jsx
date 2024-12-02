import React, { useState, useEffect, useContext } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { toast } from 'react-toastify';
import axios from 'axios';

const ManageGallery = () => {
    const { backendUrl, aToken } = useContext(AdminContext);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingImage, setEditingImage] = useState(null);
    const [newImage, setNewImage] = useState({
        title: '',
        altText: '',
        file: null
    });

    // Fetch all gallery images
    const fetchImages = async () => {
        try {
            console.log('Fetching gallery images from:', `${backendUrl}/api/gallery/images`);
            const { data } = await axios.get(`${backendUrl}/api/gallery/images`);
            if (data.success) {
                setImages(data.images);
            } else {
                toast.error(data.message || 'Failed to load gallery images');
            }
        } catch (error) {
            console.error('Error fetching images:', error);
            toast.error('Failed to load gallery images');
        }
    };

    useEffect(() => {
        if (backendUrl) {
            fetchImages();
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

    // Handle new image upload
    const handleNewImageSubmit = async (e) => {
        e.preventDefault();

        const fileValidation = validateFile(newImage.file);
        if (!fileValidation.valid) {
            toast.error(fileValidation.error);
            return;
        }

        if (!newImage.title.trim() || !newImage.altText.trim()) {
            toast.error('Title and alt text are required');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('title', newImage.title.trim());
            formData.append('altText', newImage.altText.trim());
            formData.append('image', newImage.file);

            const { data } = await axios.post(
                `${backendUrl}/api/gallery/admin/add`,
                formData,
                { 
                    headers: {
                        'token': aToken,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (data.success) {
                toast.success('Image added successfully');
                setNewImage({ title: '', altText: '', file: null });
                // Reset file input
                const fileInput = document.querySelector('input[type="file"]');
                if (fileInput) fileInput.value = '';
                fetchImages();
            } else {
                toast.error(data.message || 'Failed to add image');
            }
        } catch (error) {
            console.error('Error adding image:', error);
            toast.error(error.response?.data?.message || 'Failed to add image');
        } finally {
            setLoading(false);
        }
    };

    // Handle image update
    const handleUpdateImage = async (e) => {
        e.preventDefault();
        
        if (!editingImage.title.trim() || !editingImage.altText.trim()) {
            toast.error('Title and alt text are required');
            return;
        }

        if (editingImage.newFile) {
            const fileValidation = validateFile(editingImage.newFile);
            if (!fileValidation.valid) {
                toast.error(fileValidation.error);
                return;
            }
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('title', editingImage.title.trim());
            formData.append('altText', editingImage.altText.trim());
            if (editingImage.newFile) {
                formData.append('image', editingImage.newFile);
            }

            const { data } = await axios.put(
                `${backendUrl}/api/gallery/admin/update/${editingImage._id}`,
                formData,
                {
                    headers: {
                        'token': aToken,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (data.success) {
                toast.success('Image updated successfully');
                setEditingImage(null);
                fetchImages();
            } else {
                toast.error(data.message || 'Failed to update image');
            }
        } catch (error) {
            console.error('Error updating image:', error);
            toast.error(error.response?.data?.message || 'Failed to update image');
        } finally {
            setLoading(false);
        }
    };

    // Handle image deletion
    const handleDeleteImage = async (id) => {
        if (!window.confirm('Are you sure you want to delete this image?')) return;

        try {
            const { data } = await axios.delete(
                `${backendUrl}/api/gallery/admin/delete/${id}`,
                {
                    headers: { 'token': aToken }
                }
            );

            if (data.success) {
                toast.success('Image deleted successfully');
                fetchImages();
            } else {
                toast.error(data.message || 'Failed to delete image');
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            toast.error(error.response?.data?.message || 'Failed to delete image');
        }
    };

    // Handle drag and drop reordering
    const handleDragEnd = async (result) => {
        if (!result.destination) return;

        const items = Array.from(images);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setImages(items);

        try {
            const { data } = await axios.put(
                `${backendUrl}/api/gallery/admin/reorder`,
                { imageIds: items.map(item => item._id) },
                {
                    headers: { 'token': aToken }
                }
            );

            if (!data.success) {
                toast.error(data.message || 'Failed to save new order');
                fetchImages(); // Revert to original order
            }
        } catch (error) {
            console.error('Error reordering images:', error);
            toast.error(error.response?.data?.message || 'Failed to save new order');
            fetchImages(); // Revert to original order
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6">Manage Gallery</h1>

            {/* Add New Image Form */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <h2 className="text-xl font-semibold mb-4">Add New Image</h2>
                <form onSubmit={handleNewImageSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1">Title</label>
                        <input
                            type="text"
                            value={newImage.title}
                            onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Alt Text</label>
                        <input
                            type="text"
                            value={newImage.altText}
                            onChange={(e) => setNewImage({ ...newImage, altText: e.target.value })}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Image (Max 10MB)</label>
                        <input
                            type="file"
                            onChange={(e) => setNewImage({ ...newImage, file: e.target.files[0] })}
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
                        {loading ? 'Adding...' : 'Add Image'}
                    </button>
                </form>
            </div>

            {/* Gallery Images List */}
            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="gallery">
                    {(provided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-4"
                        >
                            {images.map((image, index) => (
                                <Draggable
                                    key={image._id}
                                    draggableId={image._id}
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
                                                    src={image.imageUrl}
                                                    alt={image.altText}
                                                    className="w-24 h-24 object-cover rounded"
                                                />
                                                <div className="flex-1">
                                                    <h3 className="font-semibold">{image.title}</h3>
                                                    <p className="text-gray-600">{image.altText}</p>
                                                </div>
                                            </div>
                                            {editingImage?._id === image._id ? (
                                                <form onSubmit={handleUpdateImage} className="mt-4 space-y-2">
                                                    <input
                                                        type="text"
                                                        value={editingImage.title}
                                                        onChange={(e) => setEditingImage({
                                                            ...editingImage,
                                                            title: e.target.value
                                                        })}
                                                        className="w-full p-2 border rounded"
                                                        required
                                                    />
                                                    <input
                                                        type="text"
                                                        value={editingImage.altText}
                                                        onChange={(e) => setEditingImage({
                                                            ...editingImage,
                                                            altText: e.target.value
                                                        })}
                                                        className="w-full p-2 border rounded"
                                                        required
                                                    />
                                                    <input
                                                        type="file"
                                                        onChange={(e) => setEditingImage({
                                                            ...editingImage,
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
                                                            onClick={() => setEditingImage(null)}
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
                                                            onClick={() => setEditingImage(image)}
                                                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                                        >
                                                            Edit
                                                        </button>
                                                    </div>
                                                    <div>
                                                        <button
                                                            onClick={() => handleDeleteImage(image._id)}
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

export default ManageGallery;
