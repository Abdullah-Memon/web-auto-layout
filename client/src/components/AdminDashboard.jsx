import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ToastContainer, toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import axios from 'axios';

function AdminDashboard() {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
        toast.error('Failed to load components');
      });
  }, []);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    console.log('Drag from:', result.source.index, 'to:', result.destination.index);

    const reorderedComponents = Array.from(components);
    const [movedComponent] = reorderedComponents.splice(result.source.index, 1);
    reorderedComponents.splice(result.destination.index, 0, movedComponent);

    setComponents(reorderedComponents);

    try {
      await axios.post('http://localhost:5000/api/layout', {
        components: reorderedComponents.map((c, index) => ({
          id: c.id,
          position: index,
        })),
      });
      toast.success('Layout saved successfully');
    } catch (error) {
      console.error('Error saving layout:', error);
      setComponents(components); // Revert state on failure
      toast.error('Failed to save layout');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/admin');
    toast.info('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="text-center">
          <ClipLoader color="#3B82F6" size={50} />
          <p className="mt-4 text-gray-600">Loading components...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-gray-50 px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  if (components.length === 0) {
    return (
      <div className="w-full min-h-screen bg-gray-50 px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
        <p className="text-gray-600 text-center">No components available.</p>
      </div>
    );
  }

  return (
    <div className="w-dvw min-h-screen bg-gray-50 px-6 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="components" direction="vertical">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`flex flex-col min-h-[500px] p-4 rounded-lg transition-colors duration-200 ${
                snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-white'
              }`}
              style={{ overflowY: 'auto' }}
            >
              {components.map((comp, index) => (
                <Draggable
                  key={comp.id}
                  draggableId={comp.id.toString()}
                  index={index}
                >
                  {(provided, snapshot) => {
                    // Restrict transform to Y-axis only
                    const style = {
                      ...provided.draggableProps.style,
                      transform: snapshot.isDragging
                        ? provided.draggableProps.style?.transform?.replace(/translate\([^,]+,/, 'translate(0,')
                        : provided.draggableProps.style?.transform,
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease, margin 0.2s ease',
                    };

                    return (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`bg-white border ${
                          snapshot.isDragging ? 'border-blue-300' : 'border-gray-200'
                        } rounded-lg shadow-sm p-4 mb-4 transition-all duration-200 ease-in-out ${
                          snapshot.isDragging
                            ? 'shadow-lg scale-105 bg-blue-50 z-10'
                            : 'hover:shadow-md hover:bg-gray-50'
                        }`}
                        style={style}
                      >
                        <div className="flex items-center">
                          <div
                            {...provided.dragHandleProps}
                            className="mr-4 cursor-grab active:cursor-grabbing"
                          >
                            <svg
                              className="w-6 h-6 text-gray-400 hover:text-gray-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 8h16M4 16h16"
                              />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 capitalize">
                              {comp.type}
                            </h3>
                            {comp.type === 'text' && comp.content && (
                              <div className="mt-2 text-sm text-gray-600">
                                <p>
                                  <strong>Heading:</strong> {comp.content.heading || 'N/A'} (
                                  {comp.content.headingLevel || 'N/A'})
                                </p>
                                <p>
                                  <strong>Paragraph:</strong> {comp.content.paragraph || 'N/A'}
                                </p>
                              </div>
                            )}
                            {comp.type === 'image' && comp.content && (
                              <div className="mt-2">
                                <img
                                  src={comp.content.url || ''}
                                  alt={comp.content.alt || 'Image'}
                                  className="h-16 rounded object-cover"
                                />
                              </div>
                            )}
                            {comp.type === 'video' && comp.content && (
                              <div className="mt-2 text-sm text-gray-600">
                                <p>
                                  <strong>URL:</strong> {comp.content.url || 'N/A'}
                                </p>
                                <p>
                                  <strong>Type:</strong> {comp.content.videoType || 'N/A'}
                                </p>
                              </div>
                            )}
                            {comp.type === 'related_content' && comp.content && (
                              <div className="mt-2 text-sm text-gray-600">
                                <p>
                                  <strong>Title:</strong> {comp.content.title || 'N/A'}
                                </p>
                                <p>
                                  <strong>Keywords:</strong> {comp.keywords || 'None'}
                                </p>
                              </div>
                            )}
                            {comp.type === 'advertisement' && comp.content && (
                              <div className="mt-2">
                                <img
                                  src={comp.content.image || ''}
                                  alt="Ad"
                                  className="h-16 rounded object-cover"
                                />
                                <p className="text-sm text-gray-600">
                                  <strong>Link:</strong> {comp.content.link || 'N/A'}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default AdminDashboard;