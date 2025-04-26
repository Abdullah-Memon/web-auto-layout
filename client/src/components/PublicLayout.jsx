import { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';

function PublicLayout() {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/components')
      .then((response) => {
        console.log('Fetched components:', response.data);
        setComponents(Array.isArray(response.data) ? response.data : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching components:', error);
        setError('Failed to load components. Please try again later.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="text-center">
          <ClipLoader color="#2563EB" size={50} />
          <p className="mt-4 text-gray-600">Loading components...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-gray-50 px-6 py-6">
        <h1 className="text-3xl font-bold text-blue-800 mb-6">Public Page</h1>
        <p className="text-red-500 text-center text-lg">{error}</p>
      </div>
    );
  }

  if (components.length === 0) {
    return (
      <div className="w-full min-h-screen bg-gray-50 px-6 py-6">
        <h1 className="text-3xl font-bold text-blue-800 mb-6">Public Page</h1>
        <p className="text-gray-600 text-center text-lg">No components available.</p>
      </div>
    );
  }

  return (
    <div className="w-dvw min-h-screen bg-gray-50 px-6 py-6">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">Public Page</h1>
      <div id="page" className="space-y-6">
        {components.map((comp) => (
          <div
            key={comp.id}
            className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 transition-all duration-200 hover:shadow-md hover:border-blue-300"
          >
            {comp.type === 'text' && comp.content && (
              <div>
                {comp.content.headingLevel === 'h1' ? (
                  <h1 className="text-2xl font-semibold text-blue-800 mb-2">
                    {comp.content.heading || 'N/A'}
                  </h1>
                ) : comp.content.headingLevel === 'h2' ? (
                  <h2 className="text-xl font-semibold text-blue-800 mb-2">
                    {comp.content.heading || 'N/A'}
                  </h2>
                ) : (
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">
                    {comp.content.heading || 'N/A'}
                  </h3>
                )}
                <p className="text-gray-700">{comp.content.paragraph || 'N/A'}</p>
              </div>
            )}
            {comp.type === 'image' && comp.content && (
              <div className="relative overflow-hidden rounded-lg">
                <img
                  src={comp.content.url || ''}
                  alt={comp.content.alt || 'Image'}
                  className="w-full h-auto rounded-lg transition-transform duration-300 hover:scale-105"
                />
              </div>
            )}
            {comp.type === 'video' && comp.content && (
              <div className="relative">
                {comp.content.videoType === 'embedded' ? (
                  <iframe
                    src={comp.content.url || ''}
                    className="w-full h-64 rounded-lg"
                    allowFullScreen
                    title="Embedded Video"
                  />
                ) : (
                  <video
                    src={comp.content.url || ''}
                    controls
                    className="w-full h-auto rounded-lg"
                  />
                )}
              </div>
            )}
            {comp.type === 'related_content' && comp.content && (
              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  {comp.content.title || 'N/A'}
                </h3>
                <ul className="list-disc pl-5 text-gray-700">
                  {(comp.content.links || []).map((link, index) => (
                    <li key={index}>
                      <a
                        href={link}
                        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
                {comp.keywords && (
                  <p className="text-sm text-gray-500 mt-2">
                    Keywords: {comp.keywords}
                  </p>
                )}
              </div>
            )}
            {comp.type === 'advertisement' && comp.content && (
              <a
                href={comp.content.link || '#'}
                className="block relative overflow-hidden rounded-lg"
              >
                <img
                  src={comp.content.image || ''}
                  alt="Advertisement"
                  className="w-full h-auto rounded-lg transition-transform duration-300 hover:scale-105"
                />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PublicLayout;