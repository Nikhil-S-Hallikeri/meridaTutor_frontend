const Settings = () => {
    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="flex-none mb-6">
                <h2 className="text-2xl font-medium text-gray-800">Settings</h2>
            </div>
            <div className="flex-1 overflow-auto bg-white rounded-3xl shadow-sm border border-gray-100">
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <p className="text-lg font-medium">General settings and configurations will be available here.</p>
                </div>
            </div>
        </div>
    );
};

export default Settings;
