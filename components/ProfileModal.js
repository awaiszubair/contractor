export default function ProfileModal({ user, onClose }) {
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black">
                    ✕
                </button>

                <div className="text-center">
                    <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto flex items-center justify-center text-2xl font-bold text-gray-600 mb-4">
                        {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-full object-cover" /> : user.name[0]}
                    </div>
                    <h2 className="text-2xl font-bold">{user.name}</h2>
                    <p className="text-gray-500 uppercase text-xs font-bold tracking-wider mt-1">{user.role}</p>
                </div>

                <div className="mt-6 space-y-4">
                    <div>
                        <h4 className="text-sm font-bold text-gray-700">Bio / Description</h4>
                        <p className="text-gray-600 text-sm mt-1">{user.description || 'No description provided.'}</p>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-700">Contact</h4>
                        <p className="text-gray-600 text-sm mt-1">{user.email}</p>
                        {user.phone && <p className="text-gray-600 text-sm">{user.phone}</p>}
                    </div>
                    {/* Projects Assigned - Mock logic for now */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-700">Assigned Projects</h4>
                        <p className="text-gray-500 text-sm italic mt-1">No active projects.</p>
                    </div>
                </div>

                <div className="mt-8">
                    <button onClick={onClose} className="w-full py-2 border border-gray-300 rounded hover:bg-gray-50">Close</button>
                </div>
            </div>
        </div>
    );
}
