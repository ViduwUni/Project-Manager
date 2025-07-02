const SplashScreen = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
      <h1 className="text-3xl font-bold mb-4">PROJECT MANAGER</h1>
      <div className="flex items-center space-x-1">
        <span className="dot bounce1">.</span>
        <span className="dot bounce2">.</span>
        <span className="dot bounce3">.</span>
      </div>
    </div>
  );
};

export default SplashScreen;