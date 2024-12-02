import React, { useState, useEffect, useContext } from 'react';
import { assets } from '../assets/assets';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Team = () => {
    const { backendUrl } = useContext(AppContext);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeamMembers = async () => {
            if (!backendUrl) {
                console.error('Backend URL not available');
                setLoading(false);
                return;
            }

            try {
                console.log('Fetching team members from:', `${backendUrl}/api/team/members`);
                const { data } = await axios.get(`${backendUrl}/api/team/members`);
                console.log('Team response:', data);
                
                if (data.success) {
                    setMembers(data.members);
                } else {
                    console.error('Failed to load members:', data.message);
                    toast.error(data.message || 'Failed to load team members');
                }
            } catch (error) {
                console.error('Error fetching team members:', error);
                toast.error('Error loading team members');
            } finally {
                setLoading(false);
            }
        };

        fetchTeamMembers();
    }, [backendUrl]);

    // Default members to show if no members from backend or while loading
    const defaultMembers = [
        { imageUrl: assets.doc1, altText: "Team Member 1", title: "Sarah Johnson" },
        { imageUrl: assets.doc2, altText: "Team Member 2", title: "Michael Chen" },
        { imageUrl: assets.doc3, altText: "Team Member 3", title: "Emily Davis" },
        { imageUrl: assets.doc4, altText: "Team Member 4", title: "David Wilson" },
        { imageUrl: assets.doc5, altText: "Team Member 5", title: "Jessica Brown" },
        { imageUrl: assets.doc6, altText: "Team Member 6", title: "James Taylor" }
    ];

    // Use backend members if available, otherwise use default members
    const displayMembers = members.length > 0 ? members : defaultMembers;

    // Split members into two rows
    const firstRow = displayMembers.slice(0, 3);
    const secondRow = displayMembers.slice(3, 6);

    return (
        <section className="py-16 bg-black">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-medium text-center mb-2 text-white">Our Team</h2>
                <p className='text-center text-sm text-white mb-8'>Meet our friendly, experienced team.</p>
                
                <div className='flex flex-col items-center gap-6'>
                    {/* First Row */}
                    <div className='flex flex-col md:flex-row gap-6 w-full justify-center'>
                        {firstRow.map((member, index) => (
                            <div 
                                key={index} 
                                className={`w-full md:w-1/3 max-w-[370px] transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}
                            >
                                <div className="relative overflow-hidden rounded-lg shadow-lg">
                                    <img
                                        className='w-full h-auto rounded-lg transform hover:scale-105 transition-transform duration-300 text-white'
                                        src={member.imageUrl}
                                        alt={member.altText}
                                        onError={(e) => {
                                            console.error('Error loading image:', member.imageUrl);
                                            e.target.onerror = null;
                                            e.target.src = assets.doc1; // Fallback image
                                        }}
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 flex items-center justify-center">
                                        <h3 className="text-lg font-semibold">{member.title}</h3>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Second Row */}
                    <div className='flex flex-col md:flex-row gap-6 w-full justify-center'>
                        {secondRow.map((member, index) => (
                            <div 
                                key={index} 
                                className={`w-full md:w-1/3 max-w-[370px] transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}
                            >
                                <div className="relative overflow-hidden rounded-lg shadow-lg">
                                    <img
                                        className='w-full h-auto rounded-lg transform hover:scale-105 transition-transform duration-300 text-white'
                                        src={member.imageUrl}
                                        alt={member.altText}
                                        onError={(e) => {
                                            console.error('Error loading image:', member.imageUrl);
                                            e.target.onerror = null;
                                            e.target.src = assets.doc1; // Fallback image
                                        }}
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 flex items-center justify-center">
                                        <h3 className="text-lg font-semibold">{member.title}</h3>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Team;
