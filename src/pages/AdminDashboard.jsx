import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from '../integrations/supabase';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ email: '', password: '', isAdmin: false });
  const [updateUser, setUpdateUser] = useState({ id: '', email: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) {
      setMessage(`Error fetching users: ${error.message}`);
    } else {
      setUsers(users);
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.admin.createUser({
      email: newUser.email,
      password: newUser.password,
      app_metadata: { is_admin: newUser.isAdmin }
    });
    if (error) {
      setMessage(`Error creating user: ${error.message}`);
    } else {
      setMessage('User created successfully');
      fetchUsers();
      setNewUser({ email: '', password: '', isAdmin: false });
    }
  };

  const updateUserEmail = async (e) => {
    e.preventDefault();
    const { data: user, error } = await supabase.auth.admin.updateUserById(
      updateUser.id,
      { email: updateUser.email }
    );
    if (error) {
      setMessage(`Error updating user: ${error.message}`);
    } else {
      setMessage('User updated successfully');
      fetchUsers();
      setUpdateUser({ id: '', email: '' });
    }
  };

  const deleteUser = async (userId) => {
    const { data, error } = await supabase.auth.admin.deleteUser(userId);
    if (error) {
      setMessage(`Error deleting user: ${error.message}`);
    } else {
      setMessage('User deleted successfully');
      fetchUsers();
    }
  };

  const deleteMfaFactor = async (factorId, userId) => {
    const { data, error } = await supabase.auth.admin.deleteFactor({
      id: factorId,
      userId: userId,
    });
    if (error) {
      setMessage(`Error deleting MFA factor: ${error.message}`);
    } else {
      setMessage('MFA factor deleted successfully');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <h2 className="text-xl font-semibold mb-4">Create New User</h2>
          <form onSubmit={createUser} className="space-y-4">
            <div>
              <Label htmlFor="newEmail">Email</Label>
              <Input
                id="newEmail"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="newPassword">Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                required
              />
            </div>
            <div>
              <Label>
                <Input
                  type="checkbox"
                  checked={newUser.isAdmin}
                  onChange={(e) => setNewUser({...newUser, isAdmin: e.target.checked})}
                />
                Is Admin
              </Label>
            </div>
            <Button type="submit">Create User</Button>
          </form>

          <h2 className="text-xl font-semibold mt-8 mb-4">Update User Email</h2>
          <form onSubmit={updateUserEmail} className="space-y-4">
            <div>
              <Label htmlFor="updateUserId">User ID</Label>
              <Input
                id="updateUserId"
                type="text"
                value={updateUser.id}
                onChange={(e) => setUpdateUser({...updateUser, id: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="updateEmail">New Email</Label>
              <Input
                id="updateEmail"
                type="email"
                value={updateUser.email}
                onChange={(e) => setUpdateUser({...updateUser, email: e.target.value})}
                required
              />
            </div>
            <Button type="submit">Update User Email</Button>
          </form>

          <h2 className="text-xl font-semibold mt-8 mb-4">User List</h2>
          {users.map((user) => (
            <div key={user.id} className="border p-4 mb-4 rounded">
              <p>Email: {user.email}</p>
              <p>Admin: {user.app_metadata?.is_admin ? 'Yes' : 'No'}</p>
              <Button onClick={() => deleteUser(user.id)} variant="destructive" className="mt-2">Delete User</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {message && <p className="text-center mt-4 text-red-500">{message}</p>}
    </div>
  );
};

export default AdminDashboard;