export default function UserCard({ user, onViewProfile }) {
    return (
        <div className="bg-white p-4 rounded shadow-sm border border-gray-100 flex justify-between items-center w-full">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                    {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-full object-cover" /> : user.name[0]}
                </div>
                <div>
                    <h3 className="font-bold">{user.name}</h3>
                    <p className="text-xs text-gray-500">{user.email}</p>
                </div>
            </div>
            <button
                onClick={() => onViewProfile(user)}
                className="px-3 py-1 bg-[#0000001F] text-black text-sm rounded hover:bg-gray-200 transition-colors"
            >
                View Profile
            </button>
        </div>
    );
}
