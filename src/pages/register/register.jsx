import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../lib/api";
import { Button } from "../../components/ui/button";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    loading: false,
    error: null,
    success: null,
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setForm((p) => ({ ...p, error: null, success: null, loading: true }));
    try {
      const res = await api.post("/auth/register", {
        email: form.email,
        name: form.name,
        password: form.password,
      });
      const data = res.data;
      if (data?.success) {
        setForm((p) => ({
          ...p,
          success: "Registered successfully",
          loading: false,
        }));
        setTimeout(() => navigate("/login"), 1200);
      } else {
        setForm((p) => ({
          ...p,
          error: "Registration failed",
          loading: false,
        }));
      }
    } catch (err) {
      setForm((p) => ({
        ...p,
        error: "Request failed",
        loading: false,
      }));
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h1 className="text-2xl mb-4 text-center bold">Register</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            type="text"
            required
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            type="email"
            required
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            value={form.password}
            onChange={(e) =>
              setForm((p) => ({ ...p, password: e.target.value }))
            }
            type="password"
            required
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>
        {form.error && <div className="text-red-600">{form.error}</div>}
        {form.success && <div className="text-green-600">{form.success}</div>}
        <Button type="submit" disabled={form.loading} className="w-full">
          {form.loading ? "Registering..." : "Register"}
        </Button>
      </form>
      <p className="mt-4 text-center">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default Register;
