'use client'

import React, { useState } from 'react';

function Menu({ onClose }) {
    return (
        // centered box
        <div className="fixed top-0 left-0 w-full h-full bg-gray-500/30 flex items-center justify-center z-50">
            <div className="w-1/3 bg-white p-6 rounded-lg shadow-lg overflow-y-auto z-10 m-5 text-black">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold mb-0">Add Location</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-600 hover:bg-gray-100 transition duration-200 ease-in-out mb-1 p-1 rounded-md"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-black"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Menu;