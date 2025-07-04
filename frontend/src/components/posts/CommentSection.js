import React, { useState } from 'react';
import postService from '../../services/postService';
import toast from 'react-hot-toast';
import { PaperAirplaneIcon, TrashIcon } from '@heroicons/react/24/solid';
import { formatDistanceToNowStrict } from 'date-fns';
import useAuth from '../../hooks/useAuth';

export default function CommentSection({ postId, comments: initialComments, onCommentPosted }) {
    const { user, isAdmin } = useAuth();
    const [comments, setComments] = useState(initialComments || []);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setLoading(true);
        try {
            const res = await postService.addComment(postId, { text: newComment });
            setComments(res.data.data);
            setNewComment('');
        } catch (error) {
            toast.error('Failed to post comment.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-5 bg-gray-50">
            <form onSubmit={handleSubmit} className="flex items-center space-x-3 mb-4">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button type="submit" disabled={loading} className="p-2 bg-primary rounded-full text-white hover:bg-primary-dark disabled:bg-primary-light transition-colors">
                    <PaperAirplaneIcon className="w-5 h-5" />
                </button>
            </form>

            <div className="space-y-3">
                {comments
                    .slice()
                    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                    .map(comment => {
                        const canDelete = user?._id === comment.user || isAdmin;
                        return (
                            <div key={comment._id} className="bg-white p-3 rounded-lg shadow-sm group relative">
                                <div className="flex justify-between items-baseline">
                                    <p className="font-bold text-sm text-on-surface">{comment.name}</p>
                                    <p className="text-xs text-muted">{formatDistanceToNowStrict(new Date(comment.createdAt))} ago</p>
                                </div>
                                <p className="text-on-surface mt-1">{comment.text}</p>
                                {canDelete && (
                                    <button onClick={() => { /* handleDeleteComment logic would go here */ }} className="absolute top-2 right-2 p-1 text-gray-400 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-opacity">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        )
                    })}
            </div>
        </div>
    );
}
