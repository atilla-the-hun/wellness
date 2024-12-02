import React, { useState, useEffect, useContext } from 'react';
import { assets } from '../assets/assets';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Gallery = () => {
    const { backendUrl } = useContext(AppContext);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGalleryImages = async () => {
            if (!backendUrl) {
                console.error('Backend URL not available');
                setLoading(false);
                return;
            }

            try {
                console.log('Fetching gallery images from:', `${backendUrl}/api/gallery/images`);
                const { data } = await axios.get(`${backendUrl}/api/gallery/images`);
                console.log('Gallery response:', data);
                
                if (data.success) {
                    setImages(data.images);
                } else {
                    console.error('Failed to load images:', data.message);
                    toast.error(data.message || 'Failed to load gallery images');
                }
            } catch (error) {
                console.error('Error fetching gallery images:', error);
                toast.error('Error loading gallery images');
            } finally {
                setLoading(false);
            }
        };

        fetchGalleryImages();
    }, [backendUrl]);

    // Default images to show if no images from backend or while loading
    const defaultImages = [
        { imageUrl: assets.Foot, altText: "Foot Massage" },
        { imageUrl: assets.Soak, altText: "Soak Off" },
        { imageUrl: assets.Facial_Wax, altText: "Facial Wax" },
        { imageUrl: assets.Aromatherapy, altText: "Aromatherapy" },
        { imageUrl: assets.Soft_Gel_Tips, altText: "Soft Gel Tips" },
        { imageUrl: assets.Peel, altText: "Regima Initiation Peel" }
    ];

    // Use backend images if available, otherwise use default images
    const displayImages = images.length > 0 ? images : defaultImages;

    // Split images into two rows
    const firstRow = displayImages.slice(0, 3);
    const secondRow = displayImages.slice(3, 6);

    return (
        <section className="w-full">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-medium text-center mb-2 text-white">Treatment Gallery</h2>
                <p className='text-center text-sm text-white mb-8'>Our treatments in progress.</p>
                <div className='flex flex-col items-center gap-6'>
                    {/* First Row */}
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6 w-full'>
                        {firstRow.map((image, index) => (
                            <div 
                                key={index} 
                                className={`w-full transition-all duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}
                            >
                                <div className="relative h-full overflow-hidden rounded-lg shadow-lg bg-gray-100">
                                    <img
                                        className='w-full h-full object-cover transform hover:scale-105 transition-transform duration-300'
                                        src={image.imageUrl}
                                        alt={image.altText}
                                        onError={(e) => {
                                            console.error('Error loading image:', image.imageUrl);
                                            e.target.onerror = null;
                                            e.target.src = assets.Foot; // Fallback image
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Second Row */}
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6 w-full'>
                        {secondRow.map((image, index) => (
                            <div 
                                key={index} 
                                className={`w-full transition-all duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}
                            >
                                <div className="relative h-full overflow-hidden rounded-lg shadow-lg bg-gray-100">
                                    <img
                                        className='w-full h-full object-cover transform hover:scale-105 transition-transform duration-300'
                                        src={image.imageUrl}
                                        alt={image.altText}
                                        onError={(e) => {
                                            console.error('Error loading image:', image.imageUrl);
                                            e.target.onerror = null;
                                            e.target.src = assets.Foot; // Fallback image
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Gallery;
