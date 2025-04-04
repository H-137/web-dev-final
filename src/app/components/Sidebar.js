import React from "react";




const Sidebar = ({ studySpace, onClose }) => {
 // Ensure studySpace exists before rendering
 if (!studySpace) return null;


 return (
   <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-lg p-6 overflow-y-auto">
     {/* Close button */}
     <button onClick={onClose} className="text-gray-600 text-2xl float-right">
       ✖
     </button>


     {/* Study Space Name */}
     <h2 className="text-2xl font-bold mb-2">{studySpace.name}</h2>


     {/* Study Space Image */}
     {studySpace.image && (
       <img
         src={studySpace.image}
         alt={studySpace.name}
         className="w-full h-40 object-cover rounded-lg mb-4"
       />
     )}


     {/* General Rating */}
     <div className="mb-4">
       <span className="text-lg font-semibold">Overall Rating: </span>
       <span>{studySpace.generalRating}</span>/100
     </div>


     {/* Amenities & Ratings */}
     <h3 className="text-lg font-semibold mb-2">Amenities</h3>
     <ul className="list-none space-y-2">
       {studySpace.amenities?.map((amenity, index) => (
         <li key={index} className="flex justify-between items-center">
           <span>{amenity.name}</span>
         </li>
       ))}
     </ul>


     {/* Featured Review */}
     {studySpace.featuredReview && (
       <>
         <h3 className="text-lg font-semibold mt-4 mb-2">Featured Review</h3>
         <blockquote className="italic text-gray-600 border-l-4 border-blue-500 pl-4">
           "{studySpace.featuredReview}"
         </blockquote>


         {/* Stars next to the featured review */}
         <div className="mt-2 flex items-center">
           <span className="text-yellow-500">
             {"⭐".repeat(5)} {/* Display 5 stars for now */}
           </span>
         </div>
       </>
     )}
   </div>
 );
};


export default Sidebar;
