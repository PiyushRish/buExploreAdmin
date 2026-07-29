import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../mutations/loginMutation";

const Login = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const { mutateAsync: login, isPending } = useLoginMutation();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Sends identifier (email or phone) + password to POST /api/auth/login
      const data = await login({ identifier, password });

      if (data?.token) {
        localStorage.setItem("token", data.token);
        sessionStorage.setItem("admin_auth_token", data.token);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert(error?.response?.data?.message || "Invalid Email/Phone or Password");
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-900 flex justify-center items-center font-sans">
      <div className="w-[90%] max-w-[420px] bg-white p-8 rounded-2xl shadow-2xl flex flex-col">
        <h1 className="text-3xl font-black text-gray-900 mb-2 text-center">Admin Portal</h1>
        <p className="text-xs text-gray-500 text-center mb-8">BUExplore Control Dashboard</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-5 w-full">
          <div className="space-y-1">
            <Label htmlFor="identifier">Email or Phone Number</Label>
            <Input
              id="identifier"
              type="text"
              placeholder="admin@buexplore.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 font-bold py-3 text-white"
          >
            {isPending ? "Authenticating..." : "Log In"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;