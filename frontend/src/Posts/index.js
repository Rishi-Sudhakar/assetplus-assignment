import React, { useState, useEffect } from 'react';
import './Posts.css';

const API_URL = 'http://localhost:8000';

function Posts() {
    const [posters, setPosters] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [editingPoster, setEditingPoster] = useState(null);
    const [newPoster, setNewPoster] = useState({
        title: '',
        description: '',
        image: null,
        category: '',
        tags: '',
        displayDate: new Date().toISOString().split('T')[0]
    });
    const [newComment, setNewComment] = useState({
        posterId: null,
        text: '',
        author: ''
    });

    useEffect(() => {
        fetchPosters();
    }, []);

    const fetchPosters = async () => {
        try {
            const response = await fetch(`${API_URL}/post`);
            const data = await response.json();
            setPosters(data);
        } catch (error) {
            console.error('Error fetching posters:', error);
        }
    };

    const handleEdit = (poster) => {
        setEditingPoster(poster);
        setNewPoster({
            title: poster.title,
            description: poster.description,
            image: null,
            category: poster.category,
            tags: poster.tags?.join(', ') || '',
            displayDate: poster.displayDate?.split('T')[0] || new Date().toISOString().split('T')[0]
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (posterId) => {
        if (window.confirm('Are you sure you want to delete this poster?')) {
            try {
                const response = await fetch(`${API_URL}/post/${posterId}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    fetchPosters();
                }
            } catch (error) {
                console.error('Error deleting poster:', error);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', newPoster.title);
        formData.append('description', newPoster.description);
        formData.append('category', newPoster.category);
        formData.append('tags', newPoster.tags);
        formData.append('displayDate', newPoster.displayDate);
        
        if (newPoster.image) {
            formData.append('image', newPoster.image);
        }

        try {
            const url = editingPoster 
                ? `${API_URL}/post/${editingPoster._id}`
                : `${API_URL}/post`;
            
            const response = await fetch(url, {
                method: editingPoster ? 'PUT' : 'POST',
                body: formData
            });
            
            if (response.ok) {
                setIsModalOpen(false);
                setNewPoster({
                    title: '',
                    description: '',
                    image: null,
                    category: '',
                    tags: '',
                    displayDate: new Date().toISOString().split('T')[0]
                });
                setEditingPoster(null);
                fetchPosters();
            }
        } catch (error) {
            console.error('Error saving poster:', error);
        }
    };

    const handleLike = async (posterId) => {
        try {
            const response = await fetch(`${API_URL}/post/${posterId}/like`, {
                method: 'POST'
            });
            if (response.ok) {
                fetchPosters();
            }
        } catch (error) {
            console.error('Error liking poster:', error);
        }
    };

    const handleComment = async (posterId) => {
        try {
            const response = await fetch(`${API_URL}/post/${posterId}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: newComment.text,
                    author: newComment.author
                })
            });
            if (response.ok) {
                setNewComment({ posterId: null, text: '', author: '' });
                fetchPosters();
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleFileChange = (e) => {
        setNewPoster({ ...newPoster, image: e.target.files[0] });
    };

    const formatDate = (dateString) => {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit', 
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const handleImageClick = (imageUrl, title) => {
        setSelectedImage({ url: imageUrl, title });
        setIsImagePreviewOpen(true);
    };

    return (
        <div className="posts-container">
            <header>
                <div className="header-content">
                    <h1>Content Gallery</h1>
                    <p>Manage and showcase your posters collection</p>
                </div>
                <button onClick={() => {
                    setEditingPoster(null);
                    setNewPoster({
                        title: '',
                        description: '',
                        image: null,
                        category: '',
                        tags: '',
                        displayDate: new Date().toISOString().split('T')[0]
                    });
                    setIsModalOpen(true);
                }} className="add-button">
                    <span>+</span> Add New Poster
                </button>
            </header>

            <div className="gallery">
                {posters.map((poster) => (
                    <div key={poster._id} className="poster-card">
                        <div className="poster-image">
                            <img 
                                src={`${API_URL}${poster.imageUrl}`} 
                                alt={poster.title}
                                onClick={() => handleImageClick(`${API_URL}${poster.imageUrl}`, poster.title)}
                            />
                            <div className="poster-category">{poster.category}</div>
                            <div className="poster-actions">
                                <button 
                                    className="edit-button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEdit(poster);
                                    }}
                                >
                                    ✏️
                                </button>
                                <button 
                                    className="delete-button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(poster._id);
                                    }}
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                        <div className="poster-info">
                            <h3>{poster.title}</h3>
                            <div className="poster-metadata">
                                <div className="metadata-group">
                                    <span className="date">{formatDate(poster.displayDate || poster.createdAt)}</span>
                                    {poster.tags && poster.tags.length > 0 && (
                                        <div className="tags">
                                            {poster.tags.map((tag, index) => (
                                                <span key={index} className="tag">#{tag}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <p className="description">{poster.description || 'No description provided'}</p>
                            
                            <div className="poster-interactions">
                                <button 
                                    className="like-button"
                                    onClick={() => handleLike(poster._id)}
                                >
                                    ❤️ {poster.likes} Likes
                                </button>
                                
                                <div className="comments-section">
                                    <h4>Comments ({poster.comments?.length || 0})</h4>
                                    <div className="comments-list">
                                        {poster.comments?.map((comment, index) => (
                                            <div key={index} className="comment">
                                                <strong>{comment.author}</strong>
                                                <p>{comment.text}</p>
                                                <span className="comment-date">{formatDate(comment.createdAt)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {newComment.posterId === poster._id ? (
                                        <div className="add-comment">
                                            <input
                                                type="text"
                                                placeholder="Your name"
                                                value={newComment.author}
                                                onChange={(e) => setNewComment({
                                                    ...newComment,
                                                    author: e.target.value
                                                })}
                                            />
                                            <textarea
                                                placeholder="Add a comment..."
                                                value={newComment.text}
                                                onChange={(e) => setNewComment({
                                                    ...newComment,
                                                    text: e.target.value
                                                })}
                                            />
                                            <div className="comment-buttons">
                                                <button onClick={() => handleComment(poster._id)}>Post</button>
                                                <button onClick={() => setNewComment({ posterId: null, text: '', author: '' })}>Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button 
                                            className="add-comment-button"
                                            onClick={() => setNewComment({ ...newComment, posterId: poster._id })}
                                        >
                                            Add Comment
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Image Preview Modal */}
            {isImagePreviewOpen && selectedImage && (
                <div className="modal-overlay" onClick={() => setIsImagePreviewOpen(false)}>
                    <div className="image-preview-modal" onClick={e => e.stopPropagation()}>
                        <button 
                            className="close-button"
                            onClick={() => setIsImagePreviewOpen(false)}
                        >
                            ×
                        </button>
                        <img src={selectedImage.url} alt={selectedImage.title} />
                        <h3>{selectedImage.title}</h3>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>{editingPoster ? 'Edit Poster' : 'Add New Poster'}</h2>
                            <button 
                                className="close-button" 
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setEditingPoster(null);
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Title:</label>
                                <input
                                    type="text"
                                    value={newPoster.title}
                                    onChange={(e) => setNewPoster({ ...newPoster, title: e.target.value })}
                                    placeholder="Enter poster title"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Category:</label>
                                <input
                                    type="text"
                                    value={newPoster.category}
                                    onChange={(e) => setNewPoster({ ...newPoster, category: e.target.value })}
                                    placeholder="Enter poster category"
                                />
                            </div>
                            <div className="form-group">
                                <label>Tags (comma-separated):</label>
                                <input
                                    type="text"
                                    value={newPoster.tags}
                                    onChange={(e) => setNewPoster({ ...newPoster, tags: e.target.value })}
                                    placeholder="Enter tags (e.g., design, art, digital)"
                                />
                            </div>
                            <div className="form-group">
                                <label>Display Date:</label>
                                <input
                                    type="date"
                                    value={newPoster.displayDate}
                                    onChange={(e) => setNewPoster({ ...newPoster, displayDate: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Description:</label>
                                <textarea
                                    value={newPoster.description}
                                    onChange={(e) => setNewPoster({ ...newPoster, description: e.target.value })}
                                    placeholder="Enter poster description"
                                    rows="4"
                                />
                            </div>
                            <div className="form-group">
                                <label>Image:</label>
                                <div className="file-input-container">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-buttons">
                                <button type="submit" className="submit-button">
                                    {editingPoster ? 'Update Poster' : 'Upload Poster'}
                                </button>
                                <button 
                                    type="button" 
                                    className="cancel-button" 
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setEditingPoster(null);
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Posts;
