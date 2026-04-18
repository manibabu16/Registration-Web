import { useState } from "react";
import { useNavigate } from "react-router-dom";


function Login() {
  const [activeTab, setActiveTab] = useState("login");
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

const handleLogin = (e) => {
  e.preventDefault(); // prevent page reload

  // Demo login check
  if (email === "teacher@school.com" && password === "1234") {
    const userData = {
      name: "Mr. Mani",
      email: email,
    };

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", "demo-token");

    navigate("/dashboard");
  } else {
    alert("Invalid email or password");
  }
};
  

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#11142a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center">
            🎓
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-400">EduTrack</h1>
            <p className="text-sm text-gray-400">Student Management System</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#0f1735] p-1 rounded-lg mb-6">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-2 rounded-md text-sm transition ${
              activeTab === "login"
                ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                : "text-gray-400"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`flex-1 py-2 rounded-md text-sm transition ${
              activeTab === "register"
                ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                : "text-gray-400"
            }`}
          >
            Register
          </button>
        </div>

        {/* 🔐 LOGIN FORM */}
        {activeTab === "login" && (
          <form className="space-y-4" onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email Address"
              className="w-full px-4 py-3 text-gray-300 bg-[#0f1735] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-gray-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}    
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 text-gray-300 focus:text-white bg-[#0f1735] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-gray-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90 transition"
            >
              Sign In →
            </button>
          </form>
        )}

        {/* 📝 REGISTER FORM */}
        {activeTab === "register" && (
          <form className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              className="w-full px-4 py-3 bg-[#0f1735] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-gray-400"
            />

            <input
              type="email"
              placeholder="Email Address"
              className="w-full px-4 py-3 bg-[#0f1735] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-gray-400"
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 bg-[#0f1735] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-gray-400"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full px-4 py-3 bg-[#0f1735] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-gray-400"
            />

            <button className="w-full py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90 transition ">
              Create Account →
            </button>
          </form>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-4">
          {activeTab === "login"
            ? "Demo: teacher@school.com / 1234"
            : "Create a new account to get started"}
        </p>
      </div>
    </div>
  );
}

export default Login;
